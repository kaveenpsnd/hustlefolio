export default function RecentWork() {
  const workItems = [
    {
      id: 1,
      title: 'The Future of Digital Minimalism',
      status: 'Draft',
      timestamp: 'Edited 2 hours ago',
      icon: 'document',
    },
    {
      id: 2,
      title: 'My 30-Day Coding Challenge Reflection',
      status: 'Published',
      timestamp: 'Yesterday',
      icon: 'check',
      reads: '124 reads',
    },
    {
      id: 3,
      title: 'Notes on Habit Formation',
      status: 'Draft',
      timestamp: 'Edited 3 days ago',
      icon: 'document',
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-serif font-bold text-gray-900">Recent Work</h2>
        <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
          View all →
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-200">
        {workItems.map((item) => (
          <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer flex items-center space-x-4">
            {/* Icon */}
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
              item.icon === 'check' ? 'bg-primary-100' : 'bg-gray-100'
            }`}>
              {item.icon === 'check' ? (
                <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 mb-1 truncate">
                {item.title}
              </h3>
              <div className="flex items-center space-x-3 text-xs text-gray-500">
                <span className={`${item.status === 'Published' ? 'text-primary-600' : 'text-gray-600'} font-medium`}>
                  {item.status}
                </span>
                <span>•</span>
                <span>{item.timestamp}</span>
                {item.reads && (
                  <>
                    <span>•</span>
                    <span>{item.reads}</span>
                  </>
                )}
              </div>
            </div>

            {/* Arrow */}
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}
