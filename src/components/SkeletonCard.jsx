// 🆕 ADDED (2025-10-17 02:25 IST)

import React from 'react';

const SkeletonCard = () => {
  return (
    <div className="glass-effect rounded-xl p-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          {/* Title skeleton */}
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
          {/* Description skeleton */}
          <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-2/3"></div>
        </div>
      </div>

      {/* Tags skeleton */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <div className="h-6 w-20 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
        <div className="h-6 w-24 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
      </div>

      {/* Code block skeleton */}
      <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-4 mb-4">
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-full mb-2"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-5/6 mb-2"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-4/6 mb-2"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
      </div>

      {/* Action buttons skeleton */}
      <div className="flex gap-2">
        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-600 rounded-lg"></div>
        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-600 rounded-lg"></div>
        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-600 rounded-lg"></div>
      </div>
    </div>
  );
};

export default SkeletonCard;
