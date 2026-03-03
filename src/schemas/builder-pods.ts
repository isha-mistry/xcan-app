import { z } from 'zod';

export const RegisterSchema = z.object({
    qrToken: z.string().min(6).max(64).optional(),
    name: z.string().min(2).max(100).trim(),
    collegeSlug: z.string().min(2).max(100),
    programmingLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    githubUsername: z.string().max(39).optional(),
    semester: z.string().max(10).optional(),
    walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
});

export const WeeklyUpdateSchema = z.object({
    completedThisWeek: z.string().min(10).max(2000),
    blockers: z.string().max(1000).nullable().optional(),
    nextMilestone: z.string().min(5).max(500),
    githubLink: z.string().url().nullable().optional(),
});

export const DeploymentSchema = z.object({
    txHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid TX hash'),
    contractAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional(),
    network: z.string().default('arbitrum_sepolia'),
    projectId: z.string().regex(/^[a-f\d]{24}$/i).optional(),
    description: z.string().max(500).optional(),
    collegeSlug: z.string().min(2),
    walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
});

export const ProjectSchema = z.object({
    name: z.string().min(3).max(100).trim(),
    problemStatement: z.string().min(10).max(1000),
    githubRepo: z.string().url().optional(),
    contractAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional(),
    demoLink: z.string().url().optional(),
    techStack: z.array(z.string()).max(10).default([]),
    collegeSlug: z.string().min(2),
    walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
});

export const ShowcaseSubmissionSchema = z.object({
    showcaseEventId: z.string().regex(/^[a-f\d]{24}$/i),
    collegeSlug: z.string().min(2),
    projectId: z.string().regex(/^[a-f\d]{24}$/i),
    githubRepo: z.string().url(),
    demoLink: z.string().url().optional(),
    contractAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional(),
    pitchDeckUrl: z.string().url().optional(),
    walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
});
