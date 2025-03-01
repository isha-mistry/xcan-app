"use client";
import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { FaBalanceScale, FaVoteYea } from "react-icons/fa";

const COLORS = ["#4caf50", "#ea4034", "#004dff"]; // For, Against, Abstain

const Proposalvotes: React.FC = () => {
  const data = [
    { name: "For", value: 130.18 },
    { name: "Against", value: 20.19 },
    { name: "Abstain", value: 33.8 },
  ];

  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 rounded-md shadow-md text-sm">
          <p className="font-bold">{`${payload[0]?.name}`}</p>
          <p className="text-gray-700">{`Votes : ${payload[0].value.toFixed(
            2
          )}`}</p>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="w-full flex justify-center flex-col rounded-[1rem] font-poppins h-fit p-6  min-h-[416px] 1.3lg:h-fit">
      <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-gray-700 to-slate-600 text-center">
        Current Votes
      </h2>

      <div className="mb-4 flex flex-col items-start gap-2">
        <p className="text-sm flex justify-between w-full font-medium">
          <span className="flex gap-2">
            <FaBalanceScale size={18} className="text-indigo-600" />
            Quorum
          </span>{" "}
          <span className="">163.98M of 121.7M</span>
        </p>
        <p className="text-sm font-medium">
          <span className="flex gap-2">
            <FaVoteYea size={18} className="text-indigo-600" />
            Total Votes
          </span>{" "}
        </p>
      </div>

      <div style={{ width: "100%", height: 200 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              innerRadius={30}
              labelLine={false}
              label={false}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  strokeWidth={2}
                  stroke="#fff"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconSize={12}
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ paddingTop: 10 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Proposalvotes;
