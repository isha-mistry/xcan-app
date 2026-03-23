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
 *   string badgeType, string issuer, string college, string programCohort,
 *   address walletAddress, uint256 issuedAt, string achievementDescription
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
export const EAS_GRAPHQL_URL = 'https://sepolia.easscan.org/graphql';
export const BADGE_SCHEMA =
    'string badgeType, string issuer, string college, string programCohort, address walletAddress, uint256 issuedAt, string achievementDescription';

/** Human-readable achievement descriptions for each badge type (shown on-chain). */
export const BADGE_ACHIEVEMENT_DESCRIPTIONS: Record<string, string> = {
    builder_lab_participant:
        'Participated in the Arbitrum Builder Pod and registered successfully to learn web3 and build real projects with AI assistant.',
    builder_pod_member:
        'Selected to join the Builder Pod for a span of months; will be part of a project that will be built and showcased at the regional showcase event.',
    builder_pod_lead:
        'Lead of the project submitted to the regional showcase event; responsible for managing the project, giving weekly updates, and communicating via sync calls to LamprosDAO.',
    regional_showcase_finalist:
        'Project selected to advance to judging rounds for final winner selection.',
    regional_showcase_winner:
        'Project selected for the win prize pool of 1,000 USDC.',
};

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

    // Normalize recipient to checksummed format for consistent on-chain storage
    const checksummedRecipient = ethers.getAddress(params.recipientWallet);

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const signer = new ethers.Wallet(privateKey, provider);
    const eas = new EAS(EAS_CONTRACT_ADDRESS);
    eas.connect(signer);

    const schemaEncoder = new SchemaEncoder(BADGE_SCHEMA);
    const issuedAt = Math.floor(Date.now() / 1000);
    const cohort = params.programCohort ?? String(new Date().getFullYear());
    const achievementDescription =
        BADGE_ACHIEVEMENT_DESCRIPTIONS[params.badgeType] ??
        `Awarded ${params.badgeType} badge by Lampros DAO.`;

    const encodedData = schemaEncoder.encodeData([
        { name: 'badgeType', value: params.badgeType, type: 'string' },
        { name: 'issuer', value: 'Lampros DAO', type: 'string' },
        { name: 'college', value: params.college, type: 'string' },
        { name: 'programCohort', value: cohort, type: 'string' },
        { name: 'walletAddress', value: checksummedRecipient, type: 'address' },
        { name: 'issuedAt', value: issuedAt.toString(), type: 'uint256' },
        { name: 'achievementDescription', value: achievementDescription, type: 'string' },
    ]);

    const tx = await eas.attest({
        schema: schemaUid,
        data: {
            recipient: checksummedRecipient,
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
 * Check the EAS GraphQL API for an existing attestation matching the
 * given (recipient, badgeType, college) combination under our schema.
 *
 * This prevents duplicate on-chain attestations when MongoDB data is
 * wiped and badges are re-assigned.
 *
 * Returns the existing attestation UID if found, or null otherwise.
 */
export async function findExistingAttestation(
    recipientWallet: string,
    badgeType: string,
    college: string
): Promise<string | null> {
    const schemaUid = process.env.EAS_SCHEMA_UID;
    if (!schemaUid) return null;

    try {
        // Normalize to checksummed format so the GraphQL `equals` filter
        // matches the address format stored by the EAS indexer.
        const { ethers } = await import('ethers');
        const checksummedWallet = ethers.getAddress(recipientWallet);

        const query = `
            query FindExistingAttestation($where: AttestationWhereInput) {
                attestations(where: $where) {
                    id
                    decodedDataJson
                }
            }
        `;

        const variables = {
            where: {
                schemaId: { equals: schemaUid },
                recipient: { equals: checksummedWallet },
                revoked: { equals: false },
            },
        };

        const res = await fetch(EAS_GRAPHQL_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, variables }),
        });

        if (!res.ok) {
            throw new Error(`EAS GraphQL query failed with HTTP status ${res.status}`);
        }

        const json = await res.json();
        const attestations: Array<{ id: string; decodedDataJson: string }> =
            json?.data?.attestations ?? [];

        // Search through the matching attestations for one that has the same
        // badgeType AND college in its decoded data.
        for (const att of attestations) {
            try {
                // decodedDataJson is a JSON array of { name, type, value } objects
                const decoded: Array<{ name: string; type: string; value: { value: string } }> =
                    JSON.parse(att.decodedDataJson);

                const attBadgeType = decoded.find((d) => d.name === 'badgeType')?.value?.value;
                const attCollege = decoded.find((d) => d.name === 'college')?.value?.value;

                if (
                    attBadgeType?.toLowerCase() === badgeType.toLowerCase() &&
                    attCollege?.toLowerCase() === college.toLowerCase()
                ) {
                    console.log(
                        `[attestation] Found existing on-chain attestation ${att.id} for ` +
                            `wallet=${recipientWallet}, badge=${badgeType}, college=${college}`
                    );
                    return att.id;
                }
            } catch {
                // Skip attestations with unparseable data
                continue;
            }
        }

        return null;
    } catch (err) {
        console.error('[attestation] Error querying EAS GraphQL for existing attestation:', err);
        // Fail-closed: throw error to prevent duplicate on-chain attestations.
        // The caller (attestBadgeOnChain) will catch this and leave easUid null
        // so the attestation can be retried later.
        throw new Error(
            `[attestation] Cannot verify on-chain duplicate status for ` +
            `wallet=${recipientWallet}, badge=${badgeType}, college=${college}: ${err}`
        );
    }
}

/**
 * Queue/issue attestation — wrapper used by the attest API route.
 *
 * This function is the one imported by:
 *   src/app/api/builder-pods/badges/attest/[userBadgeId]/route.ts
 *
 * It resolves the college name from the member's collegeId, checks if an
 * attestation already exists on-chain via the EAS GraphQL API, and only
 * issues a new attestation if none is found.
 */
export async function queueOnChainAttestation(
    walletAddress: string,
    badgeSlug: string,
    context: { collegeId?: string; showcaseEventId?: string }
): Promise<string> {
    // Resolve college name for the attestation data
    let collegeName = 'Unknown';

    try {
        const { dbConnect } = await import('@/lib/dbConnect');
        await dbConnect();

        let collegeId: string | undefined = context.collegeId;

        // Fallback: infer collegeId from the member's active pod membership,
        // or the latest membership if none are active.
        if (!collegeId) {
            const { PodMember } = await import('@/models/PodMember');

            const activeMember = await PodMember.findOne({
                walletAddress,
                status: 'active',
                deletedAt: null,
            })
                .sort({ createdAt: -1 })
                .lean();

            if (activeMember?.collegeId) {
                collegeId = activeMember.collegeId.toString();
            } else {
                const anyMember = await PodMember.findOne({
                    walletAddress,
                    deletedAt: null,
                })
                    .sort({ createdAt: -1 })
                    .lean();
                if (anyMember?.collegeId) {
                    collegeId = anyMember.collegeId.toString();
                }
            }
        }

        if (collegeId) {
            const { College } = await import('@/models/College');
            const college = await College.findById(collegeId, 'name').lean();
            if (college) {
                collegeName = (college as any).name;
            }
        }
    } catch (err) {
        console.error('[attestation] Failed to resolve college name for badge attestation', err);
    }

    // ── On-chain duplicate check ─────────────────────────────────────────
    // Query the EAS GraphQL API to see if this wallet already has an
    // attestation for this badgeType + college. If so, reuse the existing
    // UID instead of issuing a duplicate on-chain attestation.
    const existingUid = await findExistingAttestation(walletAddress, badgeSlug, collegeName);
    if (existingUid) {
        console.log(
            `[attestation] Skipping duplicate attestation for wallet=${walletAddress}, ` +
                `badge=${badgeSlug}, college=${collegeName}. Reusing existing UID: ${existingUid}`
        );
        return existingUid;
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
