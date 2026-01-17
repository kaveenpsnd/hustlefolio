import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { useGoal } from './use-goals';
import { useGoalPosts } from '@/features/posts/posts-api';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';

export default function GoalDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const goalId = parseInt(id || '0', 10);

  const { data: goal, isLoading: goalLoading } = useGoal(goalId, user?.username || '');
  const { data: posts = [], isLoading: postsLoading } = useGoalPosts(goalId);

  if (goalLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex items-center justify-center p-20 flex-1">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="max-w-dashboard mx-auto px-8 py-20 text-center flex-1">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Goal Not Found</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-primary-600 hover:text-primary-700"
          >
            Return to Dashboard
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  // Prepare heatmap data
  const today = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(today.getFullYear() - 1);

  const heatmapData = (goal.checkinDates || []).map((date: string) => ({
    date: date,
    count: 1,
  }));

  const currentStreak = goal.currentStreak || 0;
  const longestStreak = goal.longestStreak || 0;
  const targetDays = goal.targetDays || 0;
  const completionPercentage = targetDays > 0 ? Math.min((currentStreak / targetDays) * 100, 100) : 0;
  const daysRemaining = Math.max(targetDays - currentStreak, 0);

  // Calculate streak intensity
  const getStreakEmoji = (streak: number) => {
    if (streak >= 30) return '🔥🔥🔥';
    if (streak >= 14) return '🔥🔥';
    if (streak >= 7) return '🔥';
    if (streak >= 3) return '✨';
    return '🌱';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 pb-20 sm:pb-24" style={{width: '100%'}}>
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4 gap-3">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={() => navigate('/goals')}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full uppercase tracking-wide">
                Active Goal
              </span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
              <button
                onClick={() => navigate(`/goals/edit/${goalId}`)}
                className="flex-1 sm:flex-none px-4 sm:px-5 py-2 bg-emerald-500 text-white rounded-lg text-sm sm:text-base font-medium hover:bg-emerald-600 transition-colors flex items-center justify-center space-x-2 shadow-sm"
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Edit Goal</span>
              </button>
            </div>
          </div>

          {/* Goal Title & Description */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-gray-900 mb-3 sm:mb-4">
            {goal.title}
          </h1>
          {goal.description && (
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed italic">
              {goal.description}
            </p>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Current Streak Card */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400 to-red-500 opacity-10 rounded-full blur-3xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Current Streak</span>
                <span className="text-3xl">{getStreakEmoji(currentStreak)}</span>
              </div>
              <div className="flex items-baseline space-x-2 mb-3">
                <span className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900">{currentStreak}</span>
                <span className="text-xl sm:text-2xl text-gray-600">Days</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Longest: <span className="font-semibold text-gray-900">{longestStreak} days</span></span>
                <span className="text-gray-600">Freezes: <span className="font-semibold text-gray-900">{goal.freezeCount || 0}</span></span>
              </div>
            </div>
          </div>

          {/* Target Progress Card */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Target</span>
              <span className="px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full">
                {goal.streakStatus || 'Beginner'}
              </span>
            </div>
            <div className="mb-6">
              <div className="flex items-baseline space-x-2 mb-2">
                <span className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900">{targetDays}</span>
                <span className="text-2xl text-gray-600">Days</span>
              </div>
              <div className="text-sm text-gray-600">
                {daysRemaining} days remaining • {Math.round(completionPercentage)}% complete
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm text-center">
            <div className="text-sm text-gray-600 mb-1 uppercase tracking-wide font-semibold">Start Date</div>
            <div className="text-2xl font-bold text-gray-900">
              {new Date(goal.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm text-center">
            <div className="text-sm text-gray-600 mb-1 uppercase tracking-wide font-semibold">Target</div>
            <div className="text-2xl font-bold text-gray-900">{targetDays} days</div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm text-center">
            <div className="text-sm text-gray-600 mb-1 uppercase tracking-wide font-semibold">Total Posts</div>
            <div className="text-2xl font-bold text-gray-900">{posts.length}</div>
          </div>
        </div>

        {/* Activity Heatmap */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 mb-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Activity Progress</h2>
            <p className="text-sm text-gray-600">Tracking consistency over the last year</p>
          </div>
          <div className="heatmap-container">
            <CalendarHeatmap
              startDate={oneYearAgo}
              endDate={today}
              values={heatmapData}
              classForValue={(value: any) => {
                if (!value) return 'color-empty';
                return 'color-scale-1';
              }}
              showWeekdayLabels={true}
            />
          </div>
          <div className="flex items-center justify-between mt-4 text-xs text-gray-600">
            <span>Less</span>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-gray-200 rounded-sm"></div>
              <div className="w-3 h-3 bg-emerald-200 rounded-sm"></div>
              <div className="w-3 h-3 bg-emerald-400 rounded-sm"></div>
              <div className="w-3 h-3 bg-emerald-600 rounded-sm"></div>
            </div>
            <span>More</span>
          </div>
        </div>

        {/* Timeline / Posts Section */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Timeline</h2>
              <p className="text-sm text-gray-600">{posts.length} entries logged</p>
            </div>
            {goal.active && (
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full">
                Active
              </span>
            )}
          </div>

          {postsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-600 mb-6">Start logging your progress to build your streak</p>
              <Link
                to="/posts/new"
                className="inline-flex items-center px-5 py-2.5 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors space-x-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                <span>Write First Entry</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post, index) => (
                <Link
                  key={post.id}
                  to={`/posts/${post.id}`}
                  className="block group"
                >
                  <div className="flex items-start space-x-4 p-5 rounded-xl border border-gray-200 hover:border-primary-300 hover:bg-primary-50/30 transition-all">
                    {/* Day Counter */}
                    <div className="flex-shrink-0 w-16 text-center">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Day</div>
                      <div className="text-2xl font-bold text-primary-600">{posts.length - index}</div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors mb-1 line-clamp-2">
                        {post.title}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{new Date(post.createdAt || '').toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}</span>
                        <span>•</span>
                        <span className="flex items-center space-x-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                          </svg>
                          <span>4 min read</span>
                        </span>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}

              {posts.length >= 5 && (
                <button className="w-full py-3 text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors">
                  Load previous entries
                </button>
              )}
            </div>
          )}
        </div>

        {/* Streak Tip */}
        <div className="mt-8 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-amber-900 mb-1">Streak Tip</h3>
              <p className="text-sm text-amber-800">
                <em>"Consistency is more important than intensity in the beginning."</em>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Custom Heatmap Styles */}
      <style>{`
        .heatmap-container {
          font-size: 12px;
        }
        .react-calendar-heatmap {
          width: 100%;
        }
        .react-calendar-heatmap .color-empty {
          fill: #ebedf0;
        }
        .react-calendar-heatmap .color-scale-1 {
          fill: #10b981;
        }
        .react-calendar-heatmap text {
          font-size: 10px;
          fill: #6b7280;
        }
        .react-calendar-heatmap rect:hover {
          stroke: #059669;
          stroke-width: 1px;
        }
      `}</style>
      <Footer />
    </div>
  );
}
