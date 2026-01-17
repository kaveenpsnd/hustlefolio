import { useMemo } from 'react';
import type { User } from '@/types';

interface AuthorCardProps {
  author: User;
  streakDays: number;
}

export function AuthorCard({ author, streakDays }: AuthorCardProps) {
  // Generate mock contribution data for the last 30 days
  const contributionData = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000),
      count: Math.random() > 0.3 ? Math.floor(Math.random() * 5) + 1 : 0,
    }));
  }, []);

  const maxCount = Math.max(...contributionData.map(d => d.count));

  return (
    <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <div className="flex items-start justify-between">
        {/* Author Info */}
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center flex-shrink-0">
            {author.avatarUrl ? (
              <img 
                src={author.avatarUrl} 
                alt={author.displayName || author.username}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-white font-semibold text-2xl">
                {(author.displayName || author.username).charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-1">
              Written by {author.displayName || author.username}
            </h3>
            <p className="text-gray-600 mb-4 leading-relaxed">
              {author.bio || 'No bio available'}
            </p>
          </div>
        </div>

        {/* Follow Button */}
        <button className="px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-all flex-shrink-0">
          Follow
        </button>
      </div>

      {/* Contribution Activity */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Contribution Activity
          </h4>
          <span className="text-xs text-gray-500">Last 30 days</span>
        </div>

        {/* Activity Graph */}
        <div className="flex items-end justify-between gap-1 h-16">
          {contributionData.map((data, index) => {
            const height = data.count > 0 ? (data.count / maxCount) * 100 : 10;
            const color = data.count === 0 
              ? 'bg-gray-200' 
              : data.count <= 2 
              ? 'bg-emerald-300' 
              : data.count <= 4 
              ? 'bg-emerald-400' 
              : 'bg-emerald-500';

            return (
              <div
                key={index}
                className="flex-1 group relative"
              >
                <div 
                  className={`${color} rounded-t transition-all hover:opacity-80 cursor-pointer`}
                  style={{ height: `${height}%` }}
                  title={`${data.count} contribution${data.count !== 1 ? 's' : ''} on ${data.date.toLocaleDateString()}`}
                />
                
                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  {data.count} posts
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-gray-200"></div>
              <div className="w-3 h-3 rounded-sm bg-emerald-300"></div>
              <div className="w-3 h-3 rounded-sm bg-emerald-400"></div>
              <div className="w-3 h-3 rounded-sm bg-emerald-500"></div>
            </div>
            <span>More</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <svg className="w-3.5 h-3.5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">{streakDays} day streak</span>
          </div>
        </div>
      </div>
    </div>
  );
}
