import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Trash2, AlertTriangle, Search } from 'lucide-react';
import { useState } from 'react';
import { UserProfileResponse } from '@/types';

export default function UserManagement() {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');

    const { data: users, isLoading, error } = useQuery<UserProfileResponse[]>({
        queryKey: ['admin-users'],
        queryFn: async () => {
            const response = await apiClient.get('/admin/users');
            return response.data;
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (userId: number) => {
            await apiClient.delete(`/admin/users/${userId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            // Also refresh stats
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
        },
    });

    const handleDelete = (userId: number, username: string) => {
        if (window.confirm(`Are you sure you want to permanently delete user "${username}"? This action cannot be undone.`)) {
            deleteMutation.mutate(userId);
        }
    };

    const filteredUsers = users?.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) return <div className="p-8">Loading users...</div>;
    if (error) return <div className="p-8 text-red-500">Failed to load users</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">User Management</h1>
                    <p className="text-slate-500">Manage registered users and permissions</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">User</th>
                                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Email</th>
                                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Role</th>
                                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Joined</th>
                                <th className="px-6 py-4 font-semibold text-slate-600 text-sm text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredUsers?.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                                                {user.profilePictureUrl ? (
                                                    <img src={user.profilePictureUrl} alt={user.username} className="w-8 h-8 rounded-full object-cover" />
                                                ) : (
                                                    user.username[0].toUpperCase()
                                                )}
                                            </div>
                                            <span className="font-medium text-slate-800">{user.username}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 text-sm">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.role === 'ADMIN'
                                                ? 'bg-purple-100 text-purple-600'
                                                : 'bg-emerald-100 text-emerald-600'
                                            }`}>
                                            {user.role || 'USER'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 text-sm">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleDelete(user.id, user.username)}
                                            className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                                            title="Delete User"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredUsers?.length === 0 && (
                    <div className="p-8 text-center text-slate-500 flex flex-col items-center gap-2">
                        <AlertTriangle size={32} className="text-slate-300" />
                        No users found matching "{searchTerm}"
                    </div>
                )}
            </div>
        </div>
    );
}
