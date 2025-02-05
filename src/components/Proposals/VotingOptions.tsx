import React from 'react';
import { ResponsiveContainer, Treemap, Tooltip } from 'recharts';

interface VotingItem {
  option: string;
  votes: string;
  isWinner?: boolean;
}

const VotingTreemap = ({ votingData, winners }: { 
  votingData: VotingItem[], 
  winners?: string[] 
}) => {
  const transformedData = [
    {
      name: "Votes",
      children: votingData?.map((item: VotingItem) => ({
        name: item.option,
        size: Number(item.votes) / 10**18,
        originalVotes: Number(item.votes),
        isWinner: winners ? winners.includes(item.option) : false
      }))
    }
  ];
  const formatWeight = (weight: number): string => {
    if (weight >= 1e9) {
      return (weight / 1e9).toFixed(2) + "B";
    } else if (weight >= 1e6) {
      return (weight / 1e6).toFixed(2) + "M";
    } else if (weight >= 1e3) {
      return (weight / 1e3).toFixed(2) + "K";
    } else {
      return weight?.toFixed(2);
    }
  };
  const WINNER_COLOR = '#36B853';
  const LOSER_COLOR = '#DC3545';
  const OTHER_COLORS = ['#8889DD', '#9597E4', '#E2CF45', '#F8C12D'];

  const CustomizedContent = (props: any) => {
    const { root, depth, x, y, width, height, index, name, value } = props;
    
    const currentNode = root.children?.[index];
    const votesValue = currentNode?.value || currentNode?.size || 0;
    
    const getColor = () => {
      if (depth <= 2) {
        if (currentNode?.isWinner) return WINNER_COLOR;
        if (currentNode && !currentNode.isWinner) return LOSER_COLOR;
        return OTHER_COLORS[Math.floor((index / root.children.length) * OTHER_COLORS.length)];
      }
      return "none";
    };

    // Truncate text function
    const truncateText = (text: string, maxWidth: number) => {
      const fontSize = 12;
      const charWidth = fontSize * 0.6; // Approximate character width
      const maxChars = Math.floor(maxWidth / charWidth);
      return text.length > maxChars ? text.slice(0, maxChars - 3) + '...' : text;
    };

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: getColor(),
            stroke: "#fff",
            strokeWidth: 2 / (depth + 1e-10),
            strokeOpacity: 1 / (depth + 1e-10)
          }}
        />
        {depth > 1 && width > 50 && height > 30 && (
          <>
            <text 
              x={x + width / 2} 
              y={y + height / 2 - 10} 
              textAnchor="middle" 
              fill="#fff" 
              fontSize={12}
              dominantBaseline="middle"
            >
              {truncateText(currentNode?.name || '', width)}
            </text>
            <text 
              x={x + width / 2} 
              y={y + height / 2 + 10} 
              textAnchor="middle" 
              fill="#fff" 
              fontSize={10}
              dominantBaseline="middle"
            >
              {formatWeight(votesValue)}
              {/* {formatWeight(votesValue.toLocaleString(undefined, { maximumFractionDigits: 0 }))} */}
            </text>
          </>
        )}
      </g>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border rounded shadow-lg">
          <p className="font-bold">{data.name}</p>
          <p>Votes: {formatWeight(Number(data.originalVotes/10**18))}</p>
          {/* <p>Votes: {formatWeight(data.originalVotes.toLocaleString())}</p> */}
          {/* {data.isWinner && <p className="text-green-600">Winner</p>} */}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={transformedData}
          dataKey="size"
          stroke="#fff"
          fill="#8884d8"
          content={<CustomizedContent />}
        >
          <Tooltip content={<CustomTooltip />} />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
};

export default VotingTreemap;