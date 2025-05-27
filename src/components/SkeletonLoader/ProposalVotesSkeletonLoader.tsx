import React from "react";
const ProposalvotesSkeletonLoader = () => {
  return (
    <div className="w-full z-10 rounded-[1rem] shadow-xl transition-shadow duration-300 ease-in-out  font-tektur min-h-[416px] 1.3lg:h-fit h-full">
      <div className="w-full flex justify-center flex-col rounded-[1rem] font-tektur h-fit p-6 min-h-[416px] 1.3lg:h-fit">
        {/* Title skeleton */}
        <div className="text-2xl font-bold mb-6 bg-blue-shade-300 animate-pulse h-8 w-48 mx-auto rounded-full"></div>

        {/* Quorum and Total Votes skeleton */}
        <div className="mb-4 flex flex-col items-start gap-2">
          <div className="text-sm flex justify-between w-full">
            <div className="flex gap-2 items-center">
              <div className="bg-blue-shade-300 animate-pulse h-5 w-5 rounded-full"></div>
              <div className="bg-blue-shade-300 animate-pulse h-5 w-16 rounded-full"></div>
            </div>
            <div className="bg-blue-shade-300 animate-pulse h-5 w-28 rounded-full"></div>
          </div>
          <div className="text-sm flex gap-2 items-center">
            <div className="bg-blue-shade-300 animate-pulse h-5 w-5 rounded-full"></div>
            <div className="bg-blue-shade-300 animate-pulse h-5 w-20 rounded-full"></div>
          </div>
        </div>

        {/* Pie chart skeleton */}
        <div className="w-full h-[200px] flex items-center justify-center">
          <div className="relative w-[160px] h-[160px] rounded-full bg-blue-shade-300 animate-pulse">
            {/* Inner circle to create donut effect */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[60px] h-[60px] rounded-full bg-blue-shade-400"></div>
          </div>
        </div>

        {/* Legend skeleton */}
        <div className="flex justify-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <div className="bg-blue-shade-300 animate-pulse h-3 w-3 rounded-sm"></div>
            <div className="bg-blue-shade-300 animate-pulse h-4 w-8 rounded-full"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-blue-shade-300 animate-pulse h-3 w-3 rounded-sm"></div>
            <div className="bg-blue-shade-300 animate-pulse h-4 w-16 rounded-full"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-blue-shade-300 animate-pulse h-3 w-3 rounded-sm"></div>
            <div className="bg-blue-shade-300 animate-pulse h-4 w-12 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalvotesSkeletonLoader;
