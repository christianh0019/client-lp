import React, { useState, useEffect } from 'react';
import { type ClientConfig } from '../config/clients';
import { calculateAdjustedTimeline, formatDate, type TimelineResult, type TimelineInputs } from '../services/TimelineLogic';
import { LocationCostService } from '../services/LocationCostService';
import { CheckCircle2, ArrowRight, ArrowLeft, Loader2, ShieldCheck, MapPin, Calendar as CalendarIcon, PiggyBank, PenTool } from 'lucide-react';

interface TimelineGeneratorProps {
    client: ClientConfig;
}

type Step = 'welcome' | 'questions' | 'gate' | 'analyzing' | 'results';

export const TimelineGenerator: React.FC<TimelineGeneratorProps> = ({ client }) => {
    // Wizard State
    const [step, setStep] = useState<Step>('welcome');
    const [questionIdx, setQuestionIdx] = useState(0);

    // --- Input State ---

    // Q1: City (Autocomplete)
    const [city, setCity] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isCityValid, setIsCityValid] = useState(false);

    // Q2-Q5
    const [landStatus, setLandStatus] = useState<TimelineInputs['landStatus']>('Not yet');
    const [financing, setFinancing] = useState('Still exploring options');
    const [designStatus, setDesignStatus] = useState<TimelineInputs['designStatus']>('Not started');
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

    const handleNextQuestion = () => {
        if (questionIdx < 4) {
            setQuestionIdx(prev => prev + 1);
        } else {
            setStep('gate');
        }
    };

    const handleBackQuestion = () => {
        if (questionIdx > 0) {
            setQuestionIdx(prev => prev - 1);
        } else {
            setStep('welcome');
        }
    };

    // City Autocomplete Logic
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
        handleNextQuestion();
    };


    const handleGateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // 1. Calculate Result IMMEDIATELY (but don't show yet)
        const timelineResult = calculateAdjustedTimeline({
            landStatus,
            designStatus
        });
        setResult(timelineResult);

        // 2. Prepare Payload
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
                calculatedMoveIn: formatDate(timelineResult.moveInDate),
                totalMonths: timelineResult.totalMonths
            },
            sales_note: `Goal: ${moveInGoal}. Reality: ${formatDate(timelineResult.moveInDate)} (${timelineResult.totalMonths}mo build).`
        };

        // 3. Fire Webhook (Background)
        if (client.webhookUrl) {
            fetch(client.webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }).catch(e => console.error("Webhook Error", e));
        }

        // 4. Start Loading Sequence
        setStep('analyzing');
        setIsSubmitting(false); // Stop button spinner, we are now in "Analyzing" screen
    };

    // Loading Sequence Effect
    useEffect(() => {
        if (step === 'analyzing') {
            const msgs = [
                `Analyzing your answers...`,
                `Pulling permit data for ${city}...`,
                `Projecting construction phases...`,
                `Finalizing your roadmap...`
            ];

            let i = 0;
            const interval = setInterval(() => {
                i++;
                if (i < msgs.length) {
                    setLoadingMessage(msgs[i]);
                } else {
                    clearInterval(interval);
                    setStep('results');
                }
            }, 1500); // 1.5s per message * 4 = 6 seconds total

            return () => clearInterval(interval);
        }
    }, [step, city]);


    // --- Render Helpers ---

    const renderWelcome = () => (
        <div className="text-center max-w-2xl mx-auto space-y-8 animate-fadeIn pt-12">
            <h1 className="text-4xl md:text-6xl font-serif text-slate-900 tracking-tight leading-tight">
                When Can You Move In?
            </h1>
            <p className="text-zinc-500 text-lg leading-relaxed">
                If you are thinking about building a custom home, one of the biggest questions is timing. <br /><br />
                This quick tool helps you understand how long the process typically takes based on where you are today. No pressure. No sales pitch. Just clear expectations so you can plan with confidence.
            </p>
            <button
                onClick={() => setStep('questions')}
                className="bg-slate-900 text-white font-bold py-4 px-8 rounded-full text-lg shadow-xl shadow-slate-900/20 hover:scale-105 transition-transform flex items-center justify-center gap-2 mx-auto"
            >
                Create My Timeline <ArrowRight size={20} />
            </button>
        </div>
    );

    const renderQuestionnaire = () => {
        const questions = [
            {
                // Q1: City
                icon: MapPin,
                question: "Where are you planning to build?",
                helper: "Every area has different planning and approval timelines.",
                input: (
                    <div className="relative w-full max-w-md mx-auto">
                        <input
                            autoFocus
                            value={city}
                            onChange={e => { setCity(e.target.value); setIsCityValid(false); }}
                            placeholder="City, State"
                            className={`w-full text-2xl font-serif border-b-2 py-2 bg-transparent text-center focus:outline-none ${isCityValid ? 'border-green-500 text-green-700' : 'border-zinc-200 focus:border-purple-600'}`}
                        />
                        {/* Suggestions Dropdown */}
                        {showSuggestions && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-zinc-200 rounded-xl shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto">
                                {suggestions.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => selectCity(s)}
                                        className="w-full text-left px-4 py-3 text-sm text-zinc-600 hover:bg-purple-50 hover:text-purple-900 transition-colors border-b border-zinc-100 last:border-0"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}
                        {!isCityValid && city.length > 2 && !showSuggestions && (
                            <div className="text-xs text-amber-600 mt-2">Please select a city from the list</div>
                        )}
                    </div>
                ),
                isValid: isCityValid
            },
            {
                // Q2: Land
                icon: MapPin, // Reuse or find better
                question: "Do you already own land?",
                helper: "Land ownership can impact when design and construction can begin.",
                input: (
                    <div className="grid gap-3 w-full max-w-md mx-auto">
                        {['Yes', 'Not yet', 'In process'].map(opt => (
                            <button key={opt} onClick={() => { setLandStatus(opt as any); handleNextQuestion(); }} className="p-4 rounded-xl border border-zinc-200 hover:border-purple-600 hover:bg-purple-50 transition-all font-medium text-left bg-white">
                                {opt}
                            </button>
                        ))}
                    </div>
                ),
                isValid: true
            },
            {
                // Q3: Finance
                icon: PiggyBank,
                question: "How are you planning to finance the build?",
                helper: "This just helps us estimate preparation time. Nothing is locked in.",
                input: (
                    <div className="grid gap-3 w-full max-w-md mx-auto">
                        {['Cash', 'Pre-approved with lender', 'Still exploring options'].map(opt => (
                            <button key={opt} onClick={() => { setFinancing(opt); handleNextQuestion(); }} className="p-4 rounded-xl border border-zinc-200 hover:border-purple-600 hover:bg-purple-50 transition-all font-medium text-left bg-white">
                                {opt}
                            </button>
                        ))}
                    </div>
                ),
                isValid: true
            },
            {
                // Q4: Design
                icon: PenTool,
                question: "Where are you in the design process?",
                helper: "Design is one of the most important early steps and timelines vary.",
                input: (
                    <div className="grid gap-3 w-full max-w-md mx-auto">
                        {['Complete', 'In progress', 'Not started'].map(opt => (
                            <button key={opt} onClick={() => { setDesignStatus(opt as any); handleNextQuestion(); }} className="p-4 rounded-xl border border-zinc-200 hover:border-purple-600 hover:bg-purple-50 transition-all font-medium text-left bg-white">
                                {opt}
                            </button>
                        ))}
                    </div>
                ),
                isValid: true
            },
            {
                // Q5: Date (Updated to Choice)
                icon: CalendarIcon,
                question: "When would you like to move in?",
                helper: "This does not need to be exact. Just your current goal.",
                input: (
                    <div className="grid gap-3 w-full max-w-md mx-auto">
                        {['In the next 6 months', 'In the next year', 'In the next 2 years', "I'm just researching"].map(opt => (
                            <button key={opt} onClick={() => { setMoveInGoal(opt); handleNextQuestion(); }} className="p-4 rounded-xl border border-zinc-200 hover:border-purple-600 hover:bg-purple-50 transition-all font-medium text-left bg-white">
                                {opt}
                            </button>
                        ))}
                    </div>
                ),
                isValid: true
            }
        ];

        const currentQ = questions[questionIdx];
        const Icon = currentQ.icon;

        return (
            <div className="max-w-xl mx-auto pt-12 animate-fadeIn relative">
                {/* Back Button */}
                <button
                    onClick={handleBackQuestion}
                    className="absolute top-12 -left-12 md:-left-24 p-2 text-zinc-400 hover:text-slate-900 transition-colors hidden md:block"
                >
                    <ArrowLeft size={24} />
                </button>
                {/* Mobile Back */}
                <button
                    onClick={handleBackQuestion}
                    className="mb-6 flex items-center gap-2 text-zinc-400 text-sm md:hidden"
                >
                    <ArrowLeft size={16} /> Back
                </button>


                {/* Progress */}
                <div className="flex gap-1 mb-8">
                    {questions.map((_, i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-colors duration-500 ${i <= questionIdx ? 'bg-purple-600' : 'bg-zinc-100'}`} />
                    ))}
                </div>

                <div className="text-center space-y-6">
                    <div className="size-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto">
                        <Icon size={32} />
                    </div>

                    <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900">
                        {currentQ.question}
                    </h2>

                    <div className="py-6">
                        {currentQ.input}
                    </div>

                    <p className="text-zinc-400 text-sm">
                        {currentQ.helper}
                    </p>
                </div>
            </div>
        );
    };

    const renderGate = () => (
        <div className="max-w-xl mx-auto pt-12 animate-fadeIn text-center relative">
            <button
                onClick={() => setStep('questions')}
                className="absolute top-12 -left-24 p-2 text-zinc-400 hover:text-slate-900 transition-colors hidden md:block"
            >
                <ArrowLeft size={24} />
            </button>

            <div className="size-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} />
            </div>
            <h2 className="text-3xl font-serif font-bold text-slate-900 mb-2">Your Personalized Timeline Is Ready 🎉</h2>
            <p className="text-zinc-500 mb-8">
                We have built a custom roadmap based on your answers.<br />
                Enter your details to view your estimated move-in window.
            </p>

            <form onSubmit={handleGateSubmit} className="space-y-4 max-w-md mx-auto bg-white p-6 rounded-2xl border border-zinc-100 shadow-xl shadow-slate-200/50">
                <input required value={name} onChange={e => setName(e.target.value)} placeholder="First Name" className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-zinc-50" />
                <input required value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Email Address" className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-zinc-50" />
                <input required value={phone} onChange={e => setPhone(e.target.value)} type="tel" placeholder="Phone Number" className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-zinc-50" />

                <button disabled={isSubmitting} type="submit" className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-lg">
                    {isSubmitting ? <Loader2 className="animate-spin" /> : 'View My Timeline'}
                </button>
                <div className="flex items-center justify-center gap-2 text-xs text-zinc-400 pt-2">
                    <ShieldCheck size={12} /> We respect your inbox. No spam. No pressure.
                </div>
            </form>
        </div>
    );

    const renderAnalyzing = () => (
        <div className="max-w-xl mx-auto pt-24 animate-fadeIn text-center flex flex-col items-center">
            <div className="relative mb-8">
                <div className="size-24 rounded-full border-4 border-zinc-100 border-t-purple-600 animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="animate-pulse text-purple-600" size={32} />
                </div>
            </div>
            <h2 className="text-2xl font-serif font-bold text-slate-900 animate-pulse transition-all duration-300">
                {loadingMessage}
            </h2>
            <p className="text-zinc-400 mt-2 text-sm">Please wait while we generate your report...</p>
        </div>
    );

    const renderResults = () => {
        if (!result) return null;

        return (
            <div className="max-w-4xl mx-auto animate-fadeIn pb-32">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-serif text-slate-900 mb-4">Your Custom Home Timeline</h1>
                    <p className="text-zinc-500 max-w-2xl mx-auto">
                        Based on what you shared, here is a realistic overview of how your build journey may unfold.
                    </p>
                </div>

                {/* Timeline Visual */}
                <div className="relative border-l-2 border-dashed border-zinc-300 ml-4 md:ml-8 space-y-12 py-4 mb-16">
                    {result.phases.map((phase, idx) => (
                        <div key={idx} className="relative pl-8 md:pl-12 group">
                            {/* Dot */}
                            <div className={`absolute -left-[9px] top-6 w-4 h-4 rounded-full border-4 border-white shadow-sm ${phase.color} z-10 box-content ring-1 ring-zinc-200`}></div>

                            <div className="flex flex-col md:flex-row gap-6 items-start">
                                <div className="bg-white border border-zinc-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex-1 w-full">
                                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-1">Estimated: {formatDate(phase.startDate)} - {formatDate(phase.endDate)}</span>
                                    <h4 className="text-lg font-bold text-slate-900 mb-2">{phase.name}</h4>
                                    <p className="text-zinc-600 text-sm leading-relaxed">{phase.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Final Result Box */}
                <div className="bg-slate-900 text-white p-8 md:p-12 rounded-3xl text-center shadow-2xl relative overflow-hidden mb-16">
                    <div className="relative z-10">
                        <span className="text-purple-300 font-bold uppercase tracking-widest text-sm">Estimated Move-In Window</span>
                        <div className="text-4xl md:text-6xl font-serif font-bold mt-4 mb-4">
                            {formatDate(result.moveInDate).split(' ')[0]} - {formatDate(new Date(result.moveInDate.getTime() + 1000 * 60 * 60 * 24 * 60)).split(' ')[0]} {formatDate(result.moveInDate).split(' ')[1]}
                        </div>
                        <div className="bg-white/10 inline-block px-4 py-2 rounded-lg text-sm text-white/80">
                            Based on a {result.totalMonths}-month build cycle
                        </div>
                    </div>
                </div>

                {/* Context Box */}
                <div className="bg-yellow-50 border border-yellow-100 p-6 rounded-2xl text-yellow-800 text-sm leading-relaxed mb-16 max-w-2xl mx-auto text-center">
                    <strong>Note:</strong> Every custom home is unique. Timelines can move faster or slower depending on decisions, availability, and local factors. This roadmap is designed to help you plan with clarity, not pressure.
                </div>

                {/* Soft CTA */}
                <div className="text-center space-y-6 border-t border-zinc-200 pt-16">
                    <h2 className="text-3xl font-serif text-slate-900">Want Help Turning This Plan Into Reality?</h2>
                    <p className="text-zinc-500 max-w-md mx-auto">
                        If you would like to talk through your timeline, budget, or next steps, our team would be happy to help. A short conversation can often save months of uncertainty.
                    </p>
                    <a
                        href={`tel:${client.phoneNumber || ''}`}
                        className="inline-flex items-center gap-2 bg-white text-slate-900 border-2 border-slate-900 font-bold py-4 px-8 rounded-full hover:bg-slate-50 transition-colors"
                    >
                        Schedule a Free Planning Call <ArrowRight size={20} />
                    </a>
                </div>

            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <div className="p-6 md:p-12">
                {step === 'welcome' && renderWelcome()}
                {step === 'questions' && renderQuestionnaire()}
                {step === 'gate' && renderGate()}
                {step === 'analyzing' && renderAnalyzing()}
                {step === 'results' && renderResults()}
            </div>
        </div>
    );
};
