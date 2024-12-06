import { fetchApi } from "@/utils/api";

async function handleResponse(response: Response) {
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }
  return response.json();
}

export async function calculateTempCpi(
delegatorAddress: `0x${string}` | undefined | string | null, toAddress: `0x${string}` | undefined | string | null, address: `0x${string}` | undefined | string | null, token: string | null) {
  const myHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...(address && { "x-wallet-address": address,"Authorization":`Bearer ${token}` }),
  };

  const raw = JSON.stringify({
    delegatorAddress: delegatorAddress,
    toAddress: toAddress,
  });
  const requestOptions: any = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };
  // console.log("requestOptions++++++++++++++++++++++++++++", requestOptions);
  const response = await fetchApi(`/calculate-temp-cpi`, requestOptions);
  const result = handleResponse(response);
  return result;
}
