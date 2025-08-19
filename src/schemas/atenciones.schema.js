import { z } from "zod";

export const idSchema = z.object({ id: z.string().uuid("id inválido") });

export const queryListSchema = z.object({
  q: z.string().optional(),
  paciente_id: z.string().uuid().optional(),
  from: z.string().datetime().optional(), // ISO (ej: 2025-08-17T00:00:00Z)
  to: z.string().datetime().optional(),
  limit: z.string().regex(/^\d+$/).optional(),
  offset: z.string().regex(/^\d+$/).optional()
});

export const createAtencionSchema = z.object({
  paciente_id: z.string().uuid(),
  tipo: z.string().trim().min(1).optional(),
  motivo: z.string().trim().min(1, "motivo requerido"),
  notas: z.string().nullable().optional(),
  precio: z.number().finite().nonnegative().nullable().optional(),
  atencion_at: z.string().datetime().optional() // ISO
});

export const updateAtencionSchema = z.object({
  tipo: z.string().trim().min(1).optional(),
  motivo: z.string().trim().min(1).optional(),
  notas: z.string().nullable().optional(),
  precio: z.number().finite().nonnegative().nullable().optional(),
  atencion_at: z.string().datetime().optional()
});
