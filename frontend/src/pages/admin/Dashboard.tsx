import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Users, FileText, Activity } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function Dashboard() {
    const { user } = useAuth();

    const { data: stats, isLoading, error } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: async () => {
            const response = await apiClient.get('/admin/stats');
            return response.data;
        },
    });

    if (isLoading) return <div className="p-8">Loading stats...</div>;
    if (error) return <div className="p-8 text-red-500">Failed to load stats</div>;

    const statCards = [
        {
            label: 'Total Users',
            value: stats?.totalUsers || 0,
            icon: Users,
            color: 'bg-blue-500',
        },
        {
            label: 'Total Posts',
            value: stats?.totalPosts || 0,
            icon: FileText,
            color: 'bg-emerald-500',
        },
        // {
        //   label: 'Total Goals',
        //   value: stats?.totalGoals || 0,
        //   icon: Target,
        //   color: 'bg-purple-500',
        // },
        {
            label: 'System Status',
            value: 'Online',
            icon: Activity,
            color: 'bg-green-500',
        },
    ];

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Dashboard</h1>
            <p className="text-slate-500 mb-8">Welcome back, {user?.username}!</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center text-white shadow-lg shadow-blue-500/20`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                            <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h2 className="text-lg font-bold text-slate-800 mb-4">Recent Activity</h2>
                <div className="text-slate-500 text-sm">
                    No recent system alerts or logs.
                </div>
            </div>
        </div>
    );
}
