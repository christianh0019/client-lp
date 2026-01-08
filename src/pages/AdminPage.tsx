import React, { useState, useEffect } from 'react';
import { AirtableService } from '../services/AirtableService';
import type { ClientConfig } from '../config/clients';
import { Loader2, RefreshCw, Eye } from 'lucide-react';

export const AdminPage: React.FC = () => {
    const [apiKey] = useState(import.meta.env.VITE_AIRTABLE_TOKEN || '');
    const [baseId, setBaseId] = useState(localStorage.getItem('admin_base_id') || '');

    // Setup State
    const [isConfigured, setIsConfigured] = useState(!!baseId);

    const [clients, setClients] = useState<ClientConfig[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Viewing State
    const [viewingClient, setViewingClient] = useState<ClientConfig | null>(null);

    useEffect(() => {
        if (baseId && apiKey) {
            AirtableService.init(baseId);
            fetchClients();
        }
    }, [baseId]);

    const handleSaveConfig = () => {
        if (baseId) {
            localStorage.setItem('admin_base_id', baseId);
            AirtableService.init(baseId);
            setIsConfigured(true);
            fetchClients();
        }
    };

    const fetchClients = async () => {
        setIsLoading(true);
        const data = await AirtableService.getAllClients();
        setClients(data);
        setIsLoading(false);
    };

    if (!isConfigured) {
        return (
            <div className="p-8 max-w-md mx-auto mt-20 bg-white shadow-xl rounded-2xl border border-zinc-200">
                <h1 className="text-2xl font-bold mb-4">Admin Connections</h1>
                <p className="text-sm text-zinc-500 mb-6">Enter your Airtable Base ID to manage clients. The API Token is pre-configured.</p>

                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold uppercase block mb-1">Base ID</label>
                        <input
                            value={baseId}
                            onChange={e => setBaseId(e.target.value)}
                            placeholder="app..."
                            className="w-full border p-2 rounded-lg"
                        />
                    </div>
                    <button
                        onClick={handleSaveConfig}
                        className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold"
                    >
                        Connect
                    </button>
                    <div className="text-xs bg-zinc-50 p-2 rounded border border-zinc-200 text-zinc-500">
                        <strong>Required Table:</strong> '🤝 Clients' with columns: Slug, Name, Webhook URL, Facebook Pixel ID, Booking Widget ID, Logo URL, Primary Color.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <header className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-3xl font-bold font-serif">Client Manager</h1>
                    <p className="text-zinc-500 text-sm">Connected to Base: {baseId}</p>
                </div>
                <div className="flex gap-4">
                    <button onClick={() => { localStorage.removeItem('admin_base_id'); window.location.reload(); }} className="text-red-500 text-sm">Disconnect</button>
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
                                        <span className="text-xs opacity-70">Make sure your Base ID matches and the table name is exact.</span>
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
