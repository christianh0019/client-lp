import React, { useState, useEffect } from 'react';
import { type ClientConfig } from '../config/clients';
import { calculateAdjustedTimeline, formatDate, type TimelineResult, type TimelineInputs } from '../services/TimelineLogic';
import { LocationCostService } from '../services/LocationCostService';
import { CheckCircle2, ArrowRight, ArrowLeft, Loader2, ShieldCheck, MapPin, Calendar as CalendarIcon, PiggyBank, PenTool, Check, AlertTriangle } from 'lucide-react';

interface TimelineGeneratorProps {
    client: ClientConfig;
}

type Step = 'welcome' | 'questions' | 'analyzing' | 'gate' | 'results';

export const TimelineGenerator: React.FC<TimelineGeneratorProps> = ({ client }) => {
    // Top-level Wizard State
    const [step, setStep] = useState<Step>('welcome');
    const [questionIdx, setQuestionIdx] = useState(0);

    // --- Input State ---
    const [city, setCity] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isCityValid, setIsCityValid] = useState(false);

    const [landStatus, setLandStatus] = useState<TimelineInputs['landStatus']>('Not yet');
    const [financing, setFinancing] = useState<TimelineInputs['financing']>('Still exploring');
    const [designStatus, setDesignStatus] = useState<TimelineInputs['designStatus']>('Not Started');
    const [moveInGoal, setMoveInGoal] = useState('');

    // Contact State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Result State
    const [result, setResult] = useState<TimelineResult | null>(null);
    const [loadingMessage, setLoadingMessage] = useState('Analyzing your answers...');

    // --- Actions ---

    // Scroll to top on step change for mobile
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [step]);

    const handleNextQuestion = () => {
        if (questionIdx < 4) {
            setQuestionIdx(prev => prev + 1);
        } else {
            setStep('analyzing');
        }
    };

    const handleBackQuestion = () => {
        if (questionIdx > 0) {
            setQuestionIdx(prev => prev - 1);
        } else {
            setStep('welcome');
        }
    };

    // City Logic
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (city && city.length >= 2 && !isCityValid) {
                const matches = await LocationCostService.searchCities(city);
                setSuggestions(matches);
                setShowSuggestions(matches.length > 0);
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [city, isCityValid]);

    const selectCity = (val: string) => {
        setCity(val);
        setIsCityValid(true);
        setSuggestions([]);
        setShowSuggestions(false);
        setTimeout(handleNextQuestion, 400); // Small delay for UX feel
    };

    // Analyzing Logic
    useEffect(() => {
        if (step === 'analyzing') {
            const msgs = [
                `Analyzing custom home data for ${city}...`,
                `Evaluating local permitting timelines...`,
                `Projecting construction phases...`,
                `Finalizing your official roadmap...`
            ];

            let i = 0;
            setLoadingMessage(msgs[0]);

            const interval = setInterval(() => {
                i++;
                if (i < msgs.length) {
                    setLoadingMessage(msgs[i]);
                } else {
                    clearInterval(interval);
                    setStep('gate');
                }
            }, 1200);

            return () => clearInterval(interval);
        }
    }, [step, city]);

    const handleGateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const timelineResult = calculateAdjustedTimeline({ landStatus, designStatus, financing });
        setResult(timelineResult);

        const payload = {
            client: client.name,
            source: 'Timeline Generator',
            timestamp: new Date().toISOString(),
            contact: { name, email, phone },
            project: {
                city,
                landStatus,
                financing,
                designStatus,
                targetMoveIn: moveInGoal,
                calculatedMoveIn: `${formatDate(timelineResult.moveInDateMin)} - ${formatDate(timelineResult.moveInDateMax)}`,
                totalMonths: `${timelineResult.minTotalMonths}-${timelineResult.maxTotalMonths} months`
            },
            sales_note: `Goal: ${moveInGoal}. Reality: ${formatDate(timelineResult.moveInDateMin)}-${formatDate(timelineResult.moveInDateMax)} (${timelineResult.minTotalMonths}-${timelineResult.maxTotalMonths}mo).`
        };

        if (client.webhookUrl) {
            fetch(client.webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }).catch(e => console.error("Webhook Error", e));
        }

        setTimeout(() => {
            setIsSubmitting(false);
            setStep('results');
        }, 800);
    };


    // --- View Components ---

    const OptionButton = ({ label, selected, onClick }: { label: string, selected: boolean, onClick: () => void }) => (
        <button
            onClick={onClick}
            className={`w-full text-left p-5 rounded-2xl border transition-all duration-200 group relative overflow-hidden ${selected
                    ? 'border-purple-500 bg-purple-50 shadow-md shadow-purple-100 ring-1 ring-purple-500'
                    : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-sm bg-white'
                }`}
        >
            <div className="flex justify-between items-center relative z-10">
                <span className={`font-medium text-lg ${selected ? 'text-purple-900 font-bold' : 'text-zinc-700'}`}>{label}</span>
                {selected && <div className="size-6 bg-purple-500 rounded-full flex items-center justify-center text-white"><Check size={14} strokeWidth={3} /></div>}
            </div>
        </button>
    );

    const renderWelcome = () => (
        <div className="max-w-2xl mx-auto text-center pt-12 md:pt-20 space-y-8 animate-fadeIn">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100 text-purple-800 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm">
                <CheckCircle2 size={14} /> Official Planning Tool
            </div>

            <h1 className="text-4xl md:text-6xl font-serif text-slate-900 tracking-tight leading-[1.1]">
                When Can You <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Move In?</span>
            </h1>

            <p className="text-zinc-500 text-lg md:text-xl leading-relaxed max-w-xl mx-auto">
                Building a custom home is a journey. Answer 5 quick questions to generate your personalized construction roadmap and estimated move-in date.
            </p>

            <button
                onClick={() => setStep('questions')}
                className="group relative inline-flex items-center justify-center gap-3 bg-slate-900 text-white font-bold py-5 px-10 rounded-full text-lg shadow-2xl shadow-slate-900/30 hover:shadow-slate-900/40 hover:scale-[1.02] transition-all duration-300 overflow-hidden"
            >
                <span className="relative z-10">Start My Timeline</span>
                <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>

            <p className="text-xs text-zinc-400 font-medium tracking-wide uppercase">No email required to start</p>
        </div>
    );

    const renderQuestionnaire = () => {
        const questions = [
            {
                // Q1
                icon: MapPin,
                question: "Where are you planning to build?",
                helper: "Timelines vary heavily by municipality.",
                content: (
                    <div className="relative w-full max-w-md mx-auto">
                        <div className="relative">
                            <input
                                autoFocus
                                value={city}
                                onChange={e => { setCity(e.target.value); setIsCityValid(false); }}
                                placeholder="Typing City..."
                                className={`w-full text-3xl font-serif border-b-2 py-4 bg-transparent text-center focus:outline-none transition-all placeholder:text-zinc-300 ${isCityValid ? 'border-green-500 text-slate-900' : 'border-zinc-200 focus:border-purple-600 text-slate-900'
                                    }`}
                            />
                        </div>
                        {/* Suggestions */}
                        {showSuggestions && (
                            <div className="absolute top-full left-0 right-0 mt-4 bg-white border border-zinc-100 rounded-2xl shadow-2xl shadow-slate-200/50 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                {suggestions.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => selectCity(s)}
                                        className="w-full text-left px-6 py-4 text-base text-zinc-600 hover:bg-purple-50 hover:text-purple-900 transition-colors border-b border-zinc-50 last:border-0 font-medium"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ),
                isValid: isCityValid
            },
            {
                // Q2
                icon: MapPin,
                question: "Do you already own land?",
                helper: "This helps us calculate site prep time.",
                content: (
                    <div className="grid gap-4 w-full max-w-md mx-auto">
                        {['Yes', 'Not yet', 'In process'].map(opt => (
                            <OptionButton key={opt} label={opt} selected={landStatus === opt} onClick={() => { setLandStatus(opt as any); setTimeout(handleNextQuestion, 250); }} />
                        ))}
                    </div>
                ),
                isValid: true
            },
            {
                // Q3
                icon: PiggyBank,
                question: "How are you financing?",
                helper: "Financing approval is a common delay factor.",
                content: (
                    <div className="grid gap-4 w-full max-w-md mx-auto">
                        {['Cash', 'Pre-approved loan', 'Still exploring'].map(opt => (
                            <OptionButton key={opt} label={opt} selected={financing === opt} onClick={() => { setFinancing(opt as any); setTimeout(handleNextQuestion, 250); }} />
                        ))}
                    </div>
                ),
                isValid: true
            },
            {
                // Q4
                icon: PenTool,
                question: "Design status?",
                helper: "Design is where most projects slow down.",
                content: (
                    <div className="grid gap-4 w-full max-w-md mx-auto">
                        {['Plans Complete', 'In Progress', 'Not Started'].map(opt => (
                            <OptionButton key={opt} label={opt} selected={designStatus === opt} onClick={() => { setDesignStatus(opt as any); setTimeout(handleNextQuestion, 250); }} />
                        ))}
                    </div>
                ),
                isValid: true
            },
            {
                // Q5
                icon: CalendarIcon,
                question: "Target Move-In Date?",
                helper: "Just your best guess goal.",
                content: (
                    <div className="grid gap-4 w-full max-w-md mx-auto">
                        {['Next 6 Months', 'Next 12 Months', 'Next 18-24 Months', 'Just Researching'].map(opt => (
                            <OptionButton key={opt} label={opt} selected={moveInGoal === opt} onClick={() => { setMoveInGoal(opt); setTimeout(handleNextQuestion, 250); }} />
                        ))}
                    </div>
                ),
                isValid: true
            }
        ];

        const currentQ = questions[questionIdx];
        const Icon = currentQ.icon;

        return (
            <div className="max-w-2xl mx-auto pt-12 relative min-h-[500px]">
                {/* Header Nav */}
                <div className="flex items-center justify-between mb-8 px-4">
                    <button
                        onClick={handleBackQuestion}
                        className="p-2 -ml-2 text-zinc-400 hover:text-slate-900 hover:bg-zinc-100 rounded-full transition-all group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <span className="text-xs font-bold text-zinc-300 tracking-widest uppercase">Step {questionIdx + 1} of 5</span>
                    <div className="w-8"></div> {/* Spacer */}
                </div>

                {/* Question Card */}
                <div key={questionIdx} className="animate-in slide-in-from-right-8 fade-in duration-300">
                    <div className="text-center space-y-8">
                        <div className="size-16 bg-white border border-zinc-100 shadow-xl shadow-purple-900/5 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
                            <Icon size={32} strokeWidth={1.5} />
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900">
                                {currentQ.question}
                            </h2>
                            <p className="text-zinc-400">
                                {currentQ.helper}
                            </p>
                        </div>

                        <div className="py-2">
                            {currentQ.content}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderAnalyzing = () => (
        <div className="max-w-xl mx-auto pt-32 text-center flex flex-col items-center animate-fadeIn">
            <div className="relative mb-12">
                {/* Rings */}
                <div className="absolute inset-0 border-4 border-purple-100 rounded-full animate-ping opacity-20"></div>
                <div className="size-24 rounded-full border-4 border-slate-50 border-t-purple-600 animate-spin shadow-2xl"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="size-16 bg-white rounded-full flex items-center justify-center shadow-inner">
                        <Loader2 className="animate-pulse text-purple-600" size={24} />
                    </div>
                </div>
            </div>
            <h2 className="text-2xl font-serif font-bold text-slate-900 animate-pulse transition-all duration-300">
                {loadingMessage}
            </h2>
        </div>
    );

    const renderGate = () => (
        <div className="max-w-xl mx-auto pt-20 animate-in slide-in-from-bottom-8 fade-in duration-500 text-center">
            <div className="size-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-green-100 shadow-xl">
                <CheckCircle2 size={40} />
            </div>

            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-4">Your Timeline Is Ready 🎉</h2>
            <p className="text-zinc-500 text-lg mb-10 max-w-sm mx-auto">
                We have built a custom roadmap based on your answers.<br />
                <strong>Where should we send your timeline?</strong>
            </p>

            <form onSubmit={handleGateSubmit} className="space-y-4 max-w-md mx-auto bg-white p-8 rounded-3xl border border-zinc-100 shadow-2xl shadow-slate-200/50 relative overflow-hidden">
                <div className="space-y-4 relative z-10">
                    <div className="text-left space-y-1">
                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">First Name</label>
                        <input required value={name} onChange={e => setName(e.target.value)} className="w-full px-5 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-zinc-50 transition-all" placeholder="Jane Doe" />
                    </div>
                    <div className="text-left space-y-1">
                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">Email Address</label>
                        <input required value={email} onChange={e => setEmail(e.target.value)} type="email" className="w-full px-5 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-zinc-50 transition-all" placeholder="jane@example.com" />
                    </div>
                    <div className="text-left space-y-1">
                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">Phone Number</label>
                        <input required value={phone} onChange={e => setPhone(e.target.value)} type="tel" className="w-full px-5 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-zinc-50 transition-all" placeholder="(555) 123-4567" />
                    </div>
                </div>

                <button disabled={isSubmitting} type="submit" className="w-full mt-6 bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-70">
                    {isSubmitting ? <Loader2 className="animate-spin" /> : <>Reveal My Timeline <ArrowRight size={18} /></>}
                </button>
                <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-400 pt-4 opacity-70">
                    <ShieldCheck size={10} /> Secure. No Spam. No Pressure.
                </div>
            </form>
        </div>
    );

    const renderResults = () => {
        if (!result) return null;

        return (
            <div className="max-w-5xl mx-auto animate-in fade-in duration-700 pb-32">
                {/* Hero Card */}
                <div className="bg-slate-900 text-white p-8 md:p-16 rounded-[2.5rem] text-center shadow-2xl shadow-slate-900/20 relative overflow-hidden mb-20 group">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600 rounded-full blur-[100px] opacity-20 -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600 rounded-full blur-[100px] opacity-20 -ml-16 -mb-16"></div>

                    <div className="relative z-10 transition-transform duration-700 group-hover:scale-[1.01]">
                        <span className="inline-block border border-white/20 px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-sm text-purple-200 font-bold uppercase tracking-widest text-xs mb-6 shadow-sm">
                            Official Construction Estimate
                        </span>

                        <h2 className="text-xl text-zinc-300 font-medium mb-4">Based on your inputs, your estimated move-in window is:</h2>

                        <div className="text-4xl md:text-6xl font-serif font-bold text-white mb-6 tracking-tight">
                            {formatDate(result.moveInDateMin)} - {formatDate(result.moveInDateMax)}
                        </div>

                        <div className="inline-flex items-center gap-2 text-white/60 text-sm bg-slate-800/50 px-4 py-2 rounded-lg border border-white/5 backdrop-blur-md">
                            <CheckCircle2 size={14} className="text-green-400" />
                            Total Duration: <strong>{result.minTotalMonths} - {result.maxTotalMonths} months</strong>
                        </div>
                    </div>
                </div>

                {/* Timeline Visual */}
                <h3 className="text-center font-serif text-2xl text-slate-900 mb-12">Your Detailed Roadmap</h3>

                <div className="relative max-w-3xl mx-auto pl-4">
                    {/* Vertical Line */}
                    <div className="absolute left-[27px] top-4 bottom-12 w-0.5 bg-gradient-to-b from-purple-200 via-zinc-200 to-transparent"></div>

                    <div className="space-y-12">
                        {result.phases.map((phase, idx) => (
                            <div key={idx} className="relative pl-16 group">
                                {/* Dot */}
                                <div className={`absolute left-4 top-8 -translate-x-1/2 w-6 h-6 rounded-full border-4 border-white shadow-md ${phase.color} z-10 transition-transform duration-300 group-hover:scale-125 ring-1 ring-zinc-100`}></div>

                                <div className="bg-white border border-zinc-100 p-8 rounded-3xl shadow-lg shadow-slate-200/40 hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                                    <div className={`absolute top-0 left-0 w-1.5 h-full ${phase.color} opacity-80`}></div>
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
                                                    {phase.minDuration}-{phase.maxDuration} MONTHS
                                                </span>
                                            </div>

                                            <h4 className="text-xl font-bold text-slate-900 mb-2 font-serif">{phase.name}</h4>
                                            <p className="text-zinc-500 text-sm leading-relaxed max-w-lg mb-4">{phase.description}</p>

                                            {/* Delay Warning */}
                                            {phase.delayWarning && (
                                                <div className="mt-4 bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3 text-sm text-amber-800">
                                                    <AlertTriangle className="shrink-0 mt-0.5 text-amber-500" size={16} />
                                                    <p><strong>Delay Warning:</strong> {phase.delayWarning}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="mt-24 bg-gradient-to-br from-zinc-50 to-white border border-zinc-100 p-12 rounded-[3rem] text-center max-w-3xl mx-auto shadow-xl shadow-slate-200/50">
                    <h2 className="text-3xl font-serif text-slate-900 mb-6">Want to stay on track?</h2>
                    <p className="text-zinc-500 max-w-md mx-auto mb-8 text-lg">
                        This timeline is a great start. A 15-minute consultation can help you lock in these dates and avoid common delays.
                    </p>
                    <a
                        href={`tel:${client.phoneNumber || ''}`}
                        className="inline-flex items-center gap-3 bg-slate-900 text-white font-bold py-4 px-10 rounded-full hover:bg-slate-800 hover:scale-[1.02] hover:shadow-lg transition-all"
                    >
                        Schedule Free Planning Call <ArrowRight size={20} />
                    </a>
                </div>

            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#fafafa] pb-20 selection:bg-purple-100">
            <div className="p-4 md:p-8">
                {step === 'welcome' && renderWelcome()}
                {step === 'questions' && renderQuestionnaire()}
                {step === 'analyzing' && renderAnalyzing()}
                {step === 'gate' && renderGate()}
                {step === 'results' && renderResults()}
            </div>
        </div>
    );
};
