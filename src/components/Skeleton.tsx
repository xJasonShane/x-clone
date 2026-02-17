'use client';

import { cn } from '@/lib/utils';

interface TweetSkeletonProps {
  count?: number;
}

export function TweetSkeleton({ count = 3 }: TweetSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex gap-3 px-4 py-3 border-b border-[rgb(47,51,54)] animate-pulse"
        >
          {/* Avatar skeleton */}
          <div className="w-10 h-10 rounded-full bg-[rgb(39,44,50)] flex-shrink-0" />

          {/* Content skeleton */}
          <div className="flex-1 space-y-2">
            {/* Header skeleton */}
            <div className="flex items-center gap-2">
              <div className="h-4 bg-[rgb(39,44,50)] rounded w-24" />
              <div className="h-4 bg-[rgb(39,44,50)] rounded w-16" />
              <div className="h-4 bg-[rgb(39,44,50)] rounded w-10" />
            </div>

            {/* Text skeleton */}
            <div className="space-y-1.5">
              <div className="h-4 bg-[rgb(39,44,50)] rounded w-full" />
              <div className="h-4 bg-[rgb(39,44,50)] rounded w-4/5" />
            </div>

            {/* Actions skeleton */}
            <div className="flex items-center justify-between pt-2">
              <div className="h-4 bg-[rgb(39,44,50)] rounded w-12" />
              <div className="h-4 bg-[rgb(39,44,50)] rounded w-12" />
              <div className="h-4 bg-[rgb(39,44,50)] rounded w-12" />
              <div className="h-4 bg-[rgb(39,44,50)] rounded w-12" />
              <div className="h-4 bg-[rgb(39,44,50)] rounded w-8" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Cover image skeleton */}
      <div className="h-52 bg-[rgb(39,44,50)]" />

      {/* Profile info skeleton */}
      <div className="px-4 pb-4">
        <div className="-mt-16 mb-3 flex justify-between items-end">
          <div className="w-32 h-32 rounded-full border-4 border-black bg-[rgb(39,44,50)]" />
          <div className="h-9 w-24 bg-[rgb(39,44,50)] rounded-full" />
        </div>

        <div className="space-y-2">
          <div className="h-6 bg-[rgb(39,44,50)] rounded w-32" />
          <div className="h-4 bg-[rgb(39,44,50)] rounded w-24" />
          <div className="h-4 bg-[rgb(39,44,50)] rounded w-full mt-2" />
          <div className="h-4 bg-[rgb(39,44,50)] rounded w-3/4" />
          <div className="flex gap-4 mt-3">
            <div className="h-4 bg-[rgb(39,44,50)] rounded w-20" />
            <div className="h-4 bg-[rgb(39,44,50)] rounded w-20" />
          </div>
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="flex border-b border-[rgb(47,51,54)]">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex-1 py-4">
            <div className="h-4 bg-[rgb(39,44,50)] rounded w-12 mx-auto" />
          </div>
        ))}
      </div>

      {/* Tweets skeleton */}
      <TweetSkeleton count={5} />
    </div>
  );
}

export function NotificationSkeleton({ count = 5 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex gap-3 px-4 py-3 border-b border-[rgb(47,51,54)] animate-pulse"
        >
          <div className="w-10 h-10 rounded-full bg-[rgb(39,44,50)]" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-[rgb(39,44,50)] rounded w-3/4" />
            <div className="h-4 bg-[rgb(39,44,50)] rounded w-1/2" />
          </div>
        </div>
      ))}
    </>
  );
}
