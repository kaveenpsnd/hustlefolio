import { useParams } from 'react-router-dom';
import { usePost } from './posts-api';
import type { EditorJSContent } from '@/types';
import { EditorJSRenderer } from './components';
import { format } from 'date-fns';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PostViewer() {
  const { id } = useParams<{ id: string }>();
  const { data: post, isLoading, error } = usePost(Number(id));
  
  // Get streak from the post's goal
  const streakDays = post?.goal?.currentStreak || 0;
  const targetDays = post?.goal?.targetDays || 100;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <main className="max-w-3xl mx-auto px-6 py-12 flex items-center justify-center min-h-[60vh] flex-1">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading post...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <main className="max-w-3xl mx-auto px-6 py-12 flex items-center justify-center min-h-[60vh] flex-1">
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Post Not Found</h2>
            <p className="text-gray-600">The post you're looking for doesn't exist or has been removed.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  // Extract data from post

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 sm:py-12 pb-20 sm:pb-24" style={{width: '100%'}}>
        <article>
          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-gray-900 leading-tight mb-4 sm:mb-6">
            {post.title}
          </h1>

          {/* Author Info with Streak */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 sm:pb-6 mb-6 sm:mb-8 border-b border-gray-200 gap-4">
            <div className="flex items-center gap-3 sm:gap-4 w-full">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-lg sm:text-xl">
                  {post.authorUsername?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 sm:mb-2">
                  <span className="font-semibold text-gray-900 text-base sm:text-lg">{post.authorUsername || 'Unknown User'}</span>
                  <span className="hidden sm:inline">•</span>
                  <time className="text-xs sm:text-sm text-gray-600">{format(new Date(post.publishedAt || post.createdAt || new Date()), 'MMM dd, yyyy')}</time>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm sm:text-base font-semibold text-orange-600">{streakDays} Day Streak</span>
                  </div>
                  <div className="flex-1 max-w-[200px] sm:max-w-xs">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-300"
                          style={{width: `${Math.min((streakDays / targetDays) * 100, 100)}%`}}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-600">{Math.round((streakDays / targetDays) * 100)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Article Content */}
          <div className="article-content">
            <EditorJSRenderer content={post.content as EditorJSContent} />
          </div>

        </article>
      </main>
      <Footer />
    </div>
  );
}