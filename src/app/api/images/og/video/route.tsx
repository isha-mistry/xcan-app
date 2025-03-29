import { NextRequest } from "next/server";
import { ImageResponse } from "next/og";
export const runtime = "edge";
export const revalidate = 0;
const size = {
  width: 1200,
  height: 630,
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address") || "";
  const title = searchParams.get("title") || "";
  const description = searchParams.get("desc") || "";
  const dao_name = searchParams.get("dao_name") || "";
  const avatar = searchParams.get("avatar") || "";

  let icon = "";

  if (dao_name === "optimism") {
    icon =
      "https://gateway.lighthouse.storage/ipfs/QmXaKNwUxvd4Ksc9R6hd36eBo97e7e7YPDCVuvHwqG4zgQ";
  } else if (dao_name === "arbitrum") {
    icon =
      "https://gateway.lighthouse.storage/ipfs/QmdP6ZkLq4FF8dcvxBs48chqFiXu7Gr8SgPCqMtfr7VA4L";
  }

  const main = await fetch(new URL("../assets/main.jpg", import.meta.url)).then(
    (res) => res.arrayBuffer()
  );

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
        }}
      >
        <img
          /*@ts-ignore*/
          src={main}
          style={{
            position: "absolute",
            zIndex: -1,
          }}
          alt="background"
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            paddingTop: "10%",
            paddingLeft: "17%",
          }}
        >
          <div style={{ display: "flex", gap: "20px" }}>
            <img
              src={icon}
              alt="icon"
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
              }}
            />
          </div>
          <div
            style={{
              textAlign: "left",
              display: "flex",
              flexDirection: "column",
              width: "420px",
              fontWeight: 600,
            }}
          >
            <div
              style={{
                color: "black",
                fontSize: "32px",
                paddingTop: "30px",
                paddingBottom: "0px",
                display: "flex",
              }}
            >
              {title}
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <img
                src={avatar}
                alt="icon"
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                }}
              />
              <div
                style={{
                  fontSize: "20px",
                  textTransform: "capitalize",
                }}
              >
                {address}
              </div>
            </div>
            <div
              style={{
                fontSize: "24px",
                paddingTop: "30px",
                paddingBottom: "20px",
                width: "420px",
                lineHeight: "1.3",
              }}
            >
              {description}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
