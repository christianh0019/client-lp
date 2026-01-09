import React, { useState } from 'react';
import { type ClientConfig } from '../config/clients';
import { CheckCircle2, Loader2, Send } from 'lucide-react';

interface ApplicationPageProps {
    client: ClientConfig;
}

export const ApplicationPage: React.FC<ApplicationPageProps> = ({ client }) => {
    // Form State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [projectDesc, setProjectDesc] = useState('');
    const [timeline, setTimeline] = useState('');
    const [budget, setBudget] = useState('');

    // UI State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name || !email || !phone) {
            setError('Please fill in your contact details.');
            return;
        }

        setIsSubmitting(true);

        const payload = {
            client: client.name,
            source: 'Application Funnel', // Discriminator
            timestamp: new Date().toISOString(),
            contact: { name, email, phone },
            application: {
                projectDescription: projectDesc,
                timeline: timeline,
                budgetRange: budget
            }
        };

        try {
            if (client.webhookUrl) {
                const response = await fetch(client.webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    setIsSuccess(true);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                    setError('Something went wrong. Please try again or contact us directly.');
                }
            } else {
                // Simulation for no webhook
                await new Promise(r => setTimeout(r, 1000));
                setIsSuccess(true);
            }
        } catch (err) {
            console.error('Submission Error:', err);
            setError('Network error. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center animate-fadeIn">
                <div className="size-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 size={40} />
                </div>
                <h2 className="text-3xl font-serif font-bold text-slate-900 mb-4">Application Received!</h2>
                <p className="text-zinc-500 max-w-md mx-auto mb-8">
                    Thanks for telling us about your project, {name.split(' ')[0]}. We've verified your information and a member of our team will be reviewed your application shortly.
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="text-slate-900 font-bold underline hover:text-purple-600"
                >
                    Start a new application
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto p-6 md:p-12 animate-fadeIn">
            <div className="text-center mb-12 space-y-4">
                <h1 className="text-4xl md:text-5xl font-serif text-slate-900 tracking-tight">
                    Start Your Project
                </h1>
                <p className="text-zinc-500 text-lg">
                    Tell us a bit about what you're looking to build. We're excited to hear your vision.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 md:p-10 rounded-3xl border border-zinc-200 shadow-xl shadow-slate-200/50">

                {/* Contact Section */}
                <div className="space-y-6">
                    <h3 className="text-xs uppercase tracking-widest font-bold text-slate-900 border-b border-zinc-100 pb-2">Contact Info</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700">Full Name</label>
                            <input
                                value={name} onChange={e => setName(e.target.value)}
                                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
                                placeholder="Jane Doe"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700">Phone Number</label>
                            <input
                                value={phone} onChange={e => setPhone(e.target.value)}
                                type="tel"
                                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
                                placeholder="(555) 123-4567"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700">Email Address</label>
                        <input
                            value={email} onChange={e => setEmail(e.target.value)}
                            type="email"
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
                            placeholder="jane@example.com"
                        />
                    </div>
                </div>

                {/* Project Details */}
                <div className="space-y-6 pt-4">
                    <h3 className="text-xs uppercase tracking-widest font-bold text-slate-900 border-b border-zinc-100 pb-2">Project Vision</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700">Timeline Goal</label>
                            <select
                                value={timeline} onChange={e => setTimeline(e.target.value)}
                                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all appearance-none"
                            >
                                <option value="">Select Timeline...</option>
                                <option value="ASAP">Immediately</option>
                                <option value="3-6 Months">3-6 Months</option>
                                <option value="6-12 Months">6-12 Months</option>
                                <option value="12+ Months">12+ Months / Planning Phase</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700">Estimated Budget</label>
                            <select
                                value={budget} onChange={e => setBudget(e.target.value)}
                                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all appearance-none"
                            >
                                <option value="">Select Range...</option>
                                <option value="Under $500k">Under $500k</option>
                                <option value="$500k - $1M">$500k - $1M</option>
                                <option value="$1M - $2M">$1M - $2M</option>
                                <option value="$2M+">$2M+</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700">Describe your project & goals</label>
                        <textarea
                            value={projectDesc} onChange={e => setProjectDesc(e.target.value)}
                            rows={4}
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all resize-none"
                            placeholder="We are looking to build a custom modern farmhouse on our 5-acre lot..."
                        />
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl flex items-center gap-2">
                        <span className="font-bold">Error:</span> {error}
                    </div>
                )}

                <button
                    disabled={isSubmitting}
                    type="submit"
                    className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl text-lg flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="animate-spin" /> Submitting...
                        </>
                    ) : (
                        <>
                            Submit Application <Send size={20} />
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};
