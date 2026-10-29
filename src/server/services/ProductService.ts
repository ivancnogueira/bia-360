import { prisma } from "../db/prisma";
import {
  AdjustStockInput,
  AdjustStockSchema,
  CreateProductInput,
  CreateProductSchema,
  UpdateProductInput,
  UpdateProductSchema,
} from "../validators/product.schema";
import { AuditService } from "./AuditService";

export class ProductService {
  /**
   * Cadastra novo produto no catalogo da organizacao.
   */
  static async create(rawInput: CreateProductInput, actorId?: string) {
    const validated = CreateProductSchema.parse(rawInput);

    const product = await prisma.product.create({
      data: {
        organizationId: validated.organizationId,
        name: validated.name,
        barcode: validated.barcode,
        category: validated.category,
        priceInCents: validated.priceInCents,
        costInCents: validated.costInCents,
        stockQuantity: validated.stockQuantity,
        minStockAlert: validated.minStockAlert,
        active: validated.active,
      },
    });

    await AuditService.logEvent({
      organizationId: product.organizationId,
      actorId,
      action: "PRODUCT_CREATED",
      entityType: "Product",
      entityId: product.id,
      metadata: { name: product.name, priceInCents: product.priceInCents, stockQuantity: product.stockQuantity },
    });

    return product;
  }

  /**
   * Lista produtos com opcao de filtrar por categoria e produtos ativos.
   */
  static async listByOrganization(organizationId: string, options?: { category?: string; lowStockOnly?: boolean }) {
    const products = await prisma.product.findMany({
      where: {
        organizationId,
        active: true,
        ...(options?.category ? { category: options.category } : {}),
      },
      orderBy: { name: "asc" },
    });

    if (options?.lowStockOnly) {
      return products.filter((p) => p.stockQuantity <= p.minStockAlert);
    }

    return products;
  }

  /**
   * Busca produto por id com isolamento multi-tenant.
   */
  static async getById(organizationId: string, productId: string) {
    const product = await prisma.product.findFirst({
      where: { id: productId, organizationId },
    });

    if (!product) {
      throw new Error("Produto nao encontrado ou nao pertence a esta organizacao.");
    }

    return product;
  }

  /**
   * Atualiza dados de produto.
   */
  static async update(
    organizationId: string,
    productId: string,
    rawInput: UpdateProductInput,
    actorId?: string
  ) {
    const validated = UpdateProductSchema.parse(rawInput);
    await this.getById(organizationId, productId);

    const updated = await prisma.product.update({
      where: { id: productId },
      data: validated,
    });

    await AuditService.logEvent({
      organizationId,
      actorId,
      action: "PRODUCT_UPDATED",
      entityType: "Product",
      entityId: updated.id,
      metadata: validated as Record<string, unknown>,
    });

    return updated;
  }

  /**
   * Ajusta estoque manualmente com justificativa e auditoria.
   */
  static async adjustStock(rawInput: AdjustStockInput, actorId?: string) {
    const validated = AdjustStockSchema.parse(rawInput);
    const product = await this.getById(validated.organizationId, validated.productId);

    const newStock = product.stockQuantity + validated.quantityChange;
    if (newStock < 0) {
      throw new Error("O estoque resultante nao pode ser negativo.");
    }

    const updated = await prisma.product.update({
      where: { id: validated.productId },
      data: { stockQuantity: newStock },
    });

    await AuditService.logEvent({
      organizationId: validated.organizationId,
      actorId,
      action: "PRODUCT_STOCK_ADJUSTED",
      entityType: "Product",
      entityId: updated.id,
      metadata: {
        previousStock: product.stockQuantity,
        change: validated.quantityChange,
        newStock,
        reason: validated.reason,
      },
    });

    return updated;
  }
}
