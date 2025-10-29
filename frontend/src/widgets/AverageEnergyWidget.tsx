import React from "react";

type AverageEnergyWidgetProps = {
  averageEnergy: number | null;
};

export default function AverageEnergyWidget({ averageEnergy }: AverageEnergyWidgetProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
            Avg. Energy
          </p>
          <p className="text-2xl font-bold text-blue-600">
            {averageEnergy !== null ? averageEnergy.toFixed(1) : "-"} / 5
          </p>
        </div>
        <div className="bg-blue-100 rounded-full p-3">
          <svg
            className="w-6 h-6 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            ></path>
          </svg>
        </div>
      </div>
      <div className="mt-4">
        <p className="text-xs text-gray-500">Per meal (last 30 days)</p>
      </div>
    </div>
  );
}