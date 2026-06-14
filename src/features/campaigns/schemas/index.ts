import { z } from 'zod';

export const CreateCampaignSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório').max(120, 'Máximo 120 caracteres'),
  description: z.string().max(2000, 'Máximo 2000 caracteres').optional(),
});

export const UpdateCampaignSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório').max(120, 'Máximo 120 caracteres'),
  description: z.string().max(2000, 'Máximo 2000 caracteres').optional(),
});

export const ChangeCampaignStatusSchema = z.object({
  status: z.enum(['preparation', 'active', 'paused', 'ended', 'archived']),
});

export type CreateCampaignInput = z.infer<typeof CreateCampaignSchema>;
export type UpdateCampaignInput = z.infer<typeof UpdateCampaignSchema>;
