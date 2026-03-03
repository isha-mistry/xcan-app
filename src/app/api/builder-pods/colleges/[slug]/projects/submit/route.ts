import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { College } from '@/models/College';
import { PodProject } from '@/models/PodProject';
import { AuditLog } from '@/models/AuditLog';

// POST — submit a new project
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        await dbConnect();
        const { slug } = await params;
        const body = await req.json();
        const { name, problemStatement, githubRepo, contractAddress, demoLink, techStack, walletAddress } = body;

        if (!name || !problemStatement || !walletAddress) {
            return NextResponse.json(
                { success: false, error: 'name, problemStatement, and walletAddress are required' },
                { status: 400 }
            );
        }

        const college = await College.findOne({ slug, deletedAt: null });
        if (!college) {
            return NextResponse.json(
                { success: false, error: 'College not found' },
                { status: 404 }
            );
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
            createdBy: walletAddress.toLowerCase(),
        });

        // Increment college project count
        await College.findByIdAndUpdate(college._id, { $inc: { projectCount: 1 } });

        // Audit
        await AuditLog.create({
            actorWallet: walletAddress.toLowerCase(),
            action: 'project.create',
            entityType: 'PodProject',
            entityId: project._id.toString(),
            newValue: { name, status: 'ideation' },
        });

        return NextResponse.json(
            { success: true, project: { _id: project._id, status: project.status } },
            { status: 201 }
        );
    } catch (error) {
        console.error('Project creation error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
