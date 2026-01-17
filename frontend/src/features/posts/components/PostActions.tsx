import { useState } from 'react';

interface PostActionsProps {
  postId: number;
  likes?: number;
  comments?: number;
}

export function PostActions({ postId }: PostActionsProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // TODO: Call API to bookmark/unbookmark
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    console.log('Share post:', postId);
  };

  return (
    <div className="px-12 py-4 flex items-center justify-end gap-3 border-b border-gray-100">
      {/* Bookmark Button */}
      <button 
        onClick={handleBookmark}
        className={`p-2 rounded-lg transition-all hover:bg-gray-100 ${isBookmarked ? 'text-primary-600' : 'text-gray-600'}`}
        title={isBookmarked ? 'Unbookmark' : 'Bookmark'}
      >
        <svg 
          className="w-5 h-5" 
          fill={isBookmarked ? 'currentColor' : 'none'} 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" 
          />
        </svg>
      </button>

      {/* Share Button */}
      <button 
        onClick={handleShare}
        className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all"
        title="Share"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" 
          />
        </svg>
      </button>
    </div>
  );
}
