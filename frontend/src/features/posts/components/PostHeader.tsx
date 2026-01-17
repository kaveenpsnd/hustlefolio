import { format } from 'date-fns';
import type { User } from '@/types';

interface PostHeaderProps {
  author: User;
  publishedAt: string;
  streakDays: number;
}

export function PostHeader({ author, publishedAt, streakDays }: PostHeaderProps) {
  const formattedDate = format(new Date(publishedAt), 'MMM dd, yyyy');
  
  return (
    <div className="px-12 pb-6 flex items-center justify-between border-b border-gray-100">
      <div className="flex items-center gap-3">
        {/* Author Avatar */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center">
          {author.avatarUrl ? (
            <img 
              src={author.avatarUrl} 
              alt={author.displayName || author.username}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-white font-semibold text-lg">
              {(author.displayName || author.username).charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* Author Info */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900 hover:text-primary-600 cursor-pointer transition-colors">
              {author.displayName || author.username}
            </span>
            <span className="px-2 py-0.5 text-xs font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded">
              dev
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <time dateTime={publishedAt}>{formattedDate}</time>
            <span>•</span>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
              </svg>
              <span className="font-medium text-orange-600">{streakDays} Day Streak</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
