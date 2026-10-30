import { prisma } from "../db/prisma";

const DEFAULT_CATEGORIES = [
  { name: "Cabelo / Cortes", color: "#3B82F6", description: "Cortes clássicos, degradê, fade e tesoura" },
  { name: "Barba & Terapia", color: "#8B5CF6", description: "Barboterapia, toalha quente e alinhamento" },
  { name: "Combos Completos", color: "#c22ef3", description: "Pacotes cabelo + barba + procedimentos" },
  { name: "Química & Pigmentação", color: "#EC4899", description: "Pigmentação de barba, platinado e selagem" },
  { name: "Tratamentos & Estética", color: "#10B981", description: "Sobrancelha, limpeza de pele e hidratação" },
];

export class ServiceCategoryService {
  /**
   * Lista categorias da organização. Se estiver vazio, popula automaticamente as categorias padrão da barbearia.
   */
  static async listByOrganization(organizationId: string) {
    let categories = await prisma.serviceCategory.findMany({
      where: { organizationId, active: true },
      include: {
        _count: {
          select: { services: true },
        },
      },
      orderBy: { name: "asc" },
    });

    if (categories.length === 0) {
      // Seed inicial transparente
      await prisma.serviceCategory.createMany({
        data: DEFAULT_CATEGORIES.map((cat) => ({
          organizationId,
          name: cat.name,
          color: cat.color,
          description: cat.description,
          active: true,
        })),
        skipDuplicates: true,
      });

      categories = await prisma.serviceCategory.findMany({
        where: { organizationId, active: true },
        include: {
          _count: {
            select: { services: true },
          },
        },
        orderBy: { name: "asc" },
      });
    }

    return categories;
  }

  /**
   * Cria nova categoria dinâmica no banco.
   */
  static async create(data: {
    organizationId: string;
    name: string;
    description?: string;
    color?: string;
  }) {
    if (!data.name || !data.name.trim()) {
      throw new Error("Nome da categoria é obrigatório.");
    }

    return prisma.serviceCategory.create({
      data: {
        organizationId: data.organizationId,
        name: data.name.trim(),
        description: data.description?.trim() || null,
        color: data.color || "#c22ef3",
        active: true,
      },
    });
  }

  /**
   * Exclui categoria do banco garantindo isolamento da organização.
   */
  static async delete(id: string, organizationId: string) {
    const existing = await prisma.serviceCategory.findFirst({
      where: { id, organizationId },
      include: {
        _count: { select: { services: true } },
      },
    });

    if (!existing) {
      throw new Error("Categoria não encontrada.");
    }

    if (existing._count.services > 0) {
      throw new Error(`Não é possível excluir: existem ${existing._count.services} serviços vinculados a esta categoria.`);
    }

    return prisma.serviceCategory.delete({
      where: { id },
    });
  }
}

