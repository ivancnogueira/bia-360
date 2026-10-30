import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { WebhookSecurity } from "./whatsapp/WebhookSecurity";
import { WebhookDispatcher } from "./whatsapp/WebhookDispatcher";
import { ServiceDomainService } from "./services/ServiceDomainService";
import { ServiceCategoryService } from "./services/ServiceCategoryService";
import { AvailabilityEngine } from "./services/AvailabilityEngine";
import { AppointmentService } from "./services/AppointmentService";
import { ProfessionalService } from "./services/ProfessionalService";
import { ScheduleExceptionService } from "./services/ScheduleExceptionService";
import { CourseService } from "./services/CourseService";
import { ClassGroupService } from "./services/ClassGroupService";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// 1. Rota de Healthcheck
app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "bia-backend",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// 2. Webhook WhatsApp Cloud API: Handshake de Verificacao da Meta
app.get("/api/v1/whatsapp/webhook", (req: Request, res: Response) => {
  const mode = req.query["hub.mode"] as string;
  const token = req.query["hub.verify_token"] as string;
  const challenge = req.query["hub.challenge"] as string;

  const expectedToken = process.env.META_WEBHOOK_VERIFY_TOKEN || "bia_barone_webhook_secret_token";
  const verifiedChallenge = WebhookSecurity.handleHandshake(mode, token, challenge, expectedToken);

  if (verifiedChallenge) {
    return res.status(200).send(verifiedChallenge);
  }

  return res.status(403).json({ error: "Verificacao de handshake recusada." });
});

// 3. Webhook WhatsApp Cloud API: Recepcao de Mensagens e Notificacoes
app.post("/api/v1/whatsapp/webhook", async (req: Request, res: Response) => {
  const signature = req.headers["x-hub-signature-256"] as string | undefined;
  const rawBody = JSON.stringify(req.body);
  const appSecret = process.env.META_APP_SECRET || "meta_app_secret_placeholder";

  const isValid = WebhookSecurity.verifyMetaSignature(rawBody, signature ?? null, appSecret);
  if (!isValid && process.env.NODE_ENV === "production") {
    return res.status(401).json({ error: "Assinatura HMAC invalida." });
  }

  try {
    const result = await WebhookDispatcher.dispatch(req.body);
    return res.status(200).json({ processed: true, ...result });
  } catch (error: any) {
    console.error("Erro no processamento do webhook:", error.message);
    return res.status(200).json({ status: "acknowledged_with_error", message: error.message });
  }
});

// 4. Rotas de Categorias de Servicos (PostgreSQL Dinamico)
app.get("/api/v1/service-categories", async (req: Request, res: Response) => {
  const organizationId = (req.query.organizationId as string) || "org-barone-matriz";
  try {
    const categories = await ServiceCategoryService.listByOrganization(organizationId);
    return res.json({ data: categories });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

app.post("/api/v1/service-categories", async (req: Request, res: Response) => {
  const organizationId = (req.body.organizationId as string) || "org-barone-matriz";
  try {
    const created = await ServiceCategoryService.create({
      organizationId,
      name: req.body.name,
      description: req.body.description,
      color: req.body.color,
    });
    return res.status(201).json({ data: created });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

app.delete("/api/v1/service-categories/:id", async (req: Request, res: Response) => {
  const organizationId = (req.query.organizationId as string) || (req.body.organizationId as string) || "org-barone-matriz";
  try {
    await ServiceCategoryService.delete(req.params.id, organizationId);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// 4.1 Rotas de Servicos e Barbearia
app.get("/api/v1/services", async (req: Request, res: Response) => {
  const organizationId = (req.query.organizationId as string) || "org-barone-matriz";
  try {
    const services = await ServiceDomainService.listByOrganization(organizationId);
    return res.json({ data: services });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

app.post("/api/v1/services", async (req: Request, res: Response) => {
  const organizationId = (req.body.organizationId as string) || "org-barone-matriz";
  try {
    const service = await ServiceDomainService.create({
      organizationId,
      name: req.body.name,
      description: req.body.description,
      durationMinutes: Number(req.body.durationMinutes) || 30,
      priceInCents: Number(req.body.priceInCents) || 5000,
      category: req.body.category || "corte",
      categoryId: req.body.categoryId,
      bufferBeforeMinutes: Number(req.body.bufferBeforeMinutes) || 0,
      bufferAfterMinutes: Number(req.body.bufferAfterMinutes) || 0,
      color: req.body.color || "#3B82F6",
      active: req.body.active !== false,
    });
    return res.status(201).json({ data: service });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

app.put("/api/v1/services/:id", async (req: Request, res: Response) => {
  const organizationId = (req.body.organizationId as string) || (req.query.organizationId as string) || "org-barone-matriz";
  try {
    const service = await ServiceDomainService.update(organizationId, req.params.id, req.body);
    return res.json({ data: service });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// 4.1 Rotas de Profissionais
app.get("/api/v1/professionals", async (req: Request, res: Response) => {
  const organizationId = (req.query.organizationId as string) || "org-barone-matriz";
  try {
    const professionals = await ProfessionalService.listByOrganization(organizationId);
    return res.json({ data: professionals });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

app.post("/api/v1/professionals", async (req: Request, res: Response) => {
  const organizationId = (req.body.organizationId as string) || "org-barone-matriz";
  try {
    const professional = await ProfessionalService.create({
      organizationId,
      name: req.body.name,
      nickname: req.body.nickname,
      phone: req.body.phone,
      commissionRate: Number(req.body.commissionRate) || 50,
      color: req.body.color || "#c22ef3",
      active: req.body.active !== false,
      schedules: req.body.schedules,
    });
    return res.status(201).json({ data: professional });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

app.put("/api/v1/professionals/:id", async (req: Request, res: Response) => {
  const organizationId = (req.body.organizationId as string) || (req.query.organizationId as string) || "org-barone-matriz";
  try {
    const professional = await ProfessionalService.update(organizationId, req.params.id, req.body);
    return res.json({ data: professional });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

app.post("/api/v1/professionals/:id/services", async (req: Request, res: Response) => {
  const organizationId = (req.body.organizationId as string) || (req.query.organizationId as string) || "org-barone-matriz";
  try {
    const bindings = req.body.services || [];
    const updated = await ProfessionalService.setServices(organizationId, req.params.id, bindings);
    return res.json({ data: updated });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// 4.2 Rotas de Agendamentos (Appointments)
app.get("/api/v1/appointments", async (req: Request, res: Response) => {
  const organizationId = (req.query.organizationId as string) || "org-barone-matriz";
  const { unitId, startDate, endDate, professionalId, status } = req.query;

  try {
    const appointments = await AppointmentService.list({
      organizationId,
      unitId: unitId as string | undefined,
      startDate: startDate as string | undefined,
      endDate: endDate as string | undefined,
      professionalId: professionalId as string | undefined,
      status: status as any,
    });
    return res.json({ data: appointments });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

app.post("/api/v1/appointments", async (req: Request, res: Response) => {
  const organizationId = (req.body.organizationId as string) || "org-barone-matriz";
  const unitId = (req.body.unitId as string) || "unit-matriz";

  try {
    const appointment = await AppointmentService.createDirect({
      organizationId,
      unitId,
      professionalId: req.body.professionalId,
      contactId: req.body.contactId,
      serviceId: req.body.serviceId,
      startTime: new Date(req.body.startTime),
      notes: req.body.notes,
    });
    return res.status(201).json({ data: appointment });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

app.patch("/api/v1/appointments/:id", async (req: Request, res: Response) => {
  try {
    const updated = await AppointmentService.update(req.params.id, req.body);
    return res.json({ data: updated });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

app.delete("/api/v1/appointments/:id", async (req: Request, res: Response) => {
  try {
    await AppointmentService.delete(req.params.id);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// 4.3 Rotas de Disponibilidade e Escalas Semanais
app.get("/api/v1/availability/schedules", async (req: Request, res: Response) => {
  const organizationId = (req.query.organizationId as string) || "org-barone-matriz";
  const professionalId = req.query.professionalId as string;

  try {
    if (!professionalId) {
      return res.status(400).json({ error: "professionalId e obrigatorio." });
    }
    const prof = await ProfessionalService.getById(organizationId, professionalId);
    return res.json({ data: prof.workSchedules });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

app.post("/api/v1/availability/schedules", async (req: Request, res: Response) => {
  const organizationId = (req.body.organizationId as string) || "org-barone-matriz";
  const { professionalId, schedules } = req.body;

  try {
    if (!professionalId || !Array.isArray(schedules)) {
      return res.status(400).json({ error: "professionalId e schedules sao obrigatorios." });
    }
    const updated = await ProfessionalService.setWorkSchedules(organizationId, professionalId, schedules);
    return res.json({ data: updated });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// 4.4 Rotas de Excecoes e Folgas Pontuais
app.get("/api/v1/availability/exceptions", async (req: Request, res: Response) => {
  const organizationId = (req.query.organizationId as string) || "org-barone-matriz";
  const professionalId = req.query.professionalId as string | undefined;

  try {
    const exceptions = await ScheduleExceptionService.list(organizationId, professionalId);
    return res.json({ data: exceptions });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

app.post("/api/v1/availability/exceptions", async (req: Request, res: Response) => {
  const organizationId = (req.body.organizationId as string) || "org-barone-matriz";

  try {
    const created = await ScheduleExceptionService.create({
      organizationId,
      professionalId: req.body.professionalId,
      date: req.body.date,
      isAvailable: req.body.isAvailable,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      reason: req.body.reason,
    });
    return res.status(201).json({ data: created });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

app.delete("/api/v1/availability/exceptions/:id", async (req: Request, res: Response) => {
  const organizationId = (req.query.organizationId as string) || "org-barone-matriz";

  try {
    await ScheduleExceptionService.delete(req.params.id, organizationId);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

app.get("/api/v1/availability", async (req: Request, res: Response) => {
  const { organizationId, unitId, serviceId, targetDate, professionalId } = req.query;
  try {
    const slots = await AvailabilityEngine.getAvailableSlots({
      organizationId: (organizationId as string) || "org-barone-matriz",
      unitId: (unitId as string) || "unit-matriz",
      serviceId: serviceId as string,
      targetDate: (targetDate as string) || new Date().toISOString().split("T")[0],
      professionalId: professionalId as string | undefined,
    });
    return res.json({ data: slots });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// 5. Rotas da Escola Barone
app.get("/api/v1/courses", async (req: Request, res: Response) => {
  const organizationId = (req.query.organizationId as string) || "org-barone-matriz";
  try {
    const courses = await CourseService.listByOrganization(organizationId);
    return res.json({ data: courses });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

app.get("/api/v1/classes", async (req: Request, res: Response) => {
  const organizationId = (req.query.organizationId as string) || "org-barone-matriz";
  try {
    const classes = await ClassGroupService.listByOrganization(organizationId);
    return res.json({ data: classes });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// 6. Rotas de Autenticacao BIA Platform
app.post("/api/v1/auth/login", (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "E-mail e senha sao obrigatorios." });
  }
  return res.json({
    success: true,
    token: `bia-jwt-${Date.now()}`,
    user: {
      email,
      name: email.split("@")[0],
      role: "ADMINISTRATOR",
    },
  });
});

app.post("/api/v1/auth/register", (req: Request, res: Response) => {
  const { name, email, phone, operationType, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Nome, e-mail e senha sao obrigatorios." });
  }
  return res.status(201).json({
    success: true,
    message: "Conta registrada com sucesso.",
    user: { name, email, phone, operationType },
  });
});

app.post("/api/v1/auth/verify", (req: Request, res: Response) => {
  const { email, token } = req.body;
  if (!email || !token) {
    return res.status(400).json({ error: "E-mail e token sao obrigatorios." });
  }
  return res.json({
    success: true,
    verified: true,
    message: "Conta ativada com sucesso.",
  });
});

app.post("/api/v1/auth/forgot-password", (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "E-mail e obrigatorio." });
  }
  return res.json({
    success: true,
    message: "Link de redefinicao gerado e enviado.",
  });
});

app.post("/api/v1/auth/reset-password", (req: Request, res: Response) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ error: "Token e nova senha sao obrigatorios." });
  }
  return res.json({
    success: true,
    message: "Senha redefinida com sucesso.",
  });
});

app.post("/api/v1/auth/resend-code", (req: Request, res: Response) => {
  const { email } = req.body;
  return res.json({
    success: true,
    message: `Novo codigo enviado para ${email}.`,
  });
});

app.listen(PORT, () => {
  console.log(`[BIA Backend] Servidor ativo ouvindo na porta ${PORT}`);
});
