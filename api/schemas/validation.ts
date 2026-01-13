import { z } from 'zod';

export const ResearchJobRequestSchema = z.object({
    topic: z.string().min(3, "Topic must be at least 3 characters").max(500, "Topic too long"),
    mode: z.enum(['quick', 'thorough']).optional().default('quick'),
    maxArticles: z.number().int().positive().max(1000).optional().default(100),
    graphConfig: z.object({
        layout: z.string().optional(),
        clustering: z.boolean().optional()
    }).optional()
});

export const ScreeningUpdateSchema = z.object({
    includedIds: z.array(z.string()),
    excludedIds: z.array(z.string()),
    exclusionReasons: z.record(z.string(), z.string()).optional()
});

export const AnalysisConfigSchema = z.object({
    extractEntities: z.boolean().optional(),
    extractRelations: z.boolean().optional(),
    extractColumns: z.boolean().optional(),
    domain: z.string().optional(),
    columns: z.array(z.string()).optional()
});

export const GraphBuildConfigSchema = z.object({
    config: z.any().optional() // Make stricter if possible
});
