import React, { useState, useEffect } from 'react';
import { AirtableService } from '../services/AirtableService';
import type { ClientConfig } from '../config/clients';
import { AIRTABLE_CONSTANTS } from '../config/constants';
import { Loader2, RefreshCw, Eye, AlertCircle, Lock } from 'lucide-react';

export const AdminPage: React.FC = () => {

    // Check local storage or env for token
    const storedToken = localStorage.getItem('admin_api_token') || import.meta.env.VITE_AIRTABLE_TOKEN || '';
    const [isAuthenticated, setIsAuthenticated] = useState(!!storedToken);
    const [inputToken, setInputToken] = useState('');
    const [authError, setAuthError] = useState('');

    const [clients, setClients] = useState<ClientConfig[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // Viewing State
    const [viewingClient, setViewingClient] = useState<ClientConfig | null>(null);

    useEffect(() => {
        if (isAuthenticated && storedToken) {
            // Init with hardcoded Base ID and the token we have
            AirtableService.init(AIRTABLE_CONSTANTS.BASE_ID, storedToken);
            fetchClients();
        }
    }, [isAuthenticated, storedToken]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Validation: Must look like a PAT
        if (inputToken.startsWith('pat') || inputToken.length > 20) {
            localStorage.setItem('admin_api_token', inputToken);
            setIsAuthenticated(true);
            setAuthError('');
            window.location.reload();
        } else {
            setAuthError('Invalid Token Format (must start with pat...)');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('admin_api_token');
        setIsAuthenticated(false);
        setInputToken('');
        setClients([]);
    };

    const fetchClients = async () => {
        setIsLoading(true);
        setErrorMsg('');
        try {
            // Re-ensure service is ready (redundant but safe)
            AirtableService.init(AIRTABLE_CONSTANTS.BASE_ID, storedToken);

            const data = await AirtableService.getAllClients();
            setClients(data);
        } catch (err: any) {
            console.error(err);
            if (err.message === "Base not initialized") {
                setErrorMsg("System Error: Credentials missing or invalid.");
            } else if (err.error === 'NOT_FOUND') {
                setErrorMsg("Could not find table '🤝 Clients'. Please check Airtable.");
            } else if (err.statusCode === 401 || err.statusCode === 403) {
                setErrorMsg("Unauthorized: API Token is invalid or expired.");
                // Ensure we don't get stuck in a loop, maybe show a "Re-login" button
            } else {
                setErrorMsg(err.message || "Failed to fetch clients.");
            }
        }
        setIsLoading(false);
    };

    if (!isAuthenticated) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-zinc-50">
                <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-xl max-w-sm w-full">
                    <div className="flex flex-col items-center mb-6">
                        <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white mb-4">
                            <Lock size={20} />
                        </div>
                        <h1 className="text-xl font-bold font-serif">Admin Portal</h1>
                        <p className="text-zinc-500 text-xs">Enter API Token to Access</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <input
                                type="password"
                                value={inputToken}
                                onChange={e => setInputToken(e.target.value)}
                                placeholder="Airtable API Token (pat...)"
                                className="w-full border p-3 rounded-lg text-center"
                                autoFocus
                            />
                        </div>
                        {authError && <p className="text-red-500 text-xs text-center font-bold">{authError}</p>}
                        <button
                            type="submit"
                            className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors"
                        >
                            Enter
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <header className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-3xl font-bold font-serif">Client Manager</h1>
                    <p className="text-zinc-500 text-sm">Managing Base: {AIRTABLE_CONSTANTS.BASE_ID}</p>
                </div>
                <div className="flex gap-4">
                    <button onClick={handleLogout} className="text-zinc-400 hover:text-red-500 text-sm">Sign Out</button>
                    <button
                        onClick={fetchClients}
                        className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold transition-all"
                    >
                        <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} /> Sync Clients
                    </button>
                </div>
            </header>

            {/* View Modal */}
            {viewingClient && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white p-8 rounded-2xl max-w-2xl w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-start mb-6">
                            <h2 className="text-xl font-bold">Client Details</h2>
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded font-mono">Read Only</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div>
                                <label className="block text-xs font-bold mb-1 text-zinc-500">Slug (URL Path)</label>
                                <div className="w-full bg-zinc-50 border p-2 rounded text-zinc-700 font-mono text-sm">{viewingClient.id}</div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold mb-1 text-zinc-500">Client Name</label>
                                <div className="w-full bg-zinc-50 border p-2 rounded text-zinc-900 text-sm">{viewingClient.name}</div>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-bold mb-1 text-zinc-500">Logo URL</label>
                                <div className="w-full bg-zinc-50 border p-2 rounded text-zinc-600 text-xs overflow-hidden text-ellipsis whitespace-nowrap">{viewingClient.logo || '-'}</div>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-bold mb-1 text-zinc-500">Webhook URL</label>
                                <div className="w-full bg-zinc-50 border p-2 rounded text-zinc-600 text-xs overflow-hidden text-ellipsis whitespace-nowrap">{viewingClient.webhookUrl || '-'}</div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold mb-1 text-zinc-500">Pixel ID</label>
                                <div className="w-full bg-zinc-50 border p-2 rounded text-zinc-600 text-sm">{viewingClient.pixelId || '-'}</div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold mb-1 text-zinc-500">Booking Widget ID</label>
                                <div className="w-full bg-zinc-50 border p-2 rounded text-zinc-600 text-sm">{viewingClient.bookingWidgetId || '-'}</div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button onClick={() => setViewingClient(null)} className="px-6 py-2 bg-zinc-100 hover:bg-zinc-200 rounded-lg font-bold text-zinc-900">Close</button>
                        </div>
                    </div>
                </div>
            )}

            {errorMsg && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center gap-2 border border-red-100">
                    <AlertCircle size={20} />
                    <span>{errorMsg}</span>
                </div>
            )}

            {/* List */}
            {isLoading && clients.length === 0 ? (
                <div className="flex justify-center p-12"><Loader2 className="animate-spin text-zinc-300" size={32} /></div>
            ) : (
                <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-50 border-b border-zinc-200">
                            <tr>
                                <th className="p-4 font-bold text-zinc-500">Slug</th>
                                <th className="p-4 font-bold text-zinc-500">Name</th>
                                <th className="p-4 font-bold text-zinc-500">Config Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clients.map(client => (
                                <tr key={client.id} className="border-b border-zinc-100 hover:bg-zinc-50/50">
                                    <td className="p-4 font-mono text-zinc-600">{client.id}</td>
                                    <td className="p-4 font-medium flex items-center gap-3">
                                        {client.logo ? <img src={client.logo} className="h-6 w-auto" alt={client.name} /> : <span className="text-zinc-300 italic">No Logo</span>}
                                        {client.name}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            {client.webhookUrl ? <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded textxs">Webhook</span> : <span className="bg-red-50 text-red-400 px-2 py-0.5 rounded text-xs">No Webhook</span>}
                                            {client.pixelId ? <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">Pixel</span> : null}
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button onClick={() => setViewingClient(client)} className="text-zinc-600 hover:text-purple-600 font-bold flex items-center gap-1 justify-end ml-auto">
                                            <Eye size={16} /> View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {clients.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-zinc-400 italic">
                                        No clients found in Airtable table '🤝 Clients'.<br />
                                        <span className="text-xs opacity-70">Make sure your Base ID is correct.<br />ID: {AIRTABLE_CONSTANTS.BASE_ID}</span>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
