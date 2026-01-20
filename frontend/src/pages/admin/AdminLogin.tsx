import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { apiClient, tokenManager } from '@/lib/api-client';
import { Lock, AlertCircle } from 'lucide-react';
// import { jwtDecode } from 'jwt-decode'; // Assuming jwt-decode is available, or use manual decode

// Simple manual decode if jwt-decode not installed (to avoid new dependency issues)
const decodeToken = (token: string) => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
};

export default function AdminLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/admin/dashboard';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // 1. Call API
            const response = await apiClient.post('/auth/login', { username, password });
            const { token } = response.data;

            // 2. Set Token
            tokenManager.set(token);

            // 3. Decode Token to get User info
            const payload = decodeToken(token);
            if (!payload) throw new Error('Invalid token received');

            const userData = {
                id: payload.userId || payload.id || 0,
                username: payload.sub || payload.username,
                email: payload.email || '',
                createdAt: new Date().toISOString(),
                role: payload.role || 'USER'
            };

            // 4. Update Auth Context
            login(userData);

            // 5. Check Role and Redirect
            if (userData.role === 'ADMIN') {
                navigate(from, { replace: true });
            } else {
                setError('Access Denied: You do not have administrator privileges.');
                tokenManager.clear();
                // Force reload to clear state if cleaner logout needed, or just let them stay logged out
            }

        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-700">
                <div className="p-8">
                    <div className="flex justify-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg transform rotate-3">
                            <Lock className="text-white w-8 h-8" />
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-center text-white mb-2">Admin Access</h2>
                    <p className="text-slate-400 text-center mb-8">Enter your credentials to continue</p>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-3 text-red-400 text-sm">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                placeholder="admin_user"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Authenticating...' : 'Secure Login'}
                        </button>
                    </form>
                </div>
                <div className="bg-slate-900/50 p-4 text-center border-t border-slate-700">
                    <p className="text-xs text-slate-500">
                        Authorized personnel only. All actions are logged.
                    </p>
                </div>
            </div>
        </div>
    );
}
