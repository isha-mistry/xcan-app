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
import {
    enrichShowcaseEvent,
    publicSubmissionMatch,
    serializePublicSubmission,
} from '@/lib/builder-pods/showcase';

// GET — public showcase events (+ optional public submissions)
// Query:
//   ?showcaseId=<id>         → single event + its public submissions
//   ?includeSubmissions=all  → all public submissions (cap 200)
//   ?includeSubmissions=1    → latest public submissions (cap 12)
// Auth optional: when connected, also returns the caller's own submissions.
export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const ctx = await getAuthContext(req).catch(() => null);
        const { searchParams } = new URL(req.url);
        const showcaseId = searchParams.get('showcaseId');
        const includeSubmissions = searchParams.get('includeSubmissions');

        // ── Single showcase detail + public submissions ──────────────────────
        if (showcaseId) {
            const showcase = await ShowcaseEvent.findById(showcaseId).lean();
            if (!showcase) {
                return NextResponse.json(
                    { success: false, error: 'Showcase not found' },
                    { status: 404 }
                );
            }

            const submissions = await ShowcaseSubmission.find(
                publicSubmissionMatch({ showcaseEventId: showcaseId })
            )
                .sort({ createdAt: -1 })
                .lean();

            let userSubmissions: any[] = [];
            if (ctx?.walletAddress) {
                userSubmissions = await ShowcaseSubmission.find({
                    submittedBy: ctx.walletAddress.toLowerCase(),
                    showcaseEventId: showcaseId,
                    isActive: { $ne: false },
                })
                    .select('showcaseEventId status projectSnapshot collegeSnapshot createdAt')
                    .lean();
            }

            return NextResponse.json(
                {
                    success: true,
                    showcase: enrichShowcaseEvent(showcase, submissions.length),
                    submissions: submissions.map(serializePublicSubmission),
                    userSubmissions,
                },
                { status: 200 }
            );
        }

        // ── All showcase events ──────────────────────────────────────────────
        const showcases = await ShowcaseEvent.find()
            .sort({ eventDate: -1 })
            .lean();

        const countAgg = await ShowcaseSubmission.aggregate([
            { $match: publicSubmissionMatch() },
            { $group: { _id: '$showcaseEventId', count: { $sum: 1 } } },
        ]);
        const countMap = new Map(
            countAgg.map((row: { _id: unknown; count: number }) => [
                String(row._id),
                row.count,
            ])
        );

        const enrichedShowcases = showcases.map((event) =>
            enrichShowcaseEvent(event, countMap.get(String(event._id)) ?? 0)
        );

        // Optional public submission feed for the global gallery
        let submissions: ReturnType<typeof serializePublicSubmission>[] | undefined;
        if (includeSubmissions === 'all' || includeSubmissions === '1') {
            const limit = includeSubmissions === 'all' ? 200 : 12;
            const raw = await ShowcaseSubmission.find(publicSubmissionMatch())
                .sort({ createdAt: -1 })
                .limit(limit)
                .populate('showcaseEventId', 'name city regionSnapshot')
                .lean();

            submissions = raw.map((sub: any) =>
                serializePublicSubmission({
                    ...sub,
                    showcaseName: sub.showcaseEventId?.name ?? null,
                })
            );
        }

        let userSubmissions: any[] = [];
        if (ctx?.walletAddress) {
            userSubmissions = await ShowcaseSubmission.find({
                submittedBy: ctx.walletAddress.toLowerCase(),
                isActive: { $ne: false },
            })
                .select('showcaseEventId status projectSnapshot collegeSnapshot createdAt')
                .lean();
        }

        return NextResponse.json(
            {
                success: true,
                showcases: enrichedShowcases,
                ...(submissions ? { submissions } : {}),
                userSubmissions,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error fetching showcases:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

// POST — submit a showcase entry (pod_lead + project lead, or admin)
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

        if (showcase.status !== 'open') {
            return NextResponse.json(
                { success: false, error: 'This showcase is not currently open for submissions' },
                { status: 400 }
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

        // Project-wise permission: Only project lead (or admin) can submit
        if (!isAdmin && project.teamLeader.toLowerCase() !== walletAddress.toLowerCase()) {
            throw new ForbiddenError('Only the project lead can submit this project to a showcase');
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
