import type { NextApiRequest, NextApiResponse } from 'next';

// Defina a interface para o payload do token
interface TokenPayload {
  userId: string;
  email: string;
  // outras propriedades do seu payload
}

// Extenda NextApiRequest para adicionar token_payload
interface NextApiRequestWithToken extends NextApiRequest {
  token_payload?: TokenPayload;
}

// Exemplo de handler usando a interface estendida
export default function handler(
  req: NextApiRequestWithToken,
  res: NextApiResponse
) {
  if (req.token_payload) {
    // Agora você pode acessar token_payload sem erro de tipagem
    console.log('User ID:', req.token_payload.userId);
  } else {
    console.log('Token payload não encontrado');
  }

  res.status(200).json({ message: 'OK' });
}

import * as express from 'express';

declare global {
  namespace Express {
    interface Request {
      token_payload?: {
        userId: string;
        email: string;
        // outras propriedades do payload
      };
    }
  }
}