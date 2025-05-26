import React from "react";

function PageBackgroundPattern() {
  return (
    <div
      className="fixed inset-0 opacity-10 z-[-4px]"
      style={{
        backgroundImage: `linear-gradient(30deg, #171c24 12%, transparent 12.5%, transparent 87%, #171c24 87.5%, #171c24),
                  linear-gradient(150deg, #171c24 12%, transparent 12.5%, transparent 87%, #171c24 87.5%, #171c24),
                  linear-gradient(30deg, #171c24 12%, transparent 12.5%, transparent 87%, #171c24 87.5%, #171c24),
                  linear-gradient(150deg, #171c24 12%, transparent 12.5%, transparent 87%, #171c24 87.5%, #171c24),
                  linear-gradient(60deg, #12161c 25%, transparent 25.5%, transparent 75%, #0e1115 75%, #12161c),
                  linear-gradient(60deg, #0f151c 25%, transparent 25.5%, transparent 75%, #131920 75%, #12161c)`,
        backgroundSize: "82rem 50rem",
        backgroundPosition: "0 0, 0 0, 40px 70px, 40px 70px, 0 0, 40px 70px",
      }}
    />
  );
}

export default PageBackgroundPattern;
