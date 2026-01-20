import { useState } from 'react';
import { Trash2, AlertTriangle, ShieldAlert } from 'lucide-react';
import axios from 'axios';

export default function EmergencyCleanup() {
    const [secret, setSecret] = useState('SUPER_ADMIN_SECRET_2026');
    const [targetUsername, setTargetUsername] = useState('');
    const [postId, setPostId] = useState('');
    const [status, setStatus] = useState('');

    const handleDeleteAll = async () => {
        if (!confirm(`Are you sure you want to DELETE ALL POSTS for user ${targetUsername}? This cannot be undone.`)) return;
        setStatus('Processing...');
        try {
            const res = await axios.delete(`https://api.hustlefolio.live/api/cleanup/posts/all-by-user`, {
                params: { username: targetUsername, secret }
            });
            setStatus(`Success: ${res.data}`);
        } catch (err: any) {
            setStatus(`Error: ${err.response?.data || err.message}`);
        }
    };

    const handleDeleteOne = async () => {
        if (!postId) return;
        setStatus('Processing...');
        try {
            const res = await axios.delete(`https://api.hustlefolio.live/api/cleanup/posts/${postId}`, {
                params: { secret }
            });
            setStatus(`Success: ${res.data}`);
        } catch (err: any) {
            setStatus(`Error: ${err.response?.data || err.message}`);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-slate-900 border border-red-900/50 rounded-2xl p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-6 text-red-500">
                    <ShieldAlert size={32} />
                    <h1 className="text-2xl font-bold">Emergency Cleanup</h1>
                </div>

                <div className="space-y-6">
                    <div className="p-4 bg-red-950/30 rounded-lg border border-red-900/30 text-red-200 text-sm">
                        <AlertTriangle className="inline w-4 h-4 mr-2" />
                        This tool bypasses standard authentication properly. Use only for emergency content moderation.
                    </div>

                    <div>
                        <label className="block text-xs uppercase text-slate-500 font-bold mb-2">Admin Secret</label>
                        <input
                            type="password"
                            value={secret}
                            onChange={e => setSecret(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded p-3 font-mono text-emerald-400"
                        />
                    </div>

                    <div className="border-t border-slate-800 pt-6">
                        <label className="block text-xs uppercase text-slate-500 font-bold mb-2">Delete Single Post</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Post ID (e.g. 152)"
                                value={postId}
                                onChange={e => setPostId(e.target.value)}
                                className="flex-1 bg-slate-800 border border-slate-700 rounded p-3"
                            />
                            <button
                                onClick={handleDeleteOne}
                                className="bg-slate-700 hover:bg-slate-600 p-3 rounded text-white"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="border-t border-slate-800 pt-6">
                        <label className="block text-xs uppercase text-slate-500 font-bold mb-2">Delete All User Posts</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Username (e.g. spammer123)"
                                value={targetUsername}
                                onChange={e => setTargetUsername(e.target.value)}
                                className="flex-1 bg-slate-800 border border-slate-700 rounded p-3"
                            />
                            <button
                                onClick={handleDeleteAll}
                                className="bg-red-600 hover:bg-red-500 p-3 rounded text-white font-bold"
                            >
                                PURGE
                            </button>
                        </div>
                    </div>

                    {status && (
                        <div className="p-4 bg-slate-800 rounded border border-slate-700 font-mono text-sm whitespace-pre-wrap break-all">
                            {status}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
