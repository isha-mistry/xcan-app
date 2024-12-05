import React from 'react';

const ProposalMainVotersSkeletonLoader = () => {
  return (
    <div className="flex flex-col gap-2 py-3 pl-2 pr-1 w-full xl:pl-3 xl:pr-2 my-3 border-gray-200">
      <div className="animate-pulse h-[440px] flex flex-col gap-2 overflow-hidden">
        {[...Array(4)].map((_, index) => (
          <div 
            className="flex items-center py-6 xl:px-6 px-3 bg-white w-full rounded-2xl border-2 border-transparent space-x-6"
            key={index}
          >
            <div className="flex-grow flex items-center space-x-2 1.3lg:space-x-4">
              <div className="xl:w-10 w-8 xl:h-10 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex flex-col">
                <div className="h-3 xs:h-4 bg-gray-200 rounded w-16 xs:w-20 2md:w-16"></div>
              </div>
            </div>
            <div className="flex items-center space-x-1 0.5xs:space-x-2 1.3lg:space-x-4">
              <div className="py-1 xs:py-2 rounded-full bg-gray-200 w-24 0.2xs:w-28 xs:w-36 2md:w-28 lg:w-[100px] 1.3lg:w-28 1.5xl:w-36 h-8"></div>
              <div className="w-5 h-5 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProposalMainVotersSkeletonLoader;