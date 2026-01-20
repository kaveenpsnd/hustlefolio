import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { LayoutDashboard, Users, FileText, Target, LogOut } from 'lucide-react';

export default function AdminLayout() {
    const { user, logout, isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    // Double check role (though AdminRoute should handle this too)
    if (user?.role !== 'ADMIN') {
        return <div className="p-8 text-center">Access Denied</div>;
    }

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
        { icon: Users, label: 'Users', path: '/admin/users' },
        { icon: FileText, label: 'Posts', path: '/admin/posts' },
        { icon: Target, label: 'Goals', path: '/admin/goals' },
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex-shrink-0 hidden md:flex flex-col">
                <div className="p-6 border-b border-slate-800">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                        Admin Panel
                    </h1>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location.pathname === item.path
                                    ? 'bg-emerald-600 text-white font-medium'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <item.icon size={20} />
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 px-4 py-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-sm">
                            {user.username[0].toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium truncate">{user.username}</p>
                            <p className="text-xs text-slate-500 truncate">Administrator</p>
                        </div>
                    </div>
                    <button
                        onClick={() => logout()}
                        className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-slate-800 rounded-lg transition-colors text-sm"
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto h-screen">
                <Outlet />
            </main>
        </div>
    );
}
