import React, { useState, useEffect } from 'react';
import { AirtableService } from '../services/AirtableService';
import type { ClientConfig } from '../config/clients';
import { Save, Loader2, Plus, AlertCircle } from 'lucide-react';

export const AdminPage: React.FC = () => {
    const [apiKey] = useState(import.meta.env.VITE_AIRTABLE_TOKEN || '');
    const [baseId, setBaseId] = useState(localStorage.getItem('admin_base_id') || '');

    // Setup State
    const [isConfigured, setIsConfigured] = useState(!!baseId);

    const [clients, setClients] = useState<ClientConfig[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [statusMsg, setStatusMsg] = useState('');

    // Editing State
    const [editingClient, setEditingClient] = useState<Partial<ClientConfig> | null>(null);

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

    const handleSaveClient = async () => {
        if (!editingClient || !editingClient.id || !editingClient.name) {
            setStatusMsg("Name and Slug (ID) are required.");
            return;
        }

        setIsLoading(true);
        // Cast to full config for save (adding required fields if missing)
        const clientToSave: ClientConfig = {
            id: editingClient.id.toLowerCase(),
            name: editingClient.name,
            webhookUrl: editingClient.webhookUrl || '',
            pixelId: editingClient.pixelId || '',
            bookingWidgetId: editingClient.bookingWidgetId || '',
            logo: editingClient.logo,
            branding: {
                primaryColor: editingClient.branding?.primaryColor
            }
        };

        const success = await AirtableService.saveClient(clientToSave);
        if (success) {
            setStatusMsg("Saved successfully!");
            setEditingClient(null);
            fetchClients();
        } else {
            setStatusMsg("Failed to save. Check Base ID and Schema.");
        }
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
                        <strong>Required Table:</strong> Create a table named 'Clients' with columns: Slug, Name, WebhookUrl, PixelId, BookingWidgetId, Logo.
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
                        onClick={() => setEditingClient({})}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold"
                    >
                        <Plus size={16} /> New Client
                    </button>
                </div>
            </header>

            {/* Editor Modal/Panel */}
            {editingClient && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white p-8 rounded-2xl max-w-2xl w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <h2 className="text-xl font-bold mb-6">{editingClient.id ? 'Edit Client' : 'New Client'}</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div>
                                <label className="block text-xs font-bold mb-1">Slug (URL Path)</label>
                                <input
                                    value={editingClient.id || ''}
                                    onChange={e => setEditingClient({ ...editingClient, id: e.target.value })}
                                    placeholder="e.g. homestead"
                                    className="w-full border p-2 rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold mb-1">Client Name</label>
                                <input
                                    value={editingClient.name || ''}
                                    onChange={e => setEditingClient({ ...editingClient, name: e.target.value })}
                                    placeholder="Homestead Builders"
                                    className="w-full border p-2 rounded"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-bold mb-1">Logo URL</label>
                                <input
                                    value={editingClient.logo || ''}
                                    onChange={e => setEditingClient({ ...editingClient, logo: e.target.value })}
                                    placeholder="https://..."
                                    className="w-full border p-2 rounded"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-bold mb-1">Webhook URL</label>
                                <input
                                    value={editingClient.webhookUrl || ''}
                                    onChange={e => setEditingClient({ ...editingClient, webhookUrl: e.target.value })}
                                    placeholder="https://hooks.zapier..."
                                    className="w-full border p-2 rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold mb-1">Pixel ID</label>
                                <input
                                    value={editingClient.pixelId || ''}
                                    onChange={e => setEditingClient({ ...editingClient, pixelId: e.target.value })}
                                    placeholder="123456..."
                                    className="w-full border p-2 rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold mb-1">Booking Widget ID</label>
                                <input
                                    value={editingClient.bookingWidgetId || ''}
                                    onChange={e => setEditingClient({ ...editingClient, bookingWidgetId: e.target.value })}
                                    placeholder="Calendar ID"
                                    className="w-full border p-2 rounded"
                                />
                            </div>
                        </div>

                        {statusMsg && <div className="mb-4 text-sm text-blue-600 flex items-center gap-2"><AlertCircle size={14} />{statusMsg}</div>}

                        <div className="flex justify-end gap-3">
                            <button onClick={() => setEditingClient(null)} className="px-4 py-2 text-zinc-500">Cancel</button>
                            <button
                                onClick={handleSaveClient}
                                disabled={isLoading}
                                className="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2"
                            >
                                {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                Save Client
                            </button>
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
                                        {client.logo && <img src={client.logo} className="h-6 w-auto" />}
                                        {client.name}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            {client.webhookUrl ? <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded textxs">Webhook</span> : <span className="bg-red-50 text-red-400 px-2 py-0.5 rounded text-xs">No Webhook</span>}
                                            {client.pixelId ? <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">Pixel</span> : null}
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button onClick={() => setEditingClient(client)} className="text-purple-600 font-bold hover:underline">Edit</button>
                                    </td>
                                </tr>
                            ))}
                            {clients.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-zinc-400 italic">No clients found in AirTable table 'Clients'.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
