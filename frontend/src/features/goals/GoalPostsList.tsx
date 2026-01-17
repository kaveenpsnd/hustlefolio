import { useGoalPosts } from '@/features/posts/posts-api';
import { useGoal } from './use-goals';
import { useAuth } from '@/lib/auth-context';
import { Link } from 'react-router-dom';

interface GoalPostsListProps {
  goalId: number;
}

/**
 * Example component showing how to fetch posts for a specific goal
 * and display the goal information
 */
export default function GoalPostsList({ goalId }: GoalPostsListProps) {
  const { user } = useAuth();
  const { data: posts = [], isLoading: postsLoading } = useGoalPosts(goalId);
  const { data: goal, isLoading: goalLoading } = useGoal(goalId, user?.username || '');

  if (postsLoading || goalLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="text-center p-12">
        <p className="text-gray-600">Goal not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Goal Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">
          {goal.title}
        </h2>
        {goal.description && (
          <p className="text-gray-600 mb-4">{goal.description}</p>
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
            <svg className="w-4 h-4 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            <span className="text-gray-700">
              {goal.targetDays} days target
            </span>
          </div>
          <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded">
            {posts.length} posts
          </span>
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Posts for this goal
        </h3>
        {posts.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-8 text-center">
            <p className="text-gray-600">No posts yet for this goal</p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <Link
                key={post.id}
                to={`/posts/${post.id}`}
                className="block bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md hover:border-primary-200 transition-all"
              >
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {post.title}
                </h4>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{new Date(post.createdAt || '').toLocaleDateString()}</span>
                  <span>•</span>
                  <span>by {post.authorUsername}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
