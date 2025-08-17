import { z } from "zod";

export const idSchema = z.object({
  id: z.string().uuid("id inválido")
});

export const queryListSchema = z.object({
  q: z.string().optional(),
  limit: z.string().regex(/^\d+$/).optional(),
  offset: z.string().regex(/^\d+$/).optional()
});

export const createPacienteSchema = z.object({
  nombre: z.string().min(1, "nombre requerido"),
  especie: z.string().nullable().optional(),
  raza: z.string().nullable().optional(),
  fecha_nacimiento: z.string().nullable().optional() // YYYY-MM-DD
});

export const updatePacienteSchema = z.object({
  nombre: z.string().min(1).optional(),
  especie: z.string().nullable().optional(),
  raza: z.string().nullable().optional(),
  fecha_nacimiento: z.string().nullable().optional()
});
