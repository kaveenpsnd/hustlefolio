import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Post, ActivityDay } from '@/types';

interface ContributionHeatmapProps {
  totalPosts: number;
  activityData?: ActivityDay[];
  userPosts?: Post[];
  username: string;
}

interface HeatmapDataPoint {
  date: Date;
  dateStr: string;
  count: number;
  day: number;
  week: number;
  posts: Post[];
}

export default function ContributionHeatmap({ 
  totalPosts, 
  activityData = [], 
  userPosts = [],
  username 
}: ContributionHeatmapProps) {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<HeatmapDataPoint | null>(null);
  const [hoveredDate, setHoveredDate] = useState<HeatmapDataPoint | null>(null);

  // Generate 365 days of data with real backend data
  const heatmapData = useMemo(() => {
    const data: HeatmapDataPoint[] = [];
    const today = new Date();
    
    // Create a map of date -> posts
    const postsByDate = new Map<string, Post[]>();
    userPosts.forEach(post => {
      const postDate = new Date(post.createdAt || '');
      const dateStr = postDate.toISOString().split('T')[0];
      if (!postsByDate.has(dateStr)) {
        postsByDate.set(dateStr, []);
      }
      postsByDate.get(dateStr)!.push(post);
    });

    // Create activity map from backend data
    const activityMap = new Map<string, number>();
    activityData.forEach(activity => {
      activityMap.set(activity.date, activity.count);
    });
    
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Get count from backend data or posts
      const count = activityMap.get(dateStr) || postsByDate.get(dateStr)?.length || 0;
      const posts = postsByDate.get(dateStr) || [];
      
      data.push({
        date,
        dateStr,
        count,
        day: date.getDay(),
        week: Math.floor(i / 7),
        posts,
      });
    }
    
    return data;
  }, [activityData, userPosts]);

  const getColor = (count: number) => {
    if (count === 0) return 'bg-gray-100 hover:bg-gray-200';
    if (count === 1) return 'bg-emerald-200 hover:bg-emerald-300';
    if (count === 2) return 'bg-emerald-400 hover:bg-emerald-500';
    if (count === 3) return 'bg-emerald-500 hover:bg-emerald-600';
    return 'bg-emerald-600 hover:bg-emerald-700';
  };

  const getBorderColor = (count: number) => {
    if (count === 0) return 'border-gray-300';
    if (count === 1) return 'border-emerald-300';
    if (count === 2) return 'border-emerald-500';
    if (count === 3) return 'border-emerald-600';
    return 'border-emerald-700';
  };

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Group by weeks
  const weeks = useMemo(() => {
    const grouped: HeatmapDataPoint[][] = [];
    for (let i = 0; i < 53; i++) {
      grouped[i] = heatmapData.filter(d => d.week === i);
    }
    return grouped;
  }, [heatmapData]);

  // Get month labels for display
  const monthLabels = useMemo(() => {
    const labels: { month: string; week: number }[] = [];
    let lastMonth = -1;
    
    weeks.forEach((week, weekIndex) => {
      if (week.length > 0) {
        const firstDay = week[0];
        const month = firstDay.date.getMonth();
        if (month !== lastMonth && weekIndex % 4 === 0) {
          labels.push({ month: months[month], week: weekIndex });
          lastMonth = month;
        }
      }
    });
    
    return labels;
  }, [weeks]);

  const handleDateClick = (dataPoint: HeatmapDataPoint) => {
    if (dataPoint.count > 0) {
      setSelectedDate(dataPoint);
    }
  };

  const handleCloseModal = () => {
    setSelectedDate(null);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <>
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4 gap-2">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Contribution Activity</h2>
          <span className="text-xs sm:text-sm text-gray-600">Total this year: <strong>{totalPosts} posts</strong></span>
        </div>
        
        <div className="overflow-x-auto pb-2 -mx-2 px-2">
          <div className="inline-flex flex-col gap-1 min-w-[600px]">
            {/* Month labels */}
            <div className="flex gap-1 mb-1">
              <div className="w-10"></div>
              <div className="flex gap-1 relative h-4">
                {monthLabels.map((label, idx) => (
                  <div
                    key={idx}
                    className="absolute text-xs text-gray-500 font-medium"
                    style={{ left: `${label.week * 13}px` }}
                  >
                    {label.month}
                  </div>
                ))}
              </div>
            </div>

            {/* Day labels + Heatmap grid */}
            <div className="flex gap-1">
              <div className="w-10 flex flex-col justify-around text-xs text-gray-500">
                {days.map((day, i) => (
                  i % 2 === 0 && <div key={day} className="h-3 leading-3">{day}</div>
                ))}
              </div>
              
              {/* Heatmap grid */}
              <div className="flex gap-1">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-1">
                    {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
                      const dataPoint = week.find(d => d.day === dayIndex);
                      if (!dataPoint) {
                        return <div key={`${weekIndex}-${dayIndex}`} className="w-3 h-3" />;
                      }
                      
                      return (
                        <button
                          key={`${weekIndex}-${dayIndex}`}
                          onClick={() => handleDateClick(dataPoint)}
                          onMouseEnter={() => setHoveredDate(dataPoint)}
                          onMouseLeave={() => setHoveredDate(null)}
                          className={`w-3 h-3 rounded-sm transition-all duration-150 ${
                            getColor(dataPoint.count)
                          } ${
                            selectedDate?.dateStr === dataPoint.dateStr 
                              ? `ring-2 ${getBorderColor(dataPoint.count)} scale-110` 
                              : ''
                          } ${
                            dataPoint.count > 0 ? 'cursor-pointer' : 'cursor-default'
                          }`}
                          title={`${dataPoint.count} post${dataPoint.count !== 1 ? 's' : ''} on ${dataPoint.date.toLocaleDateString()}`}
                          disabled={dataPoint.count === 0}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Hover tooltip */}
          {hoveredDate && (
            <div className="mt-3 p-2 bg-gray-800 text-white text-xs rounded shadow-lg inline-block">
              <div className="font-medium">{formatDate(hoveredDate.date)}</div>
              <div className="text-gray-300">
                {hoveredDate.count} post{hoveredDate.count !== 1 ? 's' : ''}
                {hoveredDate.count > 0 && ' - Click to view'}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-4">
          <button className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
            Learn how we count contributions
          </button>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">Less</span>
              <div className="flex space-x-1">
                <div className="w-3 h-3 rounded-sm bg-gray-100 border border-gray-200"></div>
                <div className="w-3 h-3 rounded-sm bg-emerald-200 border border-emerald-300"></div>
                <div className="w-3 h-3 rounded-sm bg-emerald-400 border border-emerald-500"></div>
                <div className="w-3 h-3 rounded-sm bg-emerald-500 border border-emerald-600"></div>
                <div className="w-3 h-3 rounded-sm bg-emerald-600 border border-emerald-700"></div>
              </div>
              <span className="text-xs text-gray-500">More</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for viewing posts on selected date */}
      {selectedDate && selectedDate.posts.length > 0 && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleCloseModal}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">
                    {formatDate(selectedDate.date)}
                  </h3>
                  <p className="text-emerald-100 text-sm mt-1">
                    {selectedDate.count} post{selectedDate.count !== 1 ? 's' : ''} published
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              <div className="space-y-4">
                {selectedDate.posts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => {
                      navigate(`/posts/${post.id}`);
                      handleCloseModal();
                    }}
                    className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-all cursor-pointer border border-gray-200 hover:border-emerald-300 hover:shadow-md group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-lg group-hover:text-emerald-600 transition-colors line-clamp-2">
                          {post.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {new Date(post.createdAt || '').toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <svg 
                        className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 transition-colors flex-shrink-0 ml-2"
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
