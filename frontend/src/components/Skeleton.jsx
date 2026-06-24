import React from 'react';

export default function Skeleton({ type = 'text', count = 1, className = '' }) {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className="border border-slate-200/60 dark:border-zinc-800/60 rounded-2xl p-5 bg-white dark:bg-zinc-900 shadow-sm animate-pulse space-y-4 w-full">
            <div className="h-44 w-full bg-slate-200 dark:bg-zinc-800 rounded-xl" />
            <div className="space-y-2">
              <div className="h-5 bg-slate-250 dark:bg-zinc-755 rounded w-2/3" />
              <div className="h-3.5 bg-slate-200 dark:bg-zinc-800 rounded w-full animate-pulse" />
              <div className="h-3.5 bg-slate-200 dark:bg-zinc-800 rounded w-5/6 animate-pulse" />
            </div>
            <div className="flex justify-end pt-2">
              <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded w-1/4" />
            </div>
          </div>
        );

      case 'table':
        return (
          <div className="w-full space-y-3 animate-pulse">
            <div className="h-10 bg-slate-200 dark:bg-zinc-850 rounded-lg w-full" />
            {[...Array(count)].map((_, i) => (
              <div key={i} className="flex space-x-4 items-center py-3 border-b border-slate-100 dark:border-zinc-900">
                <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded w-1/12" />
                <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded w-3/12" />
                <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded w-2/12" />
                <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded w-2/12" />
                <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded w-4/12 flex-grow" />
              </div>
            ))}
          </div>
        );

      case 'form':
        return (
          <div className="space-y-5 animate-pulse w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded w-1/4" />
                <div className="h-10 bg-slate-200 dark:bg-zinc-800 rounded-lg w-full" />
              </div>
              <div className="space-y-1.5">
                <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded w-1/4" />
                <div className="h-10 bg-slate-200 dark:bg-zinc-800 rounded-lg w-full" />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded w-1/5" />
              <div className="h-20 bg-slate-200 dark:bg-zinc-800 rounded-lg w-full" />
            </div>
            <div className="h-12 bg-slate-200 dark:bg-zinc-800 rounded-xl w-full" />
          </div>
        );

      case 'text':
      default:
        return (
          <div className={`space-y-2.5 animate-pulse w-full ${className}`}>
            {[...Array(count)].map((_, i) => (
              <div 
                key={i} 
                className="h-3.5 bg-slate-200 dark:bg-zinc-800 rounded"
                style={{ width: i === count - 1 && count > 1 ? '70%' : '100%' }}
              />
            ))}
          </div>
        );
    }
  };

  return (
    <>
      {count > 1 && type !== 'table' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {[...Array(count)].map((_, idx) => (
            <React.Fragment key={idx}>{renderSkeleton()}</React.Fragment>
          ))}
        </div>
      ) : (
        renderSkeleton()
      )}
    </>
  );
}
