import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class HmacService {
  private readonly chave: string;

  constructor(private readonly config: ConfigService) {
    this.chave = this.config.getOrThrow<string>('HMAC_CHAVE');
  }

  gerarHeaders(method: string, path: string, queryString = ''): Record<string, string> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const mensagem = `${method.toUpperCase()}${path}${queryString}${timestamp}`;
    const assinatura = crypto
      .createHmac('sha256', this.chave)
      .update(mensagem)
      .digest('hex');

    return {
      'X-HMAC-Signature': assinatura,
      'X-HMAC-Timestamp': timestamp,
    };
  }
}
