import React from 'react';
import { RotatingLines } from 'react-loader-spinner';
import { ArrowRight, Activity, Users, Calendar, Clock } from 'lucide-react';

interface StatsBlock {
    number: number;
    desc: string;
    ref: string;
  }
  
  interface StatsGridProps {
    blocks: StatsBlock[];
    isLoading: boolean;
    onBlockClick: (ref: string) => void;
  }

const StatsGrid: React.FC<StatsGridProps> = ({ blocks, isLoading, onBlockClick }) => {
  // Get appropriate icon based on description
  const getIcon = (desc: string): React.ReactNode => {
    if (desc.includes('Sessions hosted')) return <Calendar className="w-6 h-6 text-blue-200" />;
    if (desc.includes('Sessions attended')) return <Users className="w-6 h-6 text-blue-200" />;
    if (desc.includes('Office Hours hosted')) return <Activity className="w-6 h-6 text-blue-200" />;
    return <Clock className="w-6 h-6 text-blue-200" />;
  };

  return (
    <div className="grid xs:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
      {blocks.length > 0 ? (
        blocks.map((block, index) => (
          <div
            key={index}
            onClick={() => onBlockClick(block.ref)}
            className="group relative overflow-hidden bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative p-6 flex flex-col items-start">
              {/* Icon and Number Row */}
              <div className="flex items-center justify-between w-full mb-4">
                <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-white/10 transition-colors duration-300">
                  {getIcon(block.desc)}
                </div>
                {isLoading ? (
                  <RotatingLines
                    visible={true}
                    width="36"
                    strokeColor="grey"
                    ariaLabel="loading"
                  />
                ) : (
                  <span className="text-3xl font-bold text-gray-800 group-hover:text-white transition-colors duration-300">
                    {block.number}
                  </span>
                )}
              </div>
              
              {/* Description and Arrow */}
              <div className="flex items-center justify-between w-full">
                <span className="text-sm font-medium text-gray-600 group-hover:text-white transition-colors duration-300">
                  {block.desc}
                </span>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors duration-300 transform group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="col-span-full text-center py-8 text-gray-500 bg-gray-50 rounded-xl">
          No data available
        </div>
      )}
    </div>
  );
};

export default StatsGrid;