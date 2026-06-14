import { z } from 'zod';

const ClassSlotSchema = z.object({
  classId: z.string().uuid('ID de classe inválido'),
  specializationId: z.string().uuid('ID de especialização inválido'),
});

export const CreateCharacterSchema = z.object({
  campaignId: z.string().uuid(),
  name: z.string().min(1, 'Nome obrigatório').max(120, 'Máximo 120 caracteres'),
  sex: z.enum(['female', 'male', 'other'], { message: 'Sexo obrigatório' }),
  age: z.coerce.number().int().positive('Idade deve ser positiva').optional(),
  raceId: z.string().uuid('Raça obrigatória'),
  visualDescription: z.string().max(1000).optional(),
  background: z.string().max(3000).optional(),
  slot1: ClassSlotSchema,
  slot2: ClassSlotSchema,
});

export const UpdateCharacterNarrativeSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  visualDescription: z.string().max(1000).optional(),
  background: z.string().max(3000).optional(),
  age: z.coerce.number().int().positive().optional(),
  imageUrl: z.string().url('URL inválida').optional().or(z.literal('')),
});

export const UpdateCharacterAttributesSchema = z.object({
  strength: z.coerce.number().int(),
  dexterity: z.coerce.number().int(),
  constitution: z.coerce.number().int(),
  intelligence: z.coerce.number().int(),
  mind: z.coerce.number().int(),
  charisma: z.coerce.number().int(),
});

export type CreateCharacterInput = z.infer<typeof CreateCharacterSchema>;
export type UpdateCharacterNarrativeInput = z.infer<typeof UpdateCharacterNarrativeSchema>;
export type UpdateCharacterAttributesInput = z.infer<typeof UpdateCharacterAttributesSchema>;
