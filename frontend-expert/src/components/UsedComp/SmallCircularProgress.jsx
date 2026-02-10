import React from "react";

const SmallCircularProgress = ({ percentage = 0 }) => {
  const radius = 17;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg
        width={radius * 2}
        height={radius * 2}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={radius}
          cy={radius}
          r={radius - 2}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="2"
        />
        {/* Progress circle */}
        <circle
          cx={radius}
          cy={radius}
          r={radius - 2}
          fill="none"
          stroke={percentage === 100 ? "#0095D9" : "#f97316"}
          strokeWidth="2"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-300"
        />
      </svg>
      {/* Percentage text */}
      <div className="absolute flex items-center justify-center">
        <span className="text-[8px] font-semibold text-gray-700">
          {percentage}%
        </span>
      </div>
    </div>
  );
};

export default SmallCircularProgress;