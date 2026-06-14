import { z } from 'zod';

export const SendInviteSchema = z.object({
  campaignId: z.string().uuid('ID de campanha inválido'),
  inviteeEmail: z.string().email('E-mail inválido'),
});

export type SendInviteInput = z.infer<typeof SendInviteSchema>;
