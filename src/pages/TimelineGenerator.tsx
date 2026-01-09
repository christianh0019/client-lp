import React, { useState } from 'react';
import { type ClientConfig } from '../config/clients';
import { calculateTimeline, formatDate, type TimelineResult } from '../services/TimelineLogic';
import { CheckCircle2, ArrowRight, Loader2, Clock, Send } from 'lucide-react';

interface TimelineGeneratorProps {
    client: ClientConfig;
}

export const TimelineGenerator: React.FC<TimelineGeneratorProps> = ({ client }) => {
    // State
    const [status, setStatus] = useState<string>('');
    const [result, setResult] = useState<TimelineResult | null>(null);
    const [isCalculating, setIsCalculating] = useState(false);

    // Convert status to start date offset
    // e.g. "Have Permits" means we skip the first 2 phases

    const handleCalculate = () => {
        setIsCalculating(true);
        setTimeout(() => {
            // Default logic: Start TODAY
            // Ideally we'd adjust start date based on 'status', but for MVP we show full roadmap starting today
            // to show them the full journey they are embarking on.
            setResult(calculateTimeline(new Date()));
            setIsCalculating(false);
        }, 800);
    };

    // Lead Capture State
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [captured, setCaptured] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const payload = {
            client: client.name,
            source: 'Timeline Generator',
            timestamp: new Date().toISOString(),
            contact: { name, email, phone },
            project: {
                currentStatus: status,
                estimatedMoveIn: result ? formatDate(result.moveInDate) : 'Unknown'
            }
        };

        try {
            if (client.webhookUrl) {
                await fetch(client.webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }
            setCaptured(true);
        } catch (e) {
            console.error(e);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-12 animate-fadeIn pb-32">

            {/* Header */}
            <div className="text-center mb-12 space-y-4">
                <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-2">
                    <Clock size={14} /> Official Project Roadmap
                </div>
                <h1 className="text-4xl md:text-6xl font-serif text-slate-900 tracking-tight leading-tight">
                    When Can You Move In?
                </h1>
                <p className="text-zinc-500 text-lg max-w-2xl mx-auto">
                    Building a custom home is a journey. Select your current status to generate your personalized construction roadmap and estimated move-in date.
                </p>
            </div>

            {/* Input Section */}
            {!result ? (
                <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-xl shadow-slate-200/50 max-w-xl mx-auto">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900 mb-6">Where are you right now?</h3>
                    <div className="space-y-3">
                        {[
                            "Just Dreaming / Researching",
                            "Looking for Land",
                            "Have Land, Need Plans",
                            "Have Plans, Need Builder"
                        ].map((opt) => (
                            <button
                                key={opt}
                                onClick={() => setStatus(opt)}
                                className={`w-full text-left p-4 rounded-xl border transition-all ${status === opt
                                    ? 'border-purple-600 bg-purple-50 text-purple-900 font-bold ring-1 ring-purple-600'
                                    : 'border-zinc-200 hover:bg-zinc-50 text-zinc-700'}`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>

                    <button
                        disabled={!status || isCalculating}
                        onClick={handleCalculate}
                        className="w-full mt-8 bg-slate-900 text-white font-bold py-4 rounded-xl text-lg flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isCalculating ? (
                            <><Loader2 className="animate-spin" /> Calculating Dates...</>
                        ) : (
                            <>Generate My Timeline <ArrowRight size={20} /></>
                        )}
                    </button>
                </div>
            ) : (
                <div className="space-y-12 animate-fadeIn">

                    {/* The Big Date */}
                    <div className="text-center bg-slate-900 text-white p-8 md:p-12 rounded-3xl shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                        <div className="relative z-10">
                            <span className="text-purple-300 font-bold uppercase tracking-widest text-sm">Estimated Move-In Date</span>
                            <div className="text-5xl md:text-7xl font-serif font-bold mt-2 mb-4">
                                {formatDate(result.moveInDate).split(' ')[0]} <span className="text-white/50">{formatDate(result.moveInDate).split(' ')[1]}</span>
                            </div>
                            <p className="text-white/60 text-sm max-w-md mx-auto">
                                Based on a typical {result.totalMonths}-month build cycle starting today. Timelines vary based on permitting speed and weather.
                            </p>
                        </div>
                    </div>

                    {/* Timeline Visual */}
                    <div className="relative border-l-2 border-zinc-200 ml-4 md:ml-8 space-y-8 md:space-y-12 py-4">
                        {result.phases.map((phase, idx) => (
                            <div key={idx} className="relative pl-8 md:pl-12 group">
                                {/* Dot */}
                                <div className={`absolute -left-[9px] top-6 w-4 h-4 rounded-full border-4 border-white shadow-sm ${phase.color} z-10 box-content`}></div>

                                <div className="bg-white border border-zinc-100 p-6 rounded-2xl shadow-sm group-hover:shadow-md transition-shadow relative overflow-hidden">
                                    <div className={`absolute top-0 left-0 w-1 h-full ${phase.color}`}></div>
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div>
                                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{formatDate(phase.startDate)} - {formatDate(phase.endDate)}</span>
                                            <h4 className="text-xl font-bold text-slate-900 mt-1">{phase.name}</h4>
                                            <p className="text-zinc-500 text-sm mt-2">{phase.description}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Lead Capture */}
                    {!captured ? (
                        <div className="bg-purple-50 border border-purple-100 p-8 rounded-3xl text-center max-w-2xl mx-auto">
                            <h3 className="text-2xl font-serif font-bold text-purple-900 mb-4">Save Your Official Timeline</h3>
                            <p className="text-purple-700/80 mb-6">
                                Enter your details to save this roadmap and get our "Construction Guide" PDF sent to your inbox.
                            </p>
                            <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
                                <input required value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" className="w-full px-4 py-3 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                                <input required value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Email Address" className="w-full px-4 py-3 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                                <input required value={phone} onChange={e => setPhone(e.target.value)} type="tel" placeholder="Phone Number" className="w-full px-4 py-3 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                                <button disabled={isSubmitting} type="submit" className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
                                    {isSubmitting ? <Loader2 className="animate-spin" /> : <>Send Me My Plan <Send size={16} /></>}
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="bg-green-50 border border-green-100 p-8 rounded-3xl text-center max-w-2xl mx-auto">
                            <div className="size-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 size={32} />
                            </div>
                            <h3 className="text-2xl font-bold text-green-900 mb-2">Success!</h3>
                            <p className="text-green-700">Check your inbox for your detailed timeline PDF.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
