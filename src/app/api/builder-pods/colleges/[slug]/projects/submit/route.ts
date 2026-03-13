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

// POST — submit a new project
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
        const { name, problemStatement, githubRepo, contractAddress, demoLink, techStack } = parsed.data;
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
        } else {
            const member = await PodMember.findOne({
                collegeId: college._id,
                walletAddress,
                status: { $in: ['active', 'pending'] },
            }).lean();

            if (!member) {
                throw new ForbiddenError('Only a registered pod member can submit projects for this college');
            }
        }

        const project = await PodProject.create({
            collegeId: college._id,
            name: name.trim(),
            problemStatement: problemStatement.trim(),
            githubRepo: githubRepo || null,
            contractAddress: contractAddress?.toLowerCase() || null,
            demoLink: demoLink || null,
            techStack: techStack || [],
            status: 'ideation',
            createdBy: walletAddress,
        });

        // Increment college project count
        await College.findByIdAndUpdate(college._id, { $inc: { projectCount: 1 } });

        // Audit
        await AuditLog.create({
            actorWallet: walletAddress,
            action: 'project.create',
            entityType: 'PodProject',
            entityId: project._id.toString(),
            newValue: { name, status: 'ideation' },
        });

        return NextResponse.json(
            { success: true, project: { _id: project._id, status: project.status } },
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
