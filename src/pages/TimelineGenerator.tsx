import React, { useState } from 'react';
import { type ClientConfig } from '../config/clients';
import { calculateAdjustedTimeline, formatDate, type TimelineResult, type TimelineInputs } from '../services/TimelineLogic';
import { CheckCircle2, ArrowRight, Loader2, ShieldCheck, MapPin, Calendar as CalendarIcon, PiggyBank, PenTool } from 'lucide-react';

interface TimelineGeneratorProps {
    client: ClientConfig;
}

type Step = 'welcome' | 'questions' | 'gate' | 'results';

export const TimelineGenerator: React.FC<TimelineGeneratorProps> = ({ client }) => {
    // Wizard State
    const [step, setStep] = useState<Step>('welcome');
    const [questionIdx, setQuestionIdx] = useState(0); // 0 to 4 in questions step

    // Input State
    const [city, setCity] = useState('');
    const [landStatus, setLandStatus] = useState<TimelineInputs['landStatus']>('Not yet');
    const [financing, setFinancing] = useState('Still exploring options');
    const [designStatus, setDesignStatus] = useState<TimelineInputs['designStatus']>('Not started');
    const [targetDate, setTargetDate] = useState(''); // Just a string for now, informational

    // Contact State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Result State
    const [result, setResult] = useState<TimelineResult | null>(null);

    // --- Actions ---

    const handleNextQuestion = () => {
        if (questionIdx < 4) {
            setQuestionIdx(prev => prev + 1);
        } else {
            setStep('gate');
        }
    };

    const handleGateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Calculate Result
        const timelineResult = calculateAdjustedTimeline({
            landStatus,
            designStatus
        });
        setResult(timelineResult);

        // Payload
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
                targetMoveIn: targetDate,
                calculatedMoveIn: formatDate(timelineResult.moveInDate),
                totalMonths: timelineResult.totalMonths
            },
            sales_note: `User wants to move in by ${targetDate || 'Unknown'}. Calculated date is ${formatDate(timelineResult.moveInDate)}. Logic: Land=${landStatus}, Design=${designStatus}.`
        };

        // Fire webhook
        try {
            if (client.webhookUrl) {
                await fetch(client.webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
            setStep('results');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };


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
        // Defining Questions Array for cleaner render logic
        const questions = [
            {
                // Q1
                icon: MapPin,
                question: "Where are you planning to build?",
                helper: "Every area has different planning and approval timelines.",
                input: (
                    <input
                        autoFocus
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        placeholder="City, State"
                        className="w-full text-2xl font-serif border-b-2 border-zinc-200 focus:border-purple-600 focus:outline-none py-2 bg-transparent text-center"
                        onKeyDown={e => e.key === 'Enter' && city.length > 2 && handleNextQuestion()}
                    />
                ),
                isValid: city.length > 2
            },
            {
                // Q2
                icon: MapPin, // Reuse or find better
                question: "Do you already own land?",
                helper: "Land ownership can impact when design and construction can begin.",
                input: (
                    <div className="grid gap-3 w-full max-w-md mx-auto">
                        {['Yes', 'Not yet', 'In process'].map(opt => (
                            <button key={opt} onClick={() => { setLandStatus(opt as any); handleNextQuestion(); }} className="p-4 rounded-xl border border-zinc-200 hover:border-purple-600 hover:bg-purple-50 transition-all font-medium text-left">
                                {opt}
                            </button>
                        ))}
                    </div>
                ),
                isValid: true
            },
            {
                // Q3
                icon: PiggyBank,
                question: "How are you planning to finance the build?",
                helper: "This just helps us estimate preparation time. Nothing is locked in.",
                input: (
                    <div className="grid gap-3 w-full max-w-md mx-auto">
                        {['Cash', 'Pre-approved with lender', 'Still exploring options'].map(opt => (
                            <button key={opt} onClick={() => { setFinancing(opt); handleNextQuestion(); }} className="p-4 rounded-xl border border-zinc-200 hover:border-purple-600 hover:bg-purple-50 transition-all font-medium text-left">
                                {opt}
                            </button>
                        ))}
                    </div>
                ),
                isValid: true
            },
            {
                // Q4
                icon: PenTool,
                question: "Where are you in the design process?",
                helper: "Design is one of the most important early steps and timelines vary.",
                input: (
                    <div className="grid gap-3 w-full max-w-md mx-auto">
                        {['Complete', 'In progress', 'Not started'].map(opt => (
                            <button key={opt} onClick={() => { setDesignStatus(opt as any); handleNextQuestion(); }} className="p-4 rounded-xl border border-zinc-200 hover:border-purple-600 hover:bg-purple-50 transition-all font-medium text-left">
                                {opt}
                            </button>
                        ))}
                    </div>
                ),
                isValid: true
            },
            {
                // Q5
                icon: CalendarIcon,
                question: "When would you like to move in?",
                helper: "This does not need to be exact. Just your current goal.",
                input: (
                    <div className="w-full max-w-xs mx-auto">
                        <input
                            type="month"
                            autoFocus
                            value={targetDate}
                            onChange={e => setTargetDate(e.target.value)}
                            className="w-full text-xl p-3 border border-zinc-200 rounded-xl focus:border-purple-600 focus:outline-none bg-white"
                        />
                        <button
                            disabled={!targetDate}
                            onClick={handleNextQuestion}
                            className="w-full mt-4 bg-slate-900 text-white font-bold py-3 rounded-xl disabled:opacity-50"
                        >
                            Next <ArrowRight size={16} className="inline ml-1" />
                        </button>
                    </div>
                ),
                isValid: true
            }
        ];

        const currentQ = questions[questionIdx];
        const Icon = currentQ.icon;

        return (
            <div className="max-w-xl mx-auto pt-12 animate-fadeIn">
                {/* Progress */}
                <div className="flex gap-1 mb-8">
                    {questions.map((_, i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full ${i <= questionIdx ? 'bg-purple-600' : 'bg-zinc-100'}`} />
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

                    {/* Navigation for Text Input (City) */}
                    {questionIdx === 0 && (
                        <button
                            disabled={!currentQ.isValid}
                            onClick={handleNextQuestion}
                            className={`mt-4 text-purple-600 font-bold hover:underline ${!currentQ.isValid ? 'opacity-0' : 'opacity-100'}`}
                        >
                            Confirm location <ArrowRight size={16} className="inline" />
                        </button>
                    )}
                </div>
            </div>
        );
    };

    const renderGate = () => (
        <div className="max-w-xl mx-auto pt-12 animate-fadeIn text-center">
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
                {step === 'results' && renderResults()}
            </div>
        </div>
    );
};
