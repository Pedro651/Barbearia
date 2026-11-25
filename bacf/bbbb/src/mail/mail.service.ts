
import { Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";

@Injectable()
export class MailService {
  constructor(
    @InjectQueue("mail")
    private readonly mailQueue: Queue,
  ) {}

  async enviarCompra(dados: {
    pedidoId: string;
    email: string;
    nome: string;
    produto: string;
    quantidade: number;
    total: string;
  }) {
    const jobId = `compra-${dados.pedidoId}`;

    // Verificar se já existe um e-mail para esse pedido
    const jobExistente = await this.mailQueue.getJob(jobId);

    if (jobExistente) {
      const estado = await jobExistente.getState();

      // Não adicionar novamente se já foi enviado
      // ou se já está sendo processado
      if (
        estado === "completed" ||
        estado === "waiting" ||
        estado === "active" ||
        estado === "delayed"
      ) {
        return;
      }

      // Se falhou definitivamente, permitir nova tentativa
      if (estado === "failed") {
        await jobExistente.remove();
      }
    }

    await this.mailQueue.add("compra", dados, {
      jobId,
      attempts: 5,
      backoff: {
        type: "exponential",
        delay: 5000,
      },
      removeOnComplete: false,
      removeOnFail: false,
    });
  }

  async enviarAgendamento(dados: any) {
    await this.mailQueue.add("agendamento", dados, {
      attempts: 5,
      backoff: {
        type: "exponential",
        delay: 5000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    });
  }
}
