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
    if (desc.includes('Sessions hosted')) return <Calendar className="w-6 h-6 text-blue-400 group-hover:text-blue-300 transition-colors" />;
    if (desc.includes('Sessions attended')) return <Users className="w-6 h-6 text-blue-400 group-hover:text-blue-300 transition-colors" />;
    if (desc.includes('Lectures hosted')) return <Activity className="w-6 h-6 text-blue-400 group-hover:text-blue-300 transition-colors" />;
    return <Clock className="w-6 h-6 text-blue-400 group-hover:text-blue-300 transition-colors" />;
  };

  return (
    <div className="grid xs:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
      {blocks.length > 0 ? (
        blocks.map((block, index) => (
          <div
            key={index}
            onClick={() => onBlockClick(block.ref)}
            className="group relative overflow-hidden bg-white/[0.03] backdrop-blur-xl rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer border border-white/10 hover:border-blue-500/30"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative p-6 flex flex-col items-start">
              {/* Icon and Number Row */}
              <div className="flex items-center justify-between w-full mb-4">
                <div className="p-3 bg-white/5 rounded-xl group-hover:bg-blue-500/10 transition-colors duration-500 border border-white/5">
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
                  <span className="text-3xl font-black text-white group-hover:text-blue-400 transition-all duration-500 font-unbounded tracking-tighter">
                    {block.number}
                  </span>
                )}
              </div>

              {/* Description and Arrow */}
              <div className="flex items-center justify-between w-full">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white/70 transition-colors duration-500">
                  {block.desc}
                </span>
                <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-blue-400 transition-all duration-500 transform group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="col-span-full text-center py-12 text-white/20 bg-white/[0.02] border border-dashed border-white/10 rounded-2xl font-bold uppercase tracking-widest text-xs">
          No data available
        </div>
      )}
    </div>
  );
};

export default StatsGrid;