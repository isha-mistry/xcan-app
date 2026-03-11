/**
 * EAS Schema Registration Script — Ethereum Sepolia
 *
 * Run this ONCE to register the badge attestation schema on Sepolia.
 * After registration, copy the Schema UID to your .env file.
 *
 * Prerequisites:
 *   1. npm install @ethereum-attestation-service/eas-sdk ethers dotenv
 *   2. Fund your issuer wallet with Sepolia ETH (use a faucet)
 *   3. Set SEPOLIA_RPC and ISSUER_PRIVATE_KEY in .env
 *
 * Usage:
 *   node scripts/register-schema.js
 *
 * After success, view schema at: https://sepolia.easscan.org/schema/view/<UID>
 */

require('dotenv').config();
const { ethers } = require('ethers');
const { SchemaRegistry } = require('@ethereum-attestation-service/eas-sdk');

// ── Verified Ethereum Sepolia addresses ──────────────────────────────────────
const SCHEMA_REGISTRY_ADDRESS = '0x0a7E2Ff54e76B8E6659aedc9103FB21c038050D0';

// ── Badge attestation schema ─────────────────────────────────────────────────
// Fields:
//   badgeType      (string)  — slug: builder_lab_participant, builder_pod_member,
//                              builder_pod_lead, regional_showcase_finalist,
//                              regional_showcase_winner
//   issuer         (string)  — always "Lampros DAO" — hard on-chain proof of issuer
//   college        (string)  — college / pod name the badge is associated with
//   programCohort  (string)  — batch year e.g. "2026" (useful for multi-year queries)
//   walletAddress  (address) — student wallet (makes badges queryable by address on easscan)
//   issuedAt       (uint256) — unix timestamp of badge issuance
const SCHEMA = 'string badgeType, string issuer, string college, string programCohort, address walletAddress, uint256 issuedAt';

async function registerSchema() {
  const RPC_URL = process.env.SEPOLIA_RPC;
  const PRIVATE_KEY = process.env.ISSUER_PRIVATE_KEY;

  if (!RPC_URL || !PRIVATE_KEY) {
    console.error('❌ Missing env vars. Required: SEPOLIA_RPC, ISSUER_PRIVATE_KEY');
    console.error('   Set these in your .env file and try again.');
    process.exit(1);
  }

  console.log('🔗 Connecting to Ethereum Sepolia...');
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);

  const balance = await provider.getBalance(signer.address);
  console.log(`💰 Issuer wallet: ${signer.address}`);
  console.log(`   Balance: ${ethers.formatEther(balance)} ETH`);

  if (balance === 0n) {
    console.error('❌ Wallet has no Sepolia ETH. Get some from a faucet:');
    console.error('   https://sepoliafaucet.com/');
    process.exit(1);
  }

  console.log('📝 Registering schema on SchemaRegistry...');
  console.log(`   Schema: "${SCHEMA}"`);
  console.log(`   Registry: ${SCHEMA_REGISTRY_ADDRESS}`);

  const schemaRegistry = new SchemaRegistry(SCHEMA_REGISTRY_ADDRESS);
  schemaRegistry.connect(signer);

  const tx = await schemaRegistry.register({
    schema: SCHEMA,
    revocable: true,
  });

  console.log('⏳ Waiting for transaction confirmation...');
  const schemaUID = await tx.wait();

  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('✅ Schema registered successfully!');
  console.log('');
  console.log(`   Schema UID: ${schemaUID}`);
  console.log(`   View at:    https://sepolia.easscan.org/schema/view/${schemaUID}`);
  console.log('');
  console.log('📋 Add this to your .env:');
  console.log(`   EAS_SCHEMA_UID=${schemaUID}`);
  console.log('═══════════════════════════════════════════════════════════════');
}

registerSchema().catch((err) => {
  console.error('❌ Schema registration failed:', err.message);
  process.exit(1);
});
