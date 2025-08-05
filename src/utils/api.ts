type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface RequestOptions extends RequestInit {
  method?: HttpMethod;
  body?: any;
  headers?: Record<string, string> | Headers;
}

export async function fetchApi(
  endpoint: string,
  options: RequestOptions | RequestInit = {}
) {
  const { method = "GET", body, headers = {}, ...otherOptions } = options;

  // Convert Headers object to plain object if needed
  let headersObject: Record<string, string> = {};

  if (headers instanceof Headers) {
    // Convert Headers object to plain object
    Array.from(headers.entries()).forEach(([key, value]) => {
      headersObject[key] = value;
    });
  } else {
    headersObject = headers as Record<string, string>;
  }

  const defaultHeaders = {
    "Content-Type": "application/json",
  };

  // Merge headers properly
  const mergedHeaders = {
    ...defaultHeaders,
    ...headersObject,
  };

  // Create fetch options
  const fetchOptions: RequestInit = {
    method,
    headers: mergedHeaders,
    ...otherOptions,
  };
  if (body) {
    if (typeof body === "string") {
      fetchOptions.body = body;
    } else if (method === "POST" || method === "PUT") {
      fetchOptions.body = JSON.stringify(body);
    }
  }

  const response = await fetch(`/api/proxy${endpoint}`, fetchOptions);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response;
}

// Helper function to create or verify user account
export async function createOrVerifyAccount(
  walletAddress: string,
  token: string | null,
  referrer: string | null
) {
  try {
    const response = await fetch(`/api/auth/accountcreate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-wallet-address": walletAddress,
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        address: walletAddress,
        isEmailVisible: false,
        createdAt: new Date(),
        referrer: referrer,
      }),
    });

    const responseText = await response.text();

    if (response.status === 200) {
      // console.log("Account created successfully");
    } else if (response.status === 409) {
      // console.log("Account already exists");
    } else {
      throw new Error(`Failed to create/verify account: ${responseText}`);
    }
  } catch (error) {
    console.error("Error creating/verifying account:", error);
    throw error;
  }
}
