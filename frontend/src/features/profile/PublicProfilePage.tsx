import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePublicProfile, usePublicPosts, usePublicDashboard } from './use-public-profile';
import { Globe, Github, Twitter, Linkedin, Loader2, AlertCircle, Calendar, TrendingUp, FileText, Edit } from 'lucide-react';
import type { EditorJSContent } from '@/types';
import { useAuth } from '@/lib/auth-context';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PublicProfilePage() {
  const { username: rawUsername } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const username = rawUsername?.replace('@', '') || '';
  const isOwnProfile = user?.username === username;
  
  const { data: profile, isLoading, error } = usePublicProfile(username);
  const { data: posts, isLoading: postsLoading } = usePublicPosts(username);
  const { data: dashboard } = usePublicDashboard(username);
  
  const [postsToShow, setPostsToShow] = useState(6);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF9]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF9]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">User not found</p>
        </div>
      </div>
    );
  }

  const visiblePosts = posts?.slice(0, postsToShow) || [];
  const hasMorePosts = (posts?.length || 0) > postsToShow;

  const activeGoals = dashboard?.activeGoals || [];
  const currentStreak = activeGoals.length > 0 ? Math.max(...activeGoals.map((g: any) => g.currentStreak || 0)) : 0;
  const longestStreak = activeGoals.length > 0 ? Math.max(...activeGoals.map((g: any) => g.longestStreak || g.currentStreak || 0)) : 0;

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
        
        const text = textBlocks
          .map((block: any) => block.data.text.replace(/<[^>]*>/g, ''))
          .join(' ');
        
        return text.length > 150 ? text.substring(0, 150) + '...' : text;
      }
    } catch (e) {
      console.error('Failed to parse post content:', e);
    }
    return 'Read more...';
  };

  const generateHeatmapData = () => {
    const today = new Date();
    const yearAgo = new Date(today);
    yearAgo.setFullYear(today.getFullYear() - 1);
    
    const weeks = 53;
    const data: number[][] = Array(7).fill(0).map(() => Array(weeks).fill(0));
    
    activeGoals.forEach((goal: any) => {
      const streakDays = goal.currentStreak || 0;
      for (let i = 0; i < streakDays; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        const daysSinceStart = Math.floor((date.getTime() - yearAgo.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceStart >= 0 && daysSinceStart < weeks * 7) {
          const week = Math.floor(daysSinceStart / 7);
          const day = date.getDay();
          if (week < weeks) {
            data[day][week] = Math.min(data[day][week] + 1, 4);
          }
        }
      }
    });
    
    return data;
  };

  const heatmapData = generateHeatmapData();
  const totalContributions = heatmapData.flat().filter(v => v > 0).length;
  
  const getMonthLabels = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const labels: { month: string; offset: number }[] = [];
    const today = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(today);
      date.setMonth(today.getMonth() - (11 - i));
      const weekOffset = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 7));
      labels.push({ month: months[date.getMonth()], offset: Math.max(0, 53 - weekOffset) });
    }
    
    return labels;
  };

  const monthLabels = getMonthLabels();

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <Header />
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-20 sm:pb-24">
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
            <div className="flex flex-col sm:flex-row items-start gap-6 sm:gap-8">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center overflow-hidden flex-shrink-0">
              {profile?.profilePictureUrl ? (
                <img src={profile.profilePictureUrl} alt={profile.fullName || profile.username} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl sm:text-4xl font-bold text-white">{(profile?.fullName || profile?.username)?.[0]?.toUpperCase()}</span>
              )}
            </div>

            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>{profile?.fullName || profile?.username}</h1>
              <p className="text-base sm:text-lg text-[#10B981] mb-3 sm:mb-4">@{profile?.username}</p>
              {profile?.bio && <p className="text-gray-700 text-base sm:text-lg leading-relaxed mb-4 sm:mb-6 max-w-3xl">{profile.bio}</p>}
              <div className="flex items-center gap-6 text-sm text-gray-600 mb-6">
                {profile?.createdAt && (
                  <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /><span>Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span></div>
                )}
              </div>
              {isOwnProfile && (
                <button
                  onClick={() => navigate('/profile/edit')}
                  className="mb-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              )}
              <div className="flex items-center gap-4">
                {profile?.websiteUrl && <a href={profile.websiteUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"><Globe className="w-5 h-5 text-gray-700" /></a>}
                {profile?.githubUsername && <a href={`https://github.com/${profile.githubUsername}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"><Github className="w-5 h-5 text-gray-700" /></a>}
                {profile?.twitterUsername && <a href={`https://twitter.com/${profile.twitterUsername.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"><Twitter className="w-5 h-5 text-gray-700" /></a>}
                {profile?.linkedinUrl && <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"><Linkedin className="w-5 h-5 text-gray-700" /></a>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Contribution Activity</h3>
                <span className="text-xs text-gray-600">Total this year: <strong>{posts?.length || 0} posts</strong></span>
              </div>
              
              <div className="overflow-x-auto">
                <div className="inline-block min-w-full">
                  <div className="flex gap-1 mb-2 pl-8">
                    {monthLabels.map((label, i) => (
                      <div key={i} className="text-xs text-gray-600 w-12 text-center">
                        {label.month}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-1">
                    <div className="flex flex-col gap-1 text-xs text-gray-600 justify-around h-[84px]">
                      <div>Sun</div>
                      <div>Tue</div>
                      <div>Thu</div>
                      <div>Sat</div>
                    </div>
                    
                    <div className="flex gap-1">
                      {Array.from({ length: 53 }).map((_, weekIndex) => (
                        <div key={weekIndex} className="flex flex-col gap-1">
                          {heatmapData.map((dayData, dayIndex) => {
                            const intensity = dayData[weekIndex];
                            const colors = ['bg-gray-100', 'bg-green-200', 'bg-green-400', 'bg-green-500', 'bg-green-600'];
                            return (
                              <div
                                key={dayIndex}
                                className={`w-[10px] h-[10px] rounded-sm ${colors[intensity]} border border-gray-200`}
                                title={`${intensity} contributions`}
                              />
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-end gap-2 mt-3 text-xs text-gray-600">
                    <span>Less</span>
                    <div className="flex gap-1">
                      <div className="w-[10px] h-[10px] bg-gray-100 rounded-sm border border-gray-200" />
                      <div className="w-[10px] h-[10px] bg-green-200 rounded-sm border border-gray-200" />
                      <div className="w-[10px] h-[10px] bg-green-400 rounded-sm border border-gray-200" />
                      <div className="w-[10px] h-[10px] bg-green-500 rounded-sm border border-gray-200" />
                      <div className="w-[10px] h-[10px] bg-green-600 rounded-sm border border-gray-200" />
                    </div>
                    <span>More</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>Recent Posts</h2>
              {postsLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
              ) : visiblePosts.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200"><FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" /><p className="text-gray-600">No posts yet</p></div>
              ) : (
                <>
                  <div className="space-y-6">
                    {visiblePosts.map((post: any) => (
                      <article key={post.id} onClick={() => navigate(`/posts/${post.id}`)} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                        <div className="flex gap-6 p-6">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 text-sm text-gray-600 mb-3"><span className="text-xs px-2 py-1 bg-[#10B981]/10 text-[#10B981] rounded font-medium">HABIT SYSTEMS</span><span>•</span><span>8 MIN READ</span></div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3 hover:text-[#10B981] transition-colors" style={{ fontFamily: "'Playfair Display', serif" }}>{post.title}</h3>
                            <p className="text-gray-600 leading-relaxed mb-4 line-clamp-2">{getPostExcerpt(post.content)}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500"><span>{new Date(post.createdAt || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span></div>
                          </div>
                          {post.featuredImage && <img src={post.featuredImage} alt={post.title} className="w-48 h-32 object-cover rounded-lg flex-shrink-0" />}
                        </div>
                      </article>
                    ))}
                  </div>
                  {hasMorePosts && <button onClick={() => setPostsToShow(prev => prev + 6)} className="mt-8 w-full py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors">View All Posts</button>}
                </>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4"><span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Current Streak</span><TrendingUp className="w-5 h-5 text-[#10B981]" /></div>
              <div className="text-4xl font-bold text-gray-900 mb-2">{currentStreak} Days</div>
              <div className="flex items-center gap-2 text-sm text-[#10B981]"><span className="text-2xl">🔥</span><span>{currentStreak > 0 ? 'Keep it up!' : 'Start a new streak'}</span></div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4"><span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Longest Streak</span></div>
              <div className="text-4xl font-bold text-gray-900 mb-2">{longestStreak} Days</div>
              <div className="text-sm text-gray-600">Personal Record</div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4"><span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Posts</span><FileText className="w-5 h-5 text-gray-600" /></div>
              <div className="text-4xl font-bold text-gray-900 mb-2">{posts?.length || 0}</div>
              <div className="text-sm text-gray-600">Total published</div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><span>🎯</span>Active Goals</h3>
              {activeGoals.length === 0 ? (
                <p className="text-sm text-gray-600">No active goals yet</p>
              ) : (
                <div className="space-y-3">
                  {activeGoals.slice(0, 3).map((goal: any) => (
                    <div key={goal.id} className="p-3 bg-green-50 rounded-lg">
                      <div className="font-semibold text-gray-900 text-sm">{goal.title}</div>
                      <div className="text-xs text-gray-600 mt-1">{goal.currentStreak} / {goal.targetDays} days ({Math.round((goal.currentStreak / goal.targetDays) * 100)}%)</div>
                      <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-[#10B981] transition-all" style={{ width: `${Math.min((goal.currentStreak / goal.targetDays) * 100, 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {activeGoals.length > 3 && <button className="mt-4 w-full py-2 text-sm text-[#10B981] hover:bg-green-50 rounded-lg transition-colors font-medium">View All {activeGoals.length} Goals</button>}
            </div>
          </div>
        </div>
      </div>
      </main>
      <Footer />
    </div>
  );
}
