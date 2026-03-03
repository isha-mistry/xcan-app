import { Deployment } from '@/models/Deployment';
import { PodMember } from '@/models/PodMember';
import { College } from '@/models/College';
import { AuditLog } from '@/models/AuditLog';
import { Notification } from '@/models/Notification';

/**
 * Verify a deployment TX hash on-chain (Arbitrum Sepolia).
 * Falls back to admin manual verification if RPC is unavailable.
 */
export async function verifyTxOnChain(txHash: string): Promise<boolean> {
    try {
        const rpcUrl = process.env.ARBITRUM_SEPOLIA_RPC_URL || 'https://sepolia-rollup.arbitrum.io/rpc';
        const res = await fetch(rpcUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'eth_getTransactionReceipt',
                params: [txHash],
            }),
        });
        const data = await res.json();
        if (!data.result) return false;
        // status 0x1 = success
        return data.result.status === '0x1';
    } catch {
        return false;
    }
}

/**
 * Admin-triggered deployment verification flow.
 * Verifies TX on-chain, updates deployment, increments counters, sends notification.
 */
export async function verifyDeployment(
    deploymentId: string,
    adminWallet: string
): Promise<void> {
    const dep = await Deployment.findById(deploymentId);
    if (!dep) throw new Error('Deployment not found');
    if (dep.isVerified) throw new Error('Already verified');

    // Optional on-chain check
    const isValid = await verifyTxOnChain(dep.txHash);
    if (!isValid) {
        console.warn(`[Deployment] TX ${dep.txHash} not confirmed on-chain, proceeding with manual verify`);
    }

    dep.isVerified = true;
    dep.verifiedBy = adminWallet;
    dep.verifiedAt = new Date();
    await dep.save();

    // Atomic increments
    await PodMember.updateOne(
        { walletAddress: dep.walletAddress, collegeId: dep.collegeId },
        { $inc: { contractsDeployed: 1 } }
    );
    await College.updateOne(
        { _id: dep.collegeId },
        { $inc: { deploymentCount: 1 } }
    );

    // Notify deployer
    await Notification.create({
        walletAddress: dep.walletAddress,
        type: 'deployment_verified',
        title: 'Deployment Verified ✅',
        body: `Your deployment (${dep.txHash.slice(0, 10)}...) has been verified.`,
        link: '/builder-pods',
    });

    await AuditLog.create({
        actorWallet: adminWallet,
        action: 'deployment.verify',
        entityType: 'Deployment',
        entityId: deploymentId,
        newValue: { isVerified: true, txHash: dep.txHash },
    });
}
