import React from "react";
import { Timer, Zap } from "lucide-react";

function OfficeHoursAlertMessage() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-[0_15px_40px_-10px_rgba(59,130,246,0.3)] overflow-hidden max-w-md w-full border border-blue-100">
        <div className="absolute top-0 left-0 right-0 h-2 bg-blue-500"></div>

        <div className="p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-100 rounded-full p-4 animate-spin-subtle">
              <Timer className="w-12 h-12 text-blue-600" strokeWidth={1.5} />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-blue-800 mb-4">
            Lectures
          </h2>   

          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-blue-700 text-lg">
              Lectures are currently being developed. In the meantime,
              please enjoy our 1:1 sessions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OfficeHoursAlertMessage;
