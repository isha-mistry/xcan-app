import { z } from 'zod';

const projectStatusValues = [
    'ideation',
    'architecture_finalized',
    'prototype',
    'deployed',
    'demo_ready',
] as const;

const podMemberRoleValues = ['pod_lead', 'pod_member', 'faculty_coordinator', 'mentor'] as const;
const managedPodMemberStatusValues = ['active', 'inactive', 'pending', 'removed'] as const;
const memberApprovalActionValues = ['approve', 'reject', 'activate', 'deactivate'] as const;
const deploymentActionValues = ['verify', 'reject'] as const;

export const RegisterSchema = z.object({
    qrToken: z.preprocess(
        (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
        z.string().min(6).max(64)
    ).optional(),
    name: z.string().min(2).max(100).trim(),
    collegeSlug: z.string().min(2).max(100),
    programmingLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    githubUsername: z.string().max(39).optional(),
    semester: z.string().max(10).optional(),
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
});

export const ProjectSchema = z.object({
    name: z.string().min(3).max(100).trim(),
    problemStatement: z.string().min(10).max(1000),
    githubRepo: z.string().url().optional(),
    contractAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional(),
    demoLink: z.string().url().optional(),
    techStack: z.array(z.string()).max(10).default([]),
});

export const ShowcaseSubmissionSchema = z.object({
    showcaseEventId: z.string().regex(/^[a-f\d]{24}$/i),
    collegeSlug: z.string().min(2),
    projectId: z.string().regex(/^[a-f\d]{24}$/i),
    githubRepo: z.string().url(),
    demoLink: z.string().url().optional(),
    contractAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional(),
    pitchDeckUrl: z.string().url().optional(),
});

export const ProjectStatusUpdateSchema = z.object({
    projectId: z.string().regex(/^[a-f\d]{24}$/i),
    status: z.enum(projectStatusValues).optional(),
    isApproved: z.boolean().optional(),
}).refine((data) => data.status !== undefined || data.isApproved !== undefined, {
    message: 'Provide at least one change to update',
    path: ['status'],
});

export const MemberManagementSchema = z.object({
    memberId: z.string().regex(/^[a-f\d]{24}$/i),
    role: z.enum(podMemberRoleValues).optional(),
    status: z.enum(managedPodMemberStatusValues).optional(),
}).refine((data) => data.role !== undefined || data.status !== undefined, {
    message: 'Provide at least one member change',
    path: ['role'],
});

export const MemberApprovalSchema = z.object({
    memberId: z.string().regex(/^[a-f\d]{24}$/i),
    action: z.enum(memberApprovalActionValues),
});

export const AdminDeploymentUpdateSchema = z.object({
    deploymentId: z.string().regex(/^[a-f\d]{24}$/i),
    action: z.enum(deploymentActionValues),
});
