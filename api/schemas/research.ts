import { z } from 'zod';

export const CreateJobSchema = z.object({
    topic: z.string().min(3).max(500),
    mode: z.enum(['quick', 'deep', 'comprehensive']).optional().default('quick'),
    sources: z.array(z.string()).optional().default(['pubmed']),
    language: z.string().optional().default('en'),
    depth: z.number().min(1).max(5).optional().default(1)
});

export type CreateJobInput = z.infer<typeof CreateJobSchema>;

export const ScreeningUpdateSchema = z.object({
    excludedArticles: z.array(z.string()).optional(),
    includedArticles: z.array(z.string()).optional(),
    criteria: z.record(z.any()).optional()
});

export type ScreeningUpdateInput = z.infer<typeof ScreeningUpdateSchema>;

export const RefinementRequestSchema = z.object({
    focus: z.string().min(3),
    excludeKeywords: z.array(z.string()).optional(),
    mandatoryKeywords: z.array(z.string()).optional()
});

export type RefinementRequestInput = z.infer<typeof RefinementRequestSchema>;

export const AnalysisConfigSchema = z.object({
    includeCharts: z.boolean().optional(),
    includeTables: z.boolean().optional(),
    format: z.enum(['json', 'pdf', 'docx']).optional()
});

export type AnalysisConfigInput = z.infer<typeof AnalysisConfigSchema>;
