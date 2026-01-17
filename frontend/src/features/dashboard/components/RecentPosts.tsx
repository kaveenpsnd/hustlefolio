import { useNavigate } from 'react-router-dom';
import { useUserPosts } from '@/features/posts/posts-api';
import { formatDistanceToNow } from 'date-fns';

interface RecentPostsProps {
  username: string;
}

export default function RecentPosts({ username }: RecentPostsProps) {
  const navigate = useNavigate();
  const { data: posts = [], isLoading, error } = useUserPosts(username);

  console.log('RecentPosts - username:', username);
  console.log('RecentPosts - posts:', posts);
  console.log('RecentPosts - isLoading:', isLoading);
  console.log('RecentPosts - error:', error);

  // Get most recent 2 posts
  const recentPosts = posts
    .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
    .slice(0, 2);

  if (isLoading) {
    return (
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-gray-900">Recent Posts</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (recentPosts.length === 0) {
    return (
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-gray-900">Recent Posts</h2>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl p-6 sm:p-8 border border-gray-200 text-center">
          <p className="text-gray-500">No posts yet. Start writing to build your streak!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-gray-900">Recent Posts</h2>
        <button className="text-xs sm:text-sm text-primary-600 hover:text-primary-700 font-medium">
          View blog →
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {recentPosts.map((post) => {
          // Extract first paragraph from content for excerpt
          let excerpt = 'Click to read more...';
          if (post.content) {
            const content = typeof post.content === 'string' ? JSON.parse(post.content) : post.content;
            const firstParagraph = content.blocks?.find((b: any) => b.type === 'paragraph');
            if (firstParagraph?.data?.text) {
              // Strip HTML tags and truncate
              const plainText = firstParagraph.data.text.replace(/<[^>]*>/g, '');
              excerpt = plainText.length > 120 ? plainText.substring(0, 120) + '...' : plainText;
            }
          }

          // Estimate read time (assuming 200 words per minute)
          const wordCount = excerpt.split(' ').length;
          const readTime = Math.max(1, Math.ceil(wordCount / 200));

          return (
            <div 
              key={post.id} 
              className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/posts/${post.id}`)}
            >
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-xs font-semibold text-primary-700 bg-primary-50 px-3 py-1 rounded-full">
                  ARTICLE
                </span>
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(post.createdAt || ''), { addSuffix: true })}
                </span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500">{readTime} min read</span>
              </div>
              
              <h3 className="text-lg sm:text-xl font-serif font-bold text-gray-900 mb-2 hover:text-primary-600">
                {post.title}
              </h3>
              
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                {excerpt}
              </p>
              
              <button className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-1">
                <span>Read article</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
