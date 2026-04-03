import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { PodMember } from '@/models/PodMember';
import { College } from '@/models/College';
import { Deployment } from '@/models/Deployment';
import { PodProject } from '@/models/PodProject';
import { AuditLog } from '@/models/AuditLog';
import { Notification } from '@/models/Notification';
import {
    buildCollegeFilter,
    getAuthContext,
    requireAnyRole,
    UnauthorizedError,
    ForbiddenError,
    verifyCollegeAccess,
} from '@/lib/rbac';
import { awardBadgeOnEvent } from '@/lib/builder-pods/badges';
import { recalculateMemberScore, recalculatePodScore, SCORE_WEIGHTS } from '@/lib/builder-pods/leaderboard';
import { MemberApprovalSchema } from '@/schemas/builder-pods';
import { PlatformRole, UserRole } from '@/models/PlatformRole';
import { sendRoleChangeEmail } from '@/lib/builder-pods/notify-role-change';

// GET — list pending members (admin only)
export async function GET(req: NextRequest) {
    try {
        const ctx = await getAuthContext(req);
        requireAnyRole(ctx, ['super_admin', 'college_admin']);

        await dbConnect();
        const { searchParams } = new URL(req.url);
        const statusParam = searchParams.get('status') || 'pending';
        const validStatuses = ['pending', 'active', 'inactive', 'removed'];
        const requestedStatuses = statusParam
            .split(',')
            .map((status) => status.trim())
            .filter((status) => validStatuses.includes(status));

        const filter: Record<string, any> = {};
        if (requestedStatuses.length === 1) {
            filter.status = requestedStatuses[0];
        } else if (requestedStatuses.length > 1) {
            filter.status = { $in: requestedStatuses };
        }

        const collegeScopeFilter = buildCollegeFilter(ctx!, 'collegeId');

        const members = await PodMember.find({ ...filter, ...collegeScopeFilter })
            .populate('collegeId', 'name slug')
            .sort({ createdAt: -1 })
            .lean();

        // Ensure any "deployment-derived" stats reflect only deployments that belong to
        // active (non-deleted) projects.
        const wallets = members.map((m: any) => m.walletAddress).filter(Boolean);
        const uniqueWallets = Array.from(new Set(wallets));

        const [activeDeploymentsCounts, activeProjectsCounts] = await Promise.all([
            uniqueWallets.length
                ? Deployment.aggregate([
                      {
                          $match: {
                              isVerified: true,
                              walletAddress: { $in: uniqueWallets },
                              ...collegeScopeFilter,
                          },
                      },
                      {
                          $lookup: {
                              from: PodProject.collection.name,
                              localField: 'projectId',
                              foreignField: '_id',
                              as: 'project',
                          },
                      },
                      // If deployment.projectId is null, it won't match any PodProject and will drop here.
                      { $unwind: '$project' },
                      { $match: { 'project.deletedAt': null } },
                      { $group: { _id: '$walletAddress', count: { $sum: 1 } } },
                  ])
                : Promise.resolve([]),
            uniqueWallets.length
                ? PodProject.aggregate([
                      { $match: { deletedAt: null, ...collegeScopeFilter } },
                      {
                          // Include both teamLeader and teamMembers wallets.
                          $project: {
                              wallets: {
                                  // Avoid double-counting when the leader is also in teamMembers.
                                  $setUnion: [['$teamLeader'], '$teamMembers.walletAddress'],
                              },
                          },
                      },
                      { $unwind: '$wallets' },
                      { $match: { wallets: { $in: uniqueWallets } } },
                      { $group: { _id: '$wallets', count: { $sum: 1 } } },
                  ])
                : Promise.resolve([]),
        ]);

        const activeDeploymentsByWallet = new Map(
            (activeDeploymentsCounts as any[]).map((r: any) => [r._id, r.count])
        );
        const activeProjectsByWallet = new Map(
            (activeProjectsCounts as any[]).map((r: any) => [r._id, r.count])
        );

        const membersEnhanced = members.map((m: any) => {
            const activeContractsDeployed = activeDeploymentsByWallet.get(m.walletAddress) ?? 0;
            const activeProjects = activeProjectsByWallet.get(m.walletAddress) ?? 0;

            // Keep score consistent with the updated "active deployments" count.
            const totalScore =
                (m.stylusModulesCompleted || 0) * SCORE_WEIGHTS.individual.moduleCompleted +
                activeContractsDeployed * SCORE_WEIGHTS.individual.contractDeployed +
                (m.weeklyActivityScore || 0) * SCORE_WEIGHTS.individual.weeklyActivity +
                (m.projectContributionScore || 0) * SCORE_WEIGHTS.individual.projectContribution;

            return {
                ...m,
                // Used for scoring; the UI may choose not to display it.
                contractsDeployed: activeContractsDeployed,
                activeProjects,
                totalScore,
            };
        });

        return NextResponse.json({ success: true, members: membersEnhanced }, { status: 200 });
    } catch (error: any) {
        if (error instanceof UnauthorizedError) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        if (error instanceof ForbiddenError) return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
        console.error('Error fetching pending members:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}

// PATCH — approve or reject a member (admin only)
export async function PATCH(req: NextRequest) {
    try {
        const ctx = await getAuthContext(req);
        requireAnyRole(ctx, ['super_admin', 'college_admin']);

        await dbConnect();
        const parsed = MemberApprovalSchema.safeParse(await req.json());
        if (!parsed.success) {
            return NextResponse.json(
                { success: false, error: parsed.error.issues[0]?.message || 'Invalid member approval payload' },
                { status: 400 }
            );
        }
        const { memberId, action } = parsed.data;
        const adminWallet = ctx!.walletAddress;

        const member = await PodMember.findById(memberId);
        if (!member) {
            return NextResponse.json(
                { success: false, error: 'Member not found' },
                { status: 404 }
            );
        }

        const oldStatus = member.status;

        verifyCollegeAccess(ctx!, member.collegeId.toString());

        if (action === 'approve' || action === 'activate') {
            member.status = 'active';
            if (action === 'approve') {
                member.approvedBy = adminWallet;
                member.approvedAt = new Date();
            }
            await member.save();

            if (oldStatus !== 'active') {
                await College.updateOne(
                    { _id: member.collegeId },
                    { $inc: { activeMemberCount: 1 } }
                );
            }

            if (action === 'approve') {
                const badgeTrigger = member.joinedViaQr ? 'pod_member_approved' : 'lab_participant_approved';
                await awardBadgeOnEvent(badgeTrigger, member.walletAddress, {
                    collegeId: member.collegeId?.toString(),
                });

                await Notification.create({
                    walletAddress: member.walletAddress,
                    type: 'member_approved',
                    title:
                        badgeTrigger === 'pod_member_approved'
                            ? 'Pod Membership Approved! 🎉'
                            : 'Pod Participant Approved! 🎉',
                    body:
                        badgeTrigger === 'pod_member_approved'
                            ? 'You are now an active Builder Pod member.'
                            : 'You are now an active Builder Pod participant. Your Builder Lab Participant badge will appear once the on-chain attestation completes.',
                    link: '/builder-pods',
                });
            }

            await recalculateMemberScore(member._id);
            await recalculatePodScore(member.collegeId);
        } else if (action === 'reject') {
            // Permanently delete the rejected pending member from the DB
            await PodMember.findByIdAndDelete(memberId);
            // Decrement the college memberCount (was incremented on registration)
            await College.updateOne(
                { _id: member.collegeId },
                { $inc: { memberCount: -1 } }
            );
            await AuditLog.create({
                actorWallet: adminWallet,
                action: 'member.reject',
                entityType: 'PodMember',
                entityId: memberId,
                oldValue: { status: oldStatus },
                newValue: { deleted: true },
            });
            return NextResponse.json(
                { success: true, deleted: true },
                { status: 200 }
            );
        } else if (action === 'deactivate') {
            member.status = 'inactive';
            await member.save();

            if (oldStatus === 'active') {
                await College.updateOne(
                    { _id: member.collegeId },
                    { $inc: { activeMemberCount: -1 } }
                );
            }
        } else if (action === 'approve_role') {
            if (!member.requestedRole) {
                return NextResponse.json(
                    { success: false, error: 'No pending role request' },
                    { status: 400 }
                );
            }
            const oldRole = member.role;
            member.role = member.requestedRole;
            member.requestedRole = null;
            await member.save();

            if (member.role === 'pod_member') {
                await awardBadgeOnEvent('pod_member_approved', member.walletAddress, {
                    collegeId: member.collegeId?.toString(),
                });
            }

            if (member.role === 'pod_lead') {
                if (member.status === 'active') {
                    await awardBadgeOnEvent('manual_assignment', member.walletAddress, {
                        collegeId: member.collegeId?.toString(),
                    });
                }
                const podLeadPlatformRole = await PlatformRole.findOne({ slug: 'pod_lead' }).lean();
                if (podLeadPlatformRole) {
                    await UserRole.updateOne(
                        {
                            walletAddress: member.walletAddress,
                            roleSlug: 'pod_lead',
                            collegeId: member.collegeId,
                        },
                        {
                            $setOnInsert: {
                                roleId: podLeadPlatformRole._id,
                                grantedBy: adminWallet,
                                grantedAt: new Date(),
                            },
                            $set: {
                                revokedAt: null,
                            },
                        },
                        { upsert: true }
                    );
                }
            }

            const roleLabel =
                member.role === 'pod_member'
                    ? 'Pod Member'
                    : member.role === 'pod_lead'
                      ? 'Pod Lead'
                      : member.role.replace(/_/g, ' ');
            const roleBody =
                member.role === 'pod_member'
                    ? 'You are now a Pod Member. You can join teams and request Pod Lead to submit projects.'
                    : member.role === 'pod_lead'
                      ? 'You are now a Pod Lead. You can submit projects and weekly updates for this pod.'
                      : `You are now a ${roleLabel}.`;

            await Notification.create({
                walletAddress: member.walletAddress,
                type: 'role_assigned',
                title: 'Role Upgrade Approved! 🎉',
                body: roleBody,
                link: '/builder-pods',
            });

            // Fire-and-forget email notification for pod_lead / pod_member
            if (member.role === 'pod_lead' || member.role === 'pod_member') {
                sendRoleChangeEmail({
                    walletAddress: member.walletAddress,
                    memberName: member.name,
                    role: member.role as 'pod_lead' | 'pod_member',
                    collegeId: member.collegeId.toString(),
                }).catch(() => {});
            }

            await AuditLog.create({
                actorWallet: adminWallet,
                action: 'member.approve_role',
                entityType: 'PodMember',
                entityId: memberId,
                oldValue: { role: oldRole },
                newValue: { role: member.role },
            });

            return NextResponse.json(
                { success: true, member: { _id: member._id, role: member.role, status: member.status } },
                { status: 200 }
            );
        } else if (action === 'reject_role') {
            if (!member.requestedRole) {
                return NextResponse.json(
                    { success: false, error: 'No pending role request' },
                    { status: 400 }
                );
            }
            const rejectedRole = member.requestedRole;
            member.requestedRole = null;
            await member.save();

            const rejectedLabel =
                rejectedRole === 'pod_member'
                    ? 'Pod Member'
                    : rejectedRole === 'pod_lead'
                      ? 'Pod Lead'
                      : rejectedRole.replace(/_/g, ' ');

            await Notification.create({
                walletAddress: member.walletAddress,
                type: 'role_assigned',
                title: 'Role Request Update',
                body: `Your request for ${rejectedLabel} was not approved at this time.`,
                link: '/builder-pods',
            });

            await AuditLog.create({
                actorWallet: adminWallet,
                action: 'member.reject_role',
                entityType: 'PodMember',
                entityId: memberId,
                oldValue: { requestedRole: rejectedRole },
                newValue: { requestedRole: null },
            });

            return NextResponse.json(
                { success: true, member: { _id: member._id, role: member.role, status: member.status } },
                { status: 200 }
            );
        } else {
            return NextResponse.json(
                { success: false, error: 'Invalid action' },
                { status: 400 }
            );
        }

        await AuditLog.create({
            actorWallet: adminWallet,
            action: `member.${action}`,
            entityType: 'PodMember',
            entityId: memberId,
            oldValue: { status: oldStatus },
            newValue: { status: member.status },
        });

        return NextResponse.json(
            { success: true, member: { _id: member._id, status: member.status } },
            { status: 200 }
        );
    } catch (error: any) {
        if (error instanceof UnauthorizedError) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        if (error instanceof ForbiddenError) return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
        console.error('Member approval error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}