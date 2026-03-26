import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { College } from '@/models/College';
import { PodProject } from '@/models/PodProject';
import { PodMember } from '@/models/PodMember';
import { AuditLog } from '@/models/AuditLog';
import { ProjectSchema } from '@/schemas/builder-pods';
import {
    ForbiddenError,
    getAuthContext,
    hasAnyRole,
    UnauthorizedError,
    verifyCollegeAccess,
} from '@/lib/rbac';
import { PlatformRole, UserRole } from '@/models/PlatformRole';

// POST — submit a new project (requires pod membership)
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const ctx = await getAuthContext(req);
        if (!ctx) throw new UnauthorizedError('Not authenticated');

        await dbConnect();
        const { slug } = await params;
        const parsed = ProjectSchema.safeParse(await req.json());
        if (!parsed.success) {
            return NextResponse.json(
                { success: false, error: parsed.error.issues[0]?.message || 'Invalid project payload' },
                { status: 400 }
            );
        }
        const { name, problemStatement, githubRepo, demoLink, techStack } = parsed.data;
        const walletAddress = ctx.walletAddress;

        const college = await College.findOne({ slug, deletedAt: null });
        if (!college) {
            return NextResponse.json(
                { success: false, error: 'College not found' },
                { status: 404 }
            );
        }

        const isAdmin = hasAnyRole(ctx, ['super_admin', 'college_admin'], college._id.toString());
        if (isAdmin) {
            verifyCollegeAccess(ctx, college._id.toString());
        }

        const membership = await PodMember.findOne({
            collegeId: college._id,
            walletAddress: walletAddress,
            status: { $in: ['active', 'pending'] },
            deletedAt: null,
        }).lean();

        if (!membership && !isAdmin) {
            return NextResponse.json(
                { success: false, error: 'You must be an active member of this pod to submit a project' },
                { status: 403 }
            );
        }

        if (!isAdmin && (!membership || membership.role !== 'pod_lead')) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        'Only Pod Leads can submit projects. Request Pod Lead from your college admin if you need to create a project.',
                },
                { status: 403 }
            );
        }

        const project = await PodProject.create({
            collegeId: college._id,
            name: name.trim(),
            problemStatement: problemStatement.trim(),
            githubRepo: githubRepo || null,
            demoLink: demoLink || null,
            techStack: techStack || [],
            status: 'ideation',
            createdBy: walletAddress,
            teamLeader: walletAddress,
            teamMembers: [{
                walletAddress: walletAddress,
                name: membership.name,
                role: 'team_leader',
                joinedAt: new Date(),
            }],
        });

        // Grant the submitting member the platform-level pod_lead role for this college.
        const podLeadPlatformRole = await PlatformRole.findOne({ slug: 'pod_lead' }).lean();
        if (podLeadPlatformRole) {
            await UserRole.updateOne(
                {
                    walletAddress: walletAddress,
                    roleSlug: 'pod_lead',
                    collegeId: college._id,
                },
                {
                    $setOnInsert: {
                        roleId: podLeadPlatformRole._id,
                        grantedBy: walletAddress,
                        grantedAt: new Date(),
                    },
                    $set: {
                        revokedAt: null,
                    },
                },
                { upsert: true }
            );
        }

        await College.findByIdAndUpdate(college._id, { $inc: { projectCount: 1 } });

        await AuditLog.create({
            actorWallet: walletAddress,
            action: 'project.create',
            entityType: 'PodProject',
            entityId: project._id.toString(),
            newValue: { name, status: 'ideation', teamLeader: walletAddress, teamCode: project.teamCode },
        });

        return NextResponse.json(
            {
                success: true,
                project: {
                    _id: project._id,
                    status: project.status,
                    teamCode: project.teamCode,
                },
            },
            { status: 201 }
        );
    } catch (error: any) {
        if (error instanceof UnauthorizedError) {
            return NextResponse.json(
                { success: false, error: 'Not authenticated' },
                { status: 401 }
            );
        }
        if (error instanceof ForbiddenError) {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 403 }
            );
        }
        console.error('Project creation error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
