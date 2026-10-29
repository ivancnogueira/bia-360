import { prisma } from "../db/prisma";
import {
  AddOrderItemInput,
  AddOrderItemSchema,
  CloseOrderInput,
  CloseOrderSchema,
  OpenOrderInput,
  OpenOrderSchema,
} from "../validators/order.schema";
import { AuditService } from "./AuditService";

export class OrderService {
  /**
   * Abre nova comanda de atendimento vinculada ou avulsa.
   */
  static async openOrder(rawInput: OpenOrderInput, actorId?: string) {
    const validated = OpenOrderSchema.parse(rawInput);

    if (validated.appointmentId) {
      const existingOrder = await prisma.order.findUnique({
        where: { appointmentId: validated.appointmentId },
      });
      if (existingOrder) {
        return existingOrder;
      }
    }

    const order = await prisma.order.create({
      data: {
        organizationId: validated.organizationId,
        unitId: validated.unitId,
        contactId: validated.contactId,
        appointmentId: validated.appointmentId,
        status: "OPEN",
        subtotalInCents: 0,
        discountInCents: 0,
        totalInCents: 0,
      },
    });

    await AuditService.logEvent({
      organizationId: order.organizationId,
      unitId: order.unitId,
      actorId,
      action: "ORDER_OPENED",
      entityType: "Order",
      entityId: order.id,
      metadata: { appointmentId: order.appointmentId, contactId: order.contactId },
    });

    return order;
  }

  /**
   * Adiciona um item de servico ou produto a comanda e recalcula o total.
   */
  static async addItem(rawInput: AddOrderItemInput) {
    const validated = AddOrderItemSchema.parse(rawInput);

    const order = await prisma.order.findUnique({
      where: { id: validated.orderId },
      include: { items: true },
    });

    if (!order) {
      throw new Error("Comanda nao encontrada.");
    }

    if (order.status !== "OPEN") {
      throw new Error("Nao e possivel adicionar itens a uma comanda ja finalizada.");
    }

    const itemTotalInCents = validated.priceInCents * validated.quantity;

    return prisma.$transaction(async (tx) => {
      const item = await tx.orderItem.create({
        data: {
          orderId: validated.orderId,
          serviceId: validated.serviceId,
          productId: validated.productId,
          professionalId: validated.professionalId,
          quantity: validated.quantity,
          priceInCents: validated.priceInCents,
          totalInCents: itemTotalInCents,
        },
      });

      const newSubtotal = order.subtotalInCents + itemTotalInCents;
      const newTotal = Math.max(0, newSubtotal - order.discountInCents);

      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: {
          subtotalInCents: newSubtotal,
          totalInCents: newTotal,
        },
        include: { items: true },
      });

      return { item, order: updatedOrder };
    });
  }

  /**
   * Remove um item da comanda e recalcula o total.
   */
  static async removeItem(orderId: string, itemId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order || order.status !== "OPEN") {
      throw new Error("Comanda nao encontrada ou ja finalizada.");
    }

    const itemToRemove = order.items.find((i) => i.id === itemId);
    if (!itemToRemove) {
      throw new Error("Item nao pertence a esta comanda.");
    }

    return prisma.$transaction(async (tx) => {
      await tx.orderItem.delete({
        where: { id: itemId },
      });

      const newSubtotal = Math.max(0, order.subtotalInCents - itemToRemove.totalInCents);
      const newTotal = Math.max(0, newSubtotal - order.discountInCents);

      return tx.order.update({
        where: { id: orderId },
        data: {
          subtotalInCents: newSubtotal,
          totalInCents: newTotal,
        },
        include: { items: true },
      });
    });
  }

  /**
   * Fecha a comanda, realiza baixa no estoque de produtos e gera entrada no caixa.
   */
  static async closeOrder(rawInput: CloseOrderInput, actorId?: string) {
    const validated = CloseOrderSchema.parse(rawInput);

    const order = await prisma.order.findFirst({
      where: { id: validated.orderId, organizationId: validated.organizationId },
      include: { items: true },
    });

    if (!order) {
      throw new Error("Comanda nao encontrada para esta organizacao.");
    }

    if (order.status !== "OPEN") {
      throw new Error(`Comanda ja se encontra com status ${order.status}.`);
    }

    const finalDiscount = validated.discountInCents;
    const finalTotal = Math.max(0, order.subtotalInCents - finalDiscount);
    const now = new Date();

    return prisma.$transaction(async (tx) => {
      // 1. Baixa automatica no estoque de produtos incluidos na comanda
      for (const item of order.items) {
        if (item.productId) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
          });

          if (product) {
            await tx.product.update({
              where: { id: product.id },
              data: {
                stockQuantity: Math.max(0, product.stockQuantity - item.quantity),
              },
            });
          }
        }
      }

      // 2. Se houver agendamento vinculado, marca como COMPLETED
      if (order.appointmentId) {
        await tx.appointment.update({
          where: { id: order.appointmentId },
          data: { status: "COMPLETED" },
        });
      }

      // 3. Atualiza a comanda para PAID
      const closedOrder = await tx.order.update({
        where: { id: order.id },
        data: {
          status: "PAID",
          paymentMethod: validated.paymentMethod,
          discountInCents: finalDiscount,
          totalInCents: finalTotal,
          paidAt: now,
        },
        include: { items: true },
      });

      // 4. Registra lancamento financeiro no livro caixa
      await tx.financialEntry.create({
        data: {
          organizationId: order.organizationId,
          unitId: order.unitId,
          type: "REVENUE",
          category: "comanda",
          description: `Recebimento de comanda #${order.id.slice(-6).toUpperCase()}`,
          amountInCents: finalTotal,
          dueDate: now,
          paidAt: now,
        },
      });

      // 5. Auditoria
      await AuditService.logEvent({
        organizationId: order.organizationId,
        unitId: order.unitId,
        actorId,
        action: "ORDER_CLOSED_PAID",
        entityType: "Order",
        entityId: order.id,
        metadata: {
          totalInCents: finalTotal,
          paymentMethod: validated.paymentMethod,
          itemCount: order.items.length,
        },
      });

      return closedOrder;
    });
  }
}
