import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-context';
import { postsApi, useDeletePost } from './posts-api';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GoalSelectionModal from '@/components/GoalSelectionModal';
import { Loader2, AlertCircle, Edit, Trash2 } from 'lucide-react';
import type { Post, EditorJSContent } from '@/types';

export default function MyPostsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showGoalModal, setShowGoalModal] = useState(false);
  const deletePostMutation = useDeletePost();

  const { data: posts, isLoading, error } = useQuery({
    queryKey: ['posts', 'user', user?.username],
    queryFn: () => postsApi.getPostsByUser(user?.username || ''),
    enabled: !!user?.username,
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
        
        return text.length > 200 ? text.substring(0, 200) + '...' : text;
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

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex flex-col">
      <Header />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-20 sm:pb-24" style={{width: '100%'}}>
        {/* Page Header with Action Button */}
        <div className="mb-8 sm:mb-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 
              className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              My Posts
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              All your published posts in one place
            </p>
          </div>
          <button
            onClick={() => setShowGoalModal(true)}
            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-[#10B981] text-white rounded-lg hover:bg-[#059669] transition-colors text-sm sm:text-base font-medium flex items-center justify-center space-x-2"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
            <span>What's New Today?</span>
          </button>
        </div>

        {/* Posts List - Aligned Left */}

          {/* Posts List */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Failed to load your posts</p>
              <p className="text-sm text-gray-500">
                {error instanceof Error ? error.message : 'Please try again'}
              </p>
            </div>
          ) : posts && posts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200 max-w-2xl">
              <p className="text-sm sm:text-base text-gray-600 mb-4">You haven't published any posts yet</p>
              <button 
                onClick={() => navigate('/create-post')}
                className="px-4 sm:px-6 py-2.5 sm:py-3 bg-[#10B981] text-white rounded-lg hover:bg-[#059669] transition-colors text-sm font-medium"
              >
                Write your first post
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {posts?.map((post: Post) => (
                <article
                  key={post.id}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>
                            {new Date(post.createdAt || '').toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                          {post.goal && (
                            <>
                              <span>•</span>
                              <span className="text-xs px-2 py-1 bg-green-50 text-[#10B981] rounded font-medium">
                                {post.goal.title}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <h3 
                        className="text-2xl font-bold text-gray-900 mb-2 hover:text-[#10B981] transition-colors"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                      >
                        {post.title}
                      </h3>

                      <p className="text-gray-600 leading-relaxed mb-4 line-clamp-3">
                        {getPostExcerpt(post.content)}
                      </p>

                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500">
                          {calculateReadTime(post.content)} min read
                        </span>
                        {post.category && (
                          <>
                            <span className="text-gray-400">•</span>
                            <span className="text-xs px-2 py-1 bg-[#10B981]/10 text-[#10B981] rounded font-medium uppercase">
                              {post.category.name}
                            </span>
                          </>
                        )}
                        
                        <div className="ml-auto flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/posts/${post.id}/edit`);
                            }}
                            className="p-2 text-gray-600 hover:text-[#10B981] hover:bg-green-50 rounded-lg transition-colors"
                            title="Edit post"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (confirm('Are you sure you want to delete this post?')) {
                                try {
                                  await deletePostMutation.mutateAsync(post.id);
                                } catch (error) {
                                  console.error('Failed to delete post:', error);
                                  alert('Failed to delete post. Please try again.');
                                }
                              }
                            }}
                            disabled={deletePostMutation.isPending}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete post"
                          >
                            {deletePostMutation.isPending ? (
                              <Loader2 size={18} className="animate-spin" />
                            ) : (
                              <Trash2 size={18} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {post.featuredImage && (
                      <div className="w-40 h-32 flex-shrink-0">
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
      </div>

      {/* Goal Selection Modal */}
      <GoalSelectionModal 
        isOpen={showGoalModal}
        onClose={() => setShowGoalModal(false)}
      />

      <Footer />
    </div>
  );
}
