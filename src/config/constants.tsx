export const DB_NAME =
  process.env.NODE_ENV == "development"
    ? process.env.DEV_DB
    : process.env.PROD_DB;

export const BASE_URL =
  process.env.NODE_ENV === "development"
    ? process.env.NEXT_PUBLIC_LOCAL_BASE_URL
    : process.env.NEXT_PUBLIC_HOSTED_BASE_URL;

export const LIGHTHOUSE_BASE_API_KEY =
  process.env.NODE_ENV === "development"
    ? process.env.NEXT_PUBLIC_DEV_LIGHTHOUSE_KEY
    : process.env.NEXT_PUBLIC_PROD_LIGHTHOUSE_KEY;

export const NFT_LIGHTHOUSE_BASE_API_KEY =
  process.env.NODE_ENV === "development"
    ? process.env.NEXT_PUBLIC_DEV_NFT_LIGHTHOUSE_KEY
    : process.env.NEXT_PUBLIC_PROD_NFT_LIGHTHOUSE_KEY;

export const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_LOCAL_BASE_URL,
  process.env.NEXT_PUBLIC_HOSTED_BASE_URL,
].filter(Boolean);

export const SOCKET_BASE_URL =
  process.env.NODE_ENV === "development"
    ? process.env.NEXT_PUBLIC_SOCKET_LOCAL_URL
    : process.env.NEXT_PUBLIC_SOCKET_HOSTED_URL;

export const SCHEMA_ID =
  process.env.NODE_ENV == "development"
    ? "0x1e7a1d1627d7ae5d324aa0fd78c5b42474e926dcca73c31365444fd716ff025e"
    : "0x1e7a1d1627d7ae5d324aa0fd78c5b42474e926dcca73c31365444fd716ff025e";

export const OFFCHAIN_OP_ATTESTATION_BASE_URL =
  process.env.NODE_ENV == "development"
    ? "https://optimism.easscan.org"
    : "https://optimism.easscan.org";

export const OFFCHAIN_ARB_ATTESTATION_BASE_URL =
  process.env.NODE_ENV == "development"
    ? "https://arbitrum.easscan.org"
    : "https://arbitrum.easscan.org";

export const ATTESTATION_OP_URL =
  process.env.NODE_ENV == "development"
    ? process.env.NEXT_PUBLIC_OP_ATTESTATION_URL
    : process.env.NEXT_PUBLIC_OP_ATTESTATION_URL;

export const ATTESTATION_ARB_URL =
  process.env.NODE_ENV == "development"
    ? process.env.NEXT_PUBLIC_ARB_ATTESTATION_URL
    : process.env.NEXT_PUBLIC_ARB_ATTESTATION_URL;

export const MEETING_BASE_URL =
  process.env.NODE_ENV == "development"
    ? process.env.NEXT_PUBLIC_LOCAL_MEETING_APP_URL
    : process.env.NEXT_PUBLIC_HOSTED_MEETING_APP_URL;

//--------------------------------------------------------------------------------//

// // // // For development testing
// export const DB_NAME =
//   process.env.NODE_ENV == "development"
//     ? process.env.DEV_DB
//     : process.env.PROD_DB;

// export const BASE_URL =
//   process.env.NODE_ENV === "development"
//     ? process.env.NEXT_PUBLIC_LOCAL_BASE_URL
//     : process.env.NEXT_PUBLIC_HOSTED_BASE_URL;

// export const LIGHTHOUSE_BASE_API_KEY =
//   process.env.NODE_ENV === "development"
//     ? process.env.NEXT_PUBLIC_DEV_LIGHTHOUSE_KEY
//     : process.env.NEXT_PUBLIC_DEV_LIGHTHOUSE_KEY;

// export const NFT_LIGHTHOUSE_BASE_API_KEY =
//   process.env.NODE_ENV === "development"
//     ? process.env.NEXT_PUBLIC_DEV_NFT_LIGHTHOUSE_KEY
//     : process.env.NEXT_PUBLIC_DEV_NFT_LIGHTHOUSE_KEY;

// export const ALLOWED_ORIGINS = [
//   process.env.NEXT_PUBLIC_LOCAL_BASE_URL,
//   process.env.NEXT_PUBLIC_HOSTED_BASE_URL,
// ].filter(Boolean);

// export const SOCKET_BASE_URL =
//   process.env.NODE_ENV === "development"
//     ? process.env.NEXT_PUBLIC_SOCKET_LOCAL_URL
//     : process.env.NEXT_PUBLIC_SOCKET_HOSTED_URL;

// export const SCHEMA_ID =
//   process.env.NODE_ENV == "development"
//     ? "0x2af46cd4e53ed6953e21e6f089645513fad2f918ddf6e892c7c843784eabfc9e"
//     : "0x2af46cd4e53ed6953e21e6f089645513fad2f918ddf6e892c7c843784eabfc9e";

// export const OFFCHAIN_OP_ATTESTATION_BASE_URL =
//   process.env.NODE_ENV == "development"
//     ? "https://optimism.easscan.org"
//     : "https://optimism.easscan.org";

// export const OFFCHAIN_ARB_ATTESTATION_BASE_URL =
//   process.env.NODE_ENV == "development"
//     ? "https://arbitrum.easscan.org"
//     : "https://arbitrum.easscan.org";

// export const ATTESTATION_OP_URL =
//   process.env.NODE_ENV == "development"
//     ? process.env.NEXT_PUBLIC_OP_ATTESTATION_URL
//     : process.env.NEXT_PUBLIC_OP_ATTESTATION_URL;

// export const ATTESTATION_ARB_URL =
//   process.env.NODE_ENV == "development"
//     ? process.env.NEXT_PUBLIC_ARB_ATTESTATION_URL
//     : process.env.NEXT_PUBLIC_ARB_ATTESTATION_URL;
