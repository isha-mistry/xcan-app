import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { ShowcaseEvent } from '@/models/ShowcaseEvent';
import { ShowcaseSubmission } from '@/models/ShowcaseSubmission';
import { College } from '@/models/College';
import { PodProject } from '@/models/PodProject';
import { PodMember } from '@/models/PodMember';
import { ShowcaseSubmissionSchema } from '@/schemas/builder-pods';
import {
    getAuthContext,
    hasAnyRole,
    UnauthorizedError,
    verifyCollegeAccess,
    ForbiddenError,
} from '@/lib/rbac';

// GET — list all showcase events
export async function GET() {
    try {
        await dbConnect();
        const showcases = await ShowcaseEvent.find()
            .sort({ eventDate: -1 })
            .lean();

        return NextResponse.json({ success: true, showcases }, { status: 200 });
    } catch (error) {
        console.error('Error fetching showcases:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

// POST — submit a showcase entry
export async function POST(req: NextRequest) {
    try {
        const ctx = await getAuthContext(req);
        if (!ctx) throw new UnauthorizedError('Not authenticated');

        await dbConnect();
        const parsed = ShowcaseSubmissionSchema.safeParse(await req.json());
        if (!parsed.success) {
            return NextResponse.json(
                { success: false, error: parsed.error.issues[0]?.message || 'Invalid showcase submission payload' },
                { status: 400 }
            );
        }
        const {
            showcaseEventId,
            collegeSlug,
            projectId,
            demoLink,
            githubRepo,
            contractAddress,
            pitchDeckUrl,
        } = parsed.data;
        const walletAddress = ctx.walletAddress;

        const showcase = await ShowcaseEvent.findById(showcaseEventId);

        if (!showcase || showcase.status === 'completed') {
            return NextResponse.json(
                { success: false, error: 'Showcase not found or already completed' },
                { status: 404 }
            );
        }

        const college = await College.findOne({ slug: collegeSlug, deletedAt: null });
        if (!college) {
            return NextResponse.json(
                { success: false, error: 'College not found' },
                { status: 404 }
            );
        }

        const isAdmin = hasAnyRole(ctx, ['super_admin', 'college_admin', 'mentor'], college._id.toString());
        if (isAdmin) {
            verifyCollegeAccess(ctx, college._id.toString());
        } else {
            const member = await PodMember.findOne({
                collegeId: college._id,
                walletAddress,
                status: 'active',
            }).lean();

            const isPodLead = member?.role === 'pod_lead';
            if (!member || !isPodLead) {
                throw new ForbiddenError('Only an active pod lead can submit to a showcase for this college');
            }
        }

        const project = await PodProject.findById(projectId);
        if (!project || project.collegeId.toString() !== college._id.toString()) {
            return NextResponse.json(
                { success: false, error: 'Project not found or does not belong to this college' },
                { status: 404 }
            );
        }

        const submission = await ShowcaseSubmission.create({
            showcaseEventId,
            collegeId: college._id,
            projectId: project._id,
            collegeSnapshot: {
                name: college.name,
                slug: college.slug,
                podName: college.podName,
            },
            projectSnapshot: {
                name: project.name,
                problemStatement: project.problemStatement,
            },
            demoLink: demoLink || null,
            githubRepo,
            contractAddress: contractAddress || null,
            pitchDeckUrl: pitchDeckUrl || null,
            submittedBy: walletAddress,
        });

        // Mark project as submitted to showcase (idempotent marker)
        await PodProject.findByIdAndUpdate(project._id, { submittedToShowcase: true });

        return NextResponse.json(
            { success: true, submission: { _id: submission._id, status: submission.status } },
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
        console.error('Showcase submission error:', error);
        if (error.code === 11000) {
            return NextResponse.json(
                { success: false, error: 'This project has already been submitted to this showcase' },
                { status: 409 }
            );
        }
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
