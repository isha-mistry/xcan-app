import React from "react";
const ProposalMainStatusSkeletonLoader = () => {
  // Create an array of 7 items to match the timeline points in the original component
  const timelinePoints = Array(7).fill(null);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full relative p-8 rounded-[1rem]">
      {/* Title skeleton */}
      <div className="bg-gray-200 animate-pulse h-8 w-48 rounded-full mb-8"></div>

      <div className="relative w-64 h-64 mb-8">
        {/* Background circle skeleton */}
        <div className="absolute inset-0 rounded-full bg-gray-200 animate-pulse opacity-50"></div>

        {/* Main circle skeleton */}
        <div className="absolute inset-0 border-4 border-gray-200 animate-pulse rounded-full"></div>

        {/* Timeline points skeletons */}
        {timelinePoints.map((_, index) => {
          // Calculate position on the circle for each point
          const angle = index * (360 / timelinePoints.length) * (Math.PI / 180);
          const radius = 124;
          const x = radius * Math.cos(angle - Math.PI / 2) + 128;
          const y = radius * Math.sin(angle - Math.PI / 2) + 128;

          return (
            <div
              key={index}
              className="absolute z-20"
              style={{
                left: `${x}px`,
                top: `${y}px`,
                transform: "translate(-50%, -50%)",
              }}
            >
              {/* Timeline point skeleton */}
              <div className="relative">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-200 animate-pulse shadow-md"></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProposalMainStatusSkeletonLoader;
