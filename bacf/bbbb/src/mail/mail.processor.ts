
import {
  Processor,
  WorkerHost,
} from "@nestjs/bullmq";

import {
  Injectable,
  OnModuleInit,
} from "@nestjs/common";

import { Job } from "bullmq";
import * as nodemailer from "nodemailer";

import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

@Processor("mail")
@Injectable()
export class MailProcessor extends WorkerHost implements OnModuleInit {
  private transporter: nodemailer.Transporter;

  constructor() {
    super();

    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !port || !user || !pass) {
      throw new Error(
        "Configurações SMTP incompletas no arquivo .env",
      );
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });
  }

  // VERIFICAR CONEXÃO SMTP AO INICIAR
  async onModuleInit() {
    try {
      await this.transporter.verify();
    } catch (error) {
    }
  }

  async process(job: Job): Promise<any> {
    try {
      // 1. VERIFICAÇÃO 2FA
      if (job.name === "send-2fa") {
        const { to, code } = job.data;

        if (!to || !code) {
          throw new Error(
            "E-mail ou código 2FA não informado",
          );
        }

        const resultado = await this.transporter.sendMail({
          from: `"Soares Barbearia" <${process.env.SMTP_USER}>`,
          to,
          subject: "Seu código de verificação",
          text: `Seu código de verificação é ${code}. Ele expira em 2 minutos.`,
        });

        return { success: true };
      }

      // 2. COMPRA OU AGENDAMENTO
      if (
        job.name === "compra" ||
        job.name === "agendamento"
      ) {
        const email = job.data.email;

        if (!email) {
          throw new Error(
            "Destinatário do e-mail não informado",
          );
        }

        const arquivo =
          job.name === "compra"
            ? "compra.html"
            : "agendamento.html";

        // Localizar o template na pasta compilada
        const pastaAtual = dirname(
          fileURLToPath(import.meta.url),
        );

        const caminhoTemplate = join(
          pastaAtual,
          "templates",
          arquivo,
        );

        const template = await readFile(
          caminhoTemplate,
          "utf-8",
        );

        // Substituir variáveis do HTML
        const html = template.replace(
          /{{(\w+)}}/g,
          (_: string, chave: string) => {
            const valor = String(
              job.data[chave] ?? "",
            );

            return valor
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;");
          },
        );

        const resultado = await this.transporter.sendMail({
          from: `"Soares Barbearia" <${process.env.SMTP_USER}>`,
          to: email,

          subject:
            job.name === "compra"
              ? "Compra realizada - Soares Barbearia"
              : "Agendamento confirmado - Soares Barbearia",

          html,
        });

        return {
          success: true,
          messageId: resultado.messageId,
        };
      }

      throw new Error(
        `Tipo de e-mail desconhecido: ${job.name}`,
      );

    } catch (error) {

      // Permitir novas tentativas do BullMQ
      throw error;
    }
  }
}
