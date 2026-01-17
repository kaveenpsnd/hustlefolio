import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { postsApi } from '../posts/posts-api';
import { goalsApi } from '../goals/goals-api';
import { categoriesApi, type Category } from '@/lib/categories-api';
import { Loader2, AlertCircle } from 'lucide-react';
import type { EditorJSContent, Post, Goal } from '@/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/lib/auth-context';
import { useDashboard } from '@/features/dashboard/use-dashboard';
import { useUserGoals } from '@/features/goals/use-goals';

export default function ExplorePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'posts' | 'goals'>('posts');
  const [postsToShow, setPostsToShow] = useState(10);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  // Fetch authenticated user's data
  const { data: dashboardData } = useDashboard(user?.username || '');
  const { data: userGoals = [] } = useUserGoals();

  const { data: posts, isLoading: postsLoading, error: postsError } = useQuery({
    queryKey: ['public-posts', selectedCategoryId],
    queryFn: async () => {
      try {
        let result;
        if (selectedCategoryId) {
          result = await postsApi.getPostsByCategoryId(selectedCategoryId);
        } else {
          result = await postsApi.getPublicPosts();
        }
        console.log('Posts loaded successfully:', result?.length);
        return result;
      } catch (error) {
        console.error('Failed to load posts:', error);
        throw error;
      }
    },
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const result = await categoriesApi.getPostCategories();
        console.log('Categories loaded successfully:', result?.length);
        return result;
      } catch (error) {
        console.error('Failed to load categories:', error);
        throw error;
      }
    },
  });

  const { data: goals, isLoading: goalsLoading, error: goalsError } = useQuery({
    queryKey: ['public-goals'],
    queryFn: async () => {
      try {
        const result = await goalsApi.getPublicGoals();
        console.log('Goals loaded successfully:', result?.length);
        return result;
      } catch (error) {
        console.error('Failed to load goals:', error);
        throw error;
      }
    },
  });

  const getPostExcerpt = (content: string | EditorJSContent): string => {
    try {
      let parsedContent: EditorJSContent;
      
      if (typeof content === 'string') {
        parsedContent = JSON.parse(content);
      } else {
        parsedContent = content;
      }

      if (parsedContent?.blocks && Array.isArray(parsedContent.blocks)) {
        const textBlocks = parsedContent.blocks
          .filter((block: any) => block.type === 'paragraph' && block.data?.text)
          .slice(0, 2);
        
        let text = textBlocks
          .map((block: any) => block.data.text.replace(/<[^>]*>/g, ''))
          .join(' ');
        
        // Decode HTML entities
        const textarea = document.createElement('textarea');
        textarea.innerHTML = text;
        text = textarea.value;
        
        return text.length > 150 ? text.substring(0, 150) + '...' : text;
      }
    } catch (e) {
      console.error('Failed to parse post content:', e);
    }
    return 'Read more...';
  };

  const calculateReadTime = (content: string | EditorJSContent): number => {
    try {
      let text = '';
      if (typeof content === 'string') {
        const parsed = JSON.parse(content);
        text = parsed.blocks?.map((b: any) => b.data?.text || '').join(' ') || '';
      } else {
        text = content.blocks?.map((b: any) => b.data?.text || '').join(' ') || '';
      }
      const words = text.split(/\s+/).length;
      return Math.max(1, Math.ceil(words / 200));
    } catch {
      return 5;
    }
  };

  const visiblePosts = posts?.slice(0, postsToShow) || [];
  const hasMorePosts = (posts?.length || 0) > postsToShow;

  const handleCategoryClick = (categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
    setPostsToShow(10); // Reset to show initial posts when filtering
    setActiveTab('posts'); // Switch to posts tab when filtering
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex flex-col">
      <Header />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-20 sm:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 mb-8">
              <div className="border-b border-gray-200 flex">
                <button
                  onClick={() => setActiveTab('posts')}
                  className={`px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold transition-colors relative ${
                    activeTab === 'posts' 
                      ? 'text-gray-900' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Latest Updates
                  {selectedCategoryId && activeTab === 'posts' && (
                    <span className="ml-2 text-xs px-2 py-0.5 bg-[#10B981]/10 text-[#10B981] rounded-full">
                      Filtered
                    </span>
                  )}
                  {activeTab === 'posts' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#10B981]" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('goals')}
                  className={`px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold transition-colors relative ${
                    activeTab === 'goals' 
                      ? 'text-gray-900' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Ongoing Streaks
                  {activeTab === 'goals' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#10B981]" />
                  )}
                </button>
              </div>

              <div className="p-4 sm:p-6">
                {activeTab === 'posts' && (
                  <>
                    {postsLoading ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                      </div>
                    ) : postsError ? (
                      <div className="text-center py-12">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">Failed to load posts</p>
                        <p className="text-sm text-gray-500">
                          {postsError instanceof Error ? postsError.message : 'Please check if the backend is running'}
                        </p>
                        <button 
                          onClick={() => window.location.reload()} 
                          className="mt-4 px-4 py-2 bg-[#10B981] text-white rounded-lg hover:bg-[#059669] text-sm"
                        >
                          Retry
                        </button>
                      </div>
                    ) : visiblePosts.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-gray-600">No posts yet</p>
                        <button 
                          onClick={() => navigate('/login')}
                          className="mt-4 px-4 py-2 bg-[#10B981] text-white rounded-lg hover:bg-[#059669] text-sm"
                        >
                          Be the first to post
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {visiblePosts.map((post: Post) => (
                          <article
                            key={post.id}
                            onClick={() => navigate(`/posts/${post.id}`)}
                            className="pb-6 border-b border-gray-100 last:border-0 hover:opacity-80 transition-opacity cursor-pointer"
                          >
                            <div className="flex gap-6">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center">
                                    <span className="text-xs sm:text-sm font-bold text-white">
                                      {post.authorUsername?.[0]?.toUpperCase()}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm">
                                    <span className="font-medium text-gray-900">{post.authorUsername}</span>
                                    {post.goal && (
                                      <>
                                        <span className="text-gray-400">·</span>
                                        <span className="text-gray-600 text-xs">
                                          Goal: <span className="font-medium text-gray-700">{post.goal.title}</span>
                                        </span>
                                        <span className="flex items-center gap-1 text-[#10B981] text-xs px-2 py-0.5 bg-green-50 rounded-full font-medium">
                                          🔥 {post.goal.currentStreak || 0} Days
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>

                                <h3 
                                  className="text-lg sm:text-xl font-bold text-gray-900 mb-2"
                                  style={{ fontFamily: "'Playfair Display', serif" }}
                                >
                                  {post.title}
                                </h3>

                                <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-2 sm:mb-3 line-clamp-2">
                                  {getPostExcerpt(post.content)}
                                </p>

                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  <span>
                                    {new Date(post.createdAt || '').toLocaleDateString('en-US', { 
                                      month: 'short', 
                                      day: 'numeric' 
                                    })}
                                  </span>
                                  <span>•</span>
                                  <span>{calculateReadTime(post.content)} min read</span>
                                  {post.category && (
                                    <>
                                      <span>•</span>
                                      <span className="text-xs px-2 py-1 bg-[#10B981]/10 text-[#10B981] rounded font-medium uppercase">
                                        {post.category.name}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>

                              {post.featuredImage && (
                                <div className="w-32 h-32 flex-shrink-0">
                                  <img 
                                    src={post.featuredImage} 
                                    alt={post.title} 
                                    className="w-full h-full object-cover rounded-lg"
                                  />
                                </div>
                              )}
                            </div>
                          </article>
                        ))}
                      </div>
                    )}

                    {hasMorePosts && !postsLoading && (
                      <button 
                        onClick={() => setPostsToShow(prev => prev + 10)}
                        className="mt-8 w-full py-3 text-gray-700 font-medium hover:bg-gray-50 transition-colors rounded-lg border border-gray-200"
                      >
                        Load more stories
                      </button>
                    )}
                  </>
                )}

                {activeTab === 'goals' && (
                  <>
                    {goalsLoading ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                      </div>
                    ) : goalsError ? (
                      <div className="text-center py-12">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">Failed to load goals</p>
                        <p className="text-sm text-gray-500">
                          {goalsError instanceof Error ? goalsError.message : 'Please check if the backend is running'}
                        </p>
                        <button 
                          onClick={() => window.location.reload()} 
                          className="mt-4 px-4 py-2 bg-[#10B981] text-white rounded-lg hover:bg-[#059669] text-sm"
                        >
                          Retry
                        </button>
                      </div>
                    ) : goals?.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-gray-600">No active goals yet</p>
                        <button 
                          onClick={() => navigate('/login')}
                          className="mt-4 px-4 py-2 bg-[#10B981] text-white rounded-lg hover:bg-[#059669] text-sm"
                        >
                          Start the first goal
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {goals?.map((goal: Goal) => (
                          <div
                            key={goal.id}
                            className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center">
                                  <span className="text-sm font-bold text-white">
                                    {goal.user?.username?.[0]?.toUpperCase() || 'U'}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{goal.user?.username || 'Anonymous'}</p>
                                  <p className="text-sm text-gray-600">
                                    {goal.currentStreak || 0} / {goal.targetDays} days
                                  </p>
                                </div>
                              </div>
                              <span className="flex items-center gap-1 text-[#10B981] text-sm px-3 py-1 bg-green-50 rounded-full font-medium">
                                🔥 {goal.currentStreak || 0} Day Streak
                              </span>
                            </div>

                            <h4 className="font-semibold text-gray-900 mb-2">{goal.title}</h4>

                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-[#10B981] transition-all"
                                style={{ 
                                  width: `${Math.min(((goal.currentStreak || 0) / goal.targetDays) * 100, 100)}%` 
                                }}
                              />
                            </div>

                            <p className="text-xs text-gray-600 mt-2">
                              {Math.round(((goal.currentStreak || 0) / goal.targetDays) * 100)}% complete
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  Explore Topics
                </h3>
                {selectedCategoryId && (
                  <button
                    onClick={() => handleCategoryClick(null)}
                    className="text-xs text-[#10B981] hover:text-[#059669] font-medium"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
              {categoriesLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                </div>
              ) : categories && categories.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {categories.map((category: Category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryClick(category.id)}
                      className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                        selectedCategoryId === category.id
                          ? 'bg-[#10B981] text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No categories available</p>
              )}
            </div>

            {isAuthenticated && user ? (
              // Authenticated User: Show Streak Counter Card
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="mb-6">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Your Progress
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Longest Streak</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-gray-900">
                          {Math.max(...(userGoals.filter(g => g.active).map(g => g.currentStreak || 0) || [0]))}
                        </span>
                        <span className="text-lg text-gray-600">Days</span>
                      </div>
                    </div>
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Active Goals */}
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Active Goals ({userGoals.filter(g => g.active).length} Total)
                  </p>
                  {userGoals.filter(g => g.active).length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-sm text-gray-500 mb-3">No active goals yet</p>
                      <button
                        onClick={() => navigate('/goals/new')}
                        className="px-4 py-2 bg-[#10B981] text-white rounded-lg text-sm font-medium hover:bg-[#059669] transition-colors"
                      >
                        Create Your First Goal
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {userGoals.filter(g => g.active).slice(0, 3).map((goal) => (
                        <div key={goal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => navigate('/goals')}>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 text-sm">{goal.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden max-w-[120px]">
                                <div 
                                  className="h-full bg-[#10B981] transition-all"
                                  style={{ width: `${Math.min((goal.currentStreak || 0) / goal.targetDays * 100, 100)}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-600">
                                {goal.currentStreak || 0}/{goal.targetDays}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {userGoals.filter(g => g.active).length > 3 && (
                        <button
                          onClick={() => navigate('/goals')}
                          className="w-full py-2 text-sm text-[#10B981] hover:text-[#059669] font-medium transition-colors"
                        >
                          View all {userGoals.filter(g => g.active).length} goals →
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Public User: Show Document Your Hustle Story Card
              <div className="bg-gradient-to-br from-[#10B981] to-[#059669] rounded-lg p-6 text-white">
                <h3 className="text-xl font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Document Your Hustle Story
                </h3>
                <p className="text-green-50 mb-4 text-sm leading-relaxed">
                  Leave a digital footprint of your consistency today.
                </p>
                <button 
                  onClick={() => navigate('/login')}
                  className="w-full py-2.5 bg-white text-[#10B981] rounded-lg font-semibold hover:bg-green-50 transition-colors"
                >
                  Start your goal
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
