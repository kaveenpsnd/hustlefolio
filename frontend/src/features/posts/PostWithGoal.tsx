import { usePost } from './posts-api';
import { useGoal } from '@/features/goals/use-goals';
import { useAuth } from '@/lib/auth-context';
import { Link } from 'react-router-dom';

interface PostWithGoalProps {
  postId: number;
}

/**
 * Example component showing how to fetch a post and its associated goal
 */
export default function PostWithGoal({ postId }: PostWithGoalProps) {
  const { user } = useAuth();
  const { data: post, isLoading: postLoading } = usePost(postId);
  const { data: goal, isLoading: goalLoading } = useGoal(
    post?.goalId || 0, 
    post?.authorUsername || user?.username || ''
  );

  if (postLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center p-12">
        <p className="text-gray-600">Post not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Post Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">
          {post.title}
        </h1>
        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-6">
          <span>by {post.authorUsername}</span>
          <span>•</span>
          <span>{new Date(post.createdAt || '').toLocaleDateString()}</span>
        </div>
        
        {/* Post content would go here */}
        <div className="prose max-w-none">
          {/* Render post content */}
        </div>
      </div>

      {/* Associated Goal */}
      {goalLoading ? (
        <div className="bg-gray-50 rounded-xl p-6">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      ) : goal ? (
        <Link
          to={`/goals/${goal.id}`}
          className="block bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-6 hover:shadow-md transition-all border-2 border-primary-200 hover:border-primary-300"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium text-primary-700">
                  Contributing to Goal
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {goal.title}
              </h3>
              {goal.description && (
                <p className="text-gray-700 text-sm mb-3">
                  {goal.description}
                </p>
              )}
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 font-medium">
                    {goal.currentStreak || 0} day streak
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  <span className="text-gray-700">
                    {goal.targetDays} days target
                  </span>
                </div>
                {goal.streakStatus && (
                  <span className="px-2 py-1 bg-white/60 text-gray-700 text-xs font-medium rounded">
                    {goal.streakStatus}
                  </span>
                )}
              </div>
            </div>
            <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      ) : post.goalId ? (
        <div className="bg-gray-50 rounded-xl p-6 text-center">
          <p className="text-gray-600">Goal information unavailable</p>
        </div>
      ) : null}
    </div>
  );
}
