import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { WebhookSecurity } from "./whatsapp/WebhookSecurity";
import { WebhookDispatcher } from "./whatsapp/WebhookDispatcher";
import { ServiceDomainService } from "./services/ServiceDomainService";
import { AvailabilityEngine } from "./services/AvailabilityEngine";
import { AppointmentService } from "./services/AppointmentService";
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

// 4. Rotas de Servicos e Barbearia
app.get("/api/v1/services", async (req: Request, res: Response) => {
  const organizationId = (req.query.organizationId as string) || "org-barone-matriz";
  try {
    const services = await ServiceDomainService.listByOrganization(organizationId);
    return res.json({ data: services });
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

app.listen(PORT, () => {
  console.log(`[BIA Backend] Servidor ativo ouvindo na porta ${PORT}`);
});
