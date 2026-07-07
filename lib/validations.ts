import { z } from "zod";

// Shared validation schemas for API routes
// Use with: const parsed = Schema.safeParse(body); if (!parsed.success) return 400

export const ApplicationSchema = z.object({
  company: z.string().min(1, "Company is required").max(200),
  position: z.string().min(1, "Position is required").max(200),
  status: z.enum(["APPLIED", "PHONE SCREEN", "INTERVIEW", "OFFER", "REJECTED", "WITHDRAWN"]).optional(),
  date_applied: z.string().optional(),
  location: z.string().max(200).optional(),
  salary_min: z.number().min(0).optional(),
  salary_max: z.number().min(0).optional(),
  notes: z.string().max(5000).optional(),
  url: z.string().url().or(z.literal("")).optional(),
  category: z.string().max(100).optional(),
  interview_date: z.string().optional(),
});

export const CertificationSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  category: z.string().max(100).optional(),
  status: z.enum(["PLANNING", "STUDYING", "SCHEDULED", "PASSED", "FAILED"]).optional(),
  price: z.number().min(0).optional(),
  exam_date: z.string().optional(),
  expiration_date: z.string().optional(),
  icon: z.string().max(500).optional(),
});

export const ProjectSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(2000).optional(),
  technologies: z.string().max(500).optional(),
  category: z.string().max(100).optional(),
  status: z.enum(["TODO", "IN PROGRESS", "DONE"]).optional(),
  deadline: z.string().optional(),
  goal: z.string().max(500).optional(),
  icon: z.string().max(500).optional(),
});

export const JobTitleSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  company: z.string().max(200).optional(),
  category: z.string().max(100).optional(),
  location: z.string().max(200).optional(),
  salary_min: z.number().min(0).optional(),
  salary_max: z.number().min(0).optional(),
  description: z.string().max(2000).optional(),
  tech_stack: z.string().max(500).optional(),
  icon: z.string().max(500).optional(),
});

export const ChatMessageSchema = z.object({
  content: z.string().min(1, "Message is required").max(10000),
  conversationId: z.number().min(1),
  attachments: z.array(z.any()).optional(),
  message_type: z.string().optional(),
});

export const CreateConversationSchema = z.object({
  title: z.string().max(200).optional(),
  model_id: z.number().optional(),
});

export const NoteSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  content: z.string().max(10000).optional(),
  pinned: z.number().min(0).max(1).optional(),
});

export const ReminderSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  date: z.string().min(1, "Date is required"),
  time: z.string().optional(),
  description: z.string().max(1000).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  reference_type: z.string().optional(),
  reference_id: z.number().optional(),
});

// Helper to validate request body
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown):
  | { success: true; data: T }
  | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) return { success: true, data: result.data };
  const messages = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
  return { success: false, error: messages };
}

// camelCase aliases for backward compatibility
export const applicationSchema = ApplicationSchema;
export const certificationSchema = CertificationSchema;
export const projectSchema = ProjectSchema;
export const jobTitleSchema = JobTitleSchema;
export const chatMessageSchema = ChatMessageSchema;
export const noteSchema = NoteSchema;
export const reminderSchema = ReminderSchema;
