import React from "react";

function PageBackgroundPattern() {
  return (
    <div
      className="fixed inset-0 opacity-10 z-[-4px]"
      style={{
        backgroundImage: `linear-gradient(30deg, #0A142A 12%, transparent 12.5%, transparent 87%, #0A142A 87.5%, #0A142A),
                  linear-gradient(150deg, #0A142A 12%, transparent 12.5%, transparent 87%, #0A142A 87.5%, #0A142A),
                  linear-gradient(30deg, #0A142A 12%, transparent 12.5%, transparent 87%, #0A142A 87.5%, #0A142A),
                  linear-gradient(150deg, #0A142A 12%, transparent 12.5%, transparent 87%, #0A142A 87.5%, #0A142A),
                  linear-gradient(60deg, #0D1527 25%, transparent 25.5%, transparent 75%, #050B1A 75%, #0D1527),
                  linear-gradient(60deg, #0D1A34 25%, transparent 25.5%, transparent 75%, #171D51 75%, #0D1527)`,
        backgroundSize: "82rem 50rem",
        backgroundPosition: "0 0, 0 0, 40px 70px, 40px 70px, 0 0, 40px 70px",
      }}
    />
  );
}

export default PageBackgroundPattern;
