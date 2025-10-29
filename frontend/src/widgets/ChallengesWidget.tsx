import React from "react";

export default function ChallengesWidget() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
            Challenges
          </p>
          <p className="text-2xl font-bold text-orange-600">2</p>
        </div>
        <div className="bg-orange-100 rounded-full p-3">
          <svg
            className="w-6 h-6 text-orange-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
            ></path>
          </svg>
        </div>
      </div>
      <div className="mt-4">
        <p className="text-xs text-gray-500">Last 7 days</p>
      </div>
    </div>
  );
}
