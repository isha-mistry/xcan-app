import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { Deployment } from '@/models/Deployment';
import { PodMember } from '@/models/PodMember';
import { College } from '@/models/College';
import { Notification } from '@/models/Notification';
import { recalculateIndividualScores, recalculatePodScore } from '@/lib/builder-pods/leaderboard';

/**
 * Cron: Auto-detect deployment verification via RPC every 15 minutes.
 * Schedule: "* /15 * * * *"
 *
 * Polls Arbitrum Sepolia RPC for unverified TX hashes and
 * auto-verifies those with successful on-chain receipts.
 */
export async function GET() {
    try {
        await dbConnect();

        const rpcUrl =
            process.env.ARBITRUM_SEPOLIA_RPC_URL || 'https://sepolia-rollup.arbitrum.io/rpc';

        // Get unverified deployments (max 50 per run to avoid overloading RPC)
        const unverified = await Deployment.find({ isVerified: false })
            .sort({ createdAt: 1 })
            .limit(50)
            .lean();

        if (unverified.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No unverified deployments',
                checked: 0,
                verified: 0,
            });
        }

        let verifiedCount = 0;
        const affectedCollegeIds = new Set<string>();

        for (const dep of unverified) {
            try {
                const res = await fetch(rpcUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        jsonrpc: '2.0',
                        id: 1,
                        method: 'eth_getTransactionReceipt',
                        params: [dep.txHash],
                    }),
                });
                const data = await res.json();

                if (data.result && data.result.status === '0x1') {
                    // TX is confirmed on-chain
                    await Deployment.updateOne(
                        { _id: dep._id },
                        {
                            $set: {
                                isVerified: true,
                                verifiedBy: 'auto_detect',
                                verifiedAt: new Date(),
                                autoDetected: true,
                                contractAddress: data.result.contractAddress || dep.contractAddress,
                            },
                        }
                    );

                    // Increment counters
                    await PodMember.updateOne(
                        { walletAddress: dep.walletAddress, collegeId: dep.collegeId },
                        { $inc: { contractsDeployed: 1 } }
                    );
                    await College.updateOne(
                        { _id: dep.collegeId },
                        { $inc: { deploymentCount: 1 } }
                    );

                    // Notify user
                    await Notification.create({
                        walletAddress: dep.walletAddress,
                        type: 'deployment_verified',
                        title: 'Deployment Auto-Verified ✅',
                        body: `Your deployment (${dep.txHash.slice(0, 10)}...) was automatically verified on-chain.`,
                        link: '/builder-pods',
                    });

                    verifiedCount++;
                    affectedCollegeIds.add(dep.collegeId.toString());
                }
            } catch (rpcError) {
                // Skip individual failures, continue with next
                console.warn(`[Cron:Deployments] RPC error for ${dep.txHash}:`, rpcError);
            }
        }

        if (verifiedCount > 0) {
            await recalculateIndividualScores();
            for (const collegeId of affectedCollegeIds) {
                await recalculatePodScore(collegeId);
            }
        }

        console.log(
            `[Cron:Deployments] Checked ${unverified.length}, auto-verified ${verifiedCount}`
        );

        return NextResponse.json({
            success: true,
            message: 'Deployment auto-detect complete',
            checked: unverified.length,
            verified: verifiedCount,
        });
    } catch (error) {
        console.error('[Cron:Deployments] Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
