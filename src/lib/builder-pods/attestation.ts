/**
 * EAS (Ethereum Attestation Service) - Ethereum Sepolia
 *
 * Contract addresses (verified from official EAS GitHub + easscan.org):
 *   EAS Contract:          0xC2679fBD37d54388Ce493F1DB75320D236e1815e
 *   SchemaRegistry:        0x0a7E2Ff54e76B8E6659aedc9103FB21c038050D0
 *   Chain:                 Ethereum Sepolia (chainId: 11155111)
 *   Explorer:              https://sepolia.easscan.org
 *
 * Schema (register once via scripts/register-schema.js):
 *   "string badgeType, string college, uint256 issuedAt"
 *
 * Env variables required:
 *   SEPOLIA_RPC            - Sepolia JSON-RPC endpoint
 *   ISSUER_PRIVATE_KEY     - Dedicated burner wallet private key for signing
 *   EAS_SCHEMA_UID         - Schema UID from registration step
 */

// ── Constants ────────────────────────────────────────────────────────────────

export const EAS_CONTRACT_ADDRESS = '0xC2679fBD37d54388Ce493F1DB75320D236e1815e';
export const SCHEMA_REGISTRY_ADDRESS = '0x0a7E2Ff54e76B8E6659aedc9103FB21c038050D0';
export const EAS_CHAIN_ID = 11155111; // Ethereum Sepolia
export const EAS_EXPLORER = 'https://sepolia.easscan.org';
export const BADGE_SCHEMA = 'string badgeType, string issuer, string college, string programCohort, address walletAddress, uint256 issuedAt';

// ── Types ────────────────────────────────────────────────────────────────────

interface AttestationResult {
    attestationUid: string;
    txHash: string;
    explorerUrl: string;
}

interface AttestationParams {
    recipientWallet: string;
    badgeType: string;
    college: string;
    programCohort?: string; // default: current year
}

// ── Core Functions ───────────────────────────────────────────────────────────

/**
 * Issue an on-chain EAS attestation on Ethereum Sepolia.
 *
 * This is the primary entry point called by the badge attest API route.
 * Requires EAS SDK + ethers to be installed:
 *   npm install @ethereum-attestation-service/eas-sdk ethers
 */
export async function issueOnChainAttestation(
    params: AttestationParams
): Promise<AttestationResult> {
    // Dynamic imports to avoid build errors if EAS SDK is not installed
    // @ts-ignore — eas-sdk may not be installed
    const { EAS, SchemaEncoder } = await import(
        '@ethereum-attestation-service/eas-sdk'
    );
    const { ethers } = await import('ethers');

    const rpcUrl = process.env.SEPOLIA_RPC;
    const privateKey = process.env.ISSUER_PRIVATE_KEY;
    const schemaUid = process.env.EAS_SCHEMA_UID;

    if (!rpcUrl || !privateKey || !schemaUid) {
        throw new Error(
            'EAS environment variables missing. Required: SEPOLIA_RPC, ISSUER_PRIVATE_KEY, EAS_SCHEMA_UID'
        );
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const signer = new ethers.Wallet(privateKey, provider);
    const eas = new EAS(EAS_CONTRACT_ADDRESS);
    eas.connect(signer);

    const schemaEncoder = new SchemaEncoder(BADGE_SCHEMA);
    const issuedAt = Math.floor(Date.now() / 1000);
    const cohort = params.programCohort ?? String(new Date().getFullYear());

    const encodedData = schemaEncoder.encodeData([
        { name: 'badgeType',     value: params.badgeType,       type: 'string'  },
        { name: 'issuer',        value: 'Lampros DAO',           type: 'string'  },
        { name: 'college',       value: params.college,          type: 'string'  },
        { name: 'programCohort', value: cohort,                  type: 'string'  },
        { name: 'walletAddress', value: params.recipientWallet,  type: 'address' },
        { name: 'issuedAt',      value: issuedAt.toString(),     type: 'uint256' },
    ]);

    const tx = await eas.attest({
        schema: schemaUid,
        data: {
            recipient: params.recipientWallet,
            expirationTime: BigInt(0), // Permanent — no expiration
            revocable: true,
            data: encodedData,
        },
    });

    const attestationUid = await tx.wait();
    const txHash = (tx as any).receipt?.hash || '';

    return {
        attestationUid,
        txHash,
        explorerUrl: `${EAS_EXPLORER}/attestation/view/${attestationUid}`,
    };
}

/**
 * Queue/issue attestation — wrapper used by the attest API route.
 *
 * This function is the one imported by:
 *   src/app/api/builder-pods/badges/attest/[userBadgeId]/route.ts
 *
 * It resolves the college name from the memberʼs collegeId, then calls
 * issueOnChainAttestation.
 */
export async function queueOnChainAttestation(
    walletAddress: string,
    badgeSlug: string,
    context: { collegeId?: string; showcaseEventId?: string }
): Promise<string> {
    // Resolve college name for the attestation data
    let collegeName = 'Unknown';
    if (context.collegeId) {
        try {
            const { College } = await import('@/models/College');
            const college = await College.findById(context.collegeId, 'name').lean();
            if (college) collegeName = (college as any).name;
        } catch {
            // If model import fails, continue with default
        }
    }

    const result = await issueOnChainAttestation({
        recipientWallet: walletAddress,
        badgeType: badgeSlug,
        college: collegeName,
    });

    return result.attestationUid;
}

/**
 * Verify an attestation exists on-chain.
 * Useful for the frontend to display verification status.
 */
export async function verifyAttestation(
    attestationUid: string
): Promise<boolean> {
    try {
        // @ts-ignore — eas-sdk may not be installed
        const { EAS } = await import('@ethereum-attestation-service/eas-sdk');
        const { ethers } = await import('ethers');

        const rpcUrl = process.env.SEPOLIA_RPC;
        if (!rpcUrl) return false;

        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const eas = new EAS(EAS_CONTRACT_ADDRESS);
        eas.connect(provider);

        const attestation = await eas.getAttestation(attestationUid);
        return attestation.uid === attestationUid;
    } catch {
        return false;
    }
}
