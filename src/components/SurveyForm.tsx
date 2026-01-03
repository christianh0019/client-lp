import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Check, AlertCircle, Building2, Wallet, PieChart, User, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SurveyForm: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [disqualified, setDisqualified] = useState(false);
    const [formData, setFormData] = useState({
        role: '',
        revenue: '',
        marketingSpend: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        companyName: '',
        website: ''
    });

    const [loading, setLoading] = useState(false);

    const handleRoleSelect = (role: string) => {
        if (role === 'disqualified') {
            setDisqualified(true);
        } else {
            setFormData({ ...formData, role });
            setStep(2);
        }
    };

    const handleSelection = (field: string, value: string) => {
        setFormData({ ...formData, [field]: value });
        setStep(prev => prev + 1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // We still fire the webhook to capture the lead
            await fetch('https://services.leadconnectorhq.com/hooks/HllUVzV8V6VFH4nUuq4W/webhook-trigger/fad0a645-e084-4b96-8216-6e72e76b8f98', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            }).catch(err => console.error("Webhook error (ignoring to proceed):", err));

            // Regardless of webhook success (or CORS failure), we proceed to the calculator
            // This ensures a smooth user experience even if the backend is flaky
            navigate('/calculator');

        } catch (error) {
            console.error('Error submitting form:', error);
            // Fallback: Proceed anyway
            navigate('/calculator');
        } finally {
            setLoading(false);
        }
    };

    const goBack = () => {
        if (disqualified) {
            setDisqualified(false);
            setStep(1);
        } else {
            setStep(prev => Math.max(1, prev - 1));
        }
    };

    if (disqualified) {
        return (
            <div className="w-full bg-white p-10 rounded-3xl shadow-xl text-center border border-slate-100 max-w-2xl mx-auto">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                    <AlertCircle size={32} />
                </div>
                <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4">We might not be the best fit.</h2>
                <p className="text-slate-600 mb-8">
                    We specialize exclusively in helping Custom Home Builders, Remodelers, and Design-Build Firms scale. Based on your selection, our services might not align with your current needs.
                </p>
                <button
                    onClick={goBack}
                    className="text-slate-500 hover:text-slate-900 font-bold underline"
                >
                    Wait, I selected the wrong option
                </button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-10">
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-purple-700 to-pink-600 transition-all duration-500 ease-out"
                        style={{ width: `${(step / 4) * 100}%` }}
                    ></div>
                </div>
                <div className="mt-4 flex justify-between items-center text-sm font-medium text-slate-500">
                    <span>Step {step} of 4</span>
                    {step > 1 && (
                        <button onClick={goBack} className="flex items-center gap-1 hover:text-slate-900 transition-colors">
                            <ArrowLeft size={16} /> Back
                        </button>
                    )}
                </div>
            </div>

            {/* Step 1: Role */}
            {step === 1 && (
                <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-slate-100 animate-fadeIn">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-purple-100/50 rounded-xl text-purple-700">
                            <Building2 size={28} />
                        </div>
                        <h1 className="text-3xl font-serif font-bold text-slate-900">What best describes your business?</h1>
                    </div>

                    <div className="space-y-4">
                        {['Custom Home Builder', 'Remodeler', 'Design-Build Firm'].map((option) => (
                            <button
                                key={option}
                                onClick={() => handleRoleSelect(option)}
                                className="w-full text-left p-6 rounded-2xl border-2 border-slate-100 hover:border-purple-500 hover:bg-purple-50/30 transition-all duration-200 group flex justify-between items-center"
                            >
                                <span className="text-lg font-semibold text-slate-700 group-hover:text-purple-900">{option}</span>
                                <ArrowRight className="text-slate-300 group-hover:text-purple-500 transition-colors" size={20} />
                            </button>
                        ))}
                        <button
                            onClick={() => handleRoleSelect('disqualified')}
                            className="w-full text-left p-6 rounded-2xl border-2 border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 text-slate-500 hover:text-slate-700"
                        >
                            I don't belong here
                        </button>
                    </div>
                </div>
            )}

            {/* Step 2: Revenue */}
            {step === 2 && (
                <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-slate-100 animate-fadeIn">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-blue-100/50 rounded-xl text-blue-700">
                            <Wallet size={28} />
                        </div>
                        <h2 className="text-3xl font-serif font-bold text-slate-900">What is your current yearly revenue?</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {["I'm just starting", "$100k - $500k", "$500k - $1M", "$1M - $3M", "$3M - $10M", "$10M+"].map((option) => (
                            <button
                                key={option}
                                onClick={() => handleSelection('revenue', option)}
                                className="p-6 rounded-2xl border-2 border-slate-100 hover:border-purple-500 hover:bg-purple-50/30 transition-all duration-200 text-left font-semibold text-slate-700 hover:text-purple-900"
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Step 3: Marketing Spend */}
            {step === 3 && (
                <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-slate-100 animate-fadeIn">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-green-100/50 rounded-xl text-green-700">
                            <PieChart size={28} />
                        </div>
                        <h2 className="text-3xl font-serif font-bold text-slate-900">Current monthly marketing investment?</h2>
                    </div>
                    <div className="space-y-4">
                        {["We only work on referrals", "< $1,000", "$1,000 - $3,000", "$3,000 - $5,000", "$5,000+"].map((option) => (
                            <button
                                key={option}
                                onClick={() => handleSelection('marketingSpend', option)}
                                className="w-full text-left p-6 rounded-2xl border-2 border-slate-100 hover:border-purple-500 hover:bg-purple-50/30 transition-all duration-200 group flex justify-between items-center"
                            >
                                <span className="text-lg font-semibold text-slate-700 group-hover:text-purple-900">{option}</span>
                                <div className={`w-6 h-6 rounded-full border-2 ${formData.marketingSpend === option ? 'border-purple-500 bg-purple-500' : 'border-slate-200'} flex items-center justify-center`}>
                                    {formData.marketingSpend === option && <Check size={14} className="text-white" />}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Step 4: Contact Details */}
            {step === 4 && (
                <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-slate-100 animate-fadeIn">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-pink-100/50 rounded-xl text-pink-700">
                            <User size={28} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-serif font-bold text-slate-900">Last step.</h2>
                            <p className="text-slate-600">Where do we send the calculator?</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">First Name</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 bg-white"
                                    placeholder="John"
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Last Name</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 bg-white"
                                    placeholder="Doe"
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                            <input
                                required
                                type="email"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 bg-white"
                                placeholder="john@example.com"
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
                            <input
                                required
                                type="tel"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 bg-white"
                                placeholder="(555) 123-4567"
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Company Name</label>
                            <input
                                required
                                type="text"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 bg-white"
                                placeholder="Doe Construction"
                                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Website URL</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 bg-white"
                                placeholder="https://... (Optional)"
                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-gradient-to-r hover:from-purple-700 hover:to-pink-600 transition-all duration-300 shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Submitting...
                                </>
                            ) : (
                                "Calculate My Budget"
                            )}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default SurveyForm;
