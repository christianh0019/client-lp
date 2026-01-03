import React, { useState, useEffect } from 'react';
import { LocationCostService, type MarketData } from '../services/LocationCostService';
import { calculateBudgetBreakdown, getFeasibilityStatus as checkFeasibility } from '../services/BudgetLogic';
import { MapPin, CheckCircle, AlertTriangle, ArrowRight, Layers, DollarSign, Loader2, X, Lock, HelpCircle, Clock } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { ARTICLES, type Article } from '../data/knowledgeBaseData';

import { ReportGenerator, type GeneratedReport } from '../services/ReportGenerator';

export const BudgetCalculator: React.FC = () => {
    // Local State (replaced Contexts)
    const [totalBudget, setTotalBudget] = useState(1500000);
    const [landCost, setLandCost] = useState(300000);
    const [targetSqFt, setTargetSqFt] = useState(3000);

    // Soft Cost States
    const [hasPlans, setHasPlans] = useState(false);
    const [hasEngineering, setHasEngineering] = useState(false);
    const [hasUtilities, setHasUtilities] = useState(false);
    const [hasLand, setHasLand] = useState<boolean | null>(null);
    const [city, setCity] = useState('');
    const [marketData, setMarketData] = useState<MarketData | null>(null);

    // Contact State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    // UI State
    const [isLoadingMarket, setIsLoadingMarket] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isCalculated, setIsCalculated] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [validationError, setValidationError] = useState('');
    const [modalError, setModalError] = useState('');

    // Report State
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [generatedReport, setGeneratedReport] = useState<GeneratedReport | null>(null);
    const [showBooking, setShowBooking] = useState(false);

    // Educational Modal State
    const [viewingArticle, setViewingArticle] = useState<Article | null>(null);

    // Calculate Breakdown
    const breakdown = calculateBudgetBreakdown(totalBudget, hasLand === false ? landCost : 0, targetSqFt, { hasPlans, hasEngineering, hasUtilities });

    // Calculate Feasibility
    const feasibility = breakdown.hardCostPerSqFt > 0 && marketData
        ? checkFeasibility(breakdown.hardCostPerSqFt, marketData.low, marketData.high)
        : null;

    const handleRunMarketResearch = async () => {
        setIsLoadingMarket(true);
        setShowSuggestions(false);
        if (city) {
            const data = await LocationCostService.getMarketData(city);
            if (data) {
                setMarketData(data);
            }
        }
        setIsLoadingMarket(false);
    };

    const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCity(e.target.value);
        setIsCalculated(false);
        setGeneratedReport(null); // Reset report on change
        setShowBooking(false);
    };

    const handleCalculateClick = () => {
        // 1. Initial Validation (Just City)
        if (!city || city.length < 3) {
            setValidationError('Please enter a valid city to get accurate market data.');
            return;
        }

        if (!marketData) {
            handleRunMarketResearch();
        }

        setValidationError('');

        // 2. Open Modal for Lead Capture
        setShowModal(true);
    };

    const handleModalSubmit = () => {
        // 3. Final Validation (Contact Info)
        if (!name || !email || !phone) {
            setModalError('Please fill in all fields.');
            return;
        }
        if (!agreedToTerms) {
            setModalError('Please agree to receive communication to proceed.');
            return;
        }

        setModalError('');

        // 4. Reveal Results & Trigger Analysis
        setIsCalculated(true);
        setShowModal(false);
        setIsAnalyzing(true);
        setGeneratedReport(null);
        setShowBooking(false);

        // Simulate AI Analysis Delay
        setTimeout(() => {
            const report = ReportGenerator.generate({
                breakdown,
                feasibility,
                inputs: {
                    hasLand,
                    hasPlans,
                    hasEngineering,
                    city,
                    name,
                    targetSqFt
                }
            });
            setGeneratedReport(report);
            setIsAnalyzing(false);
        }, 2500);

        // Data Capture
        console.log("CAPTURED LEAD DATA:", {
            contact: { name, email, phone, agreedToTerms },
            project: {
                city,
                totalBudget,
                landOwned: hasLand,
                landCost: !hasLand ? landCost : 0,
                targetSqFt,

                softCosts: { hasPlans, hasEngineering, hasUtilities }
            }
        });

        // Scroll to results
        setTimeout(() => {
            document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }

    // Debounced Autocomplete
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (city && city.length >= 2) {
                const matches = await LocationCostService.searchCities(city);
                setSuggestions(matches);
                setShowSuggestions(matches.length > 0);
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [city]);

    const selectCity = async (selectedCity: string) => {
        setCity(selectedCity);
        setSuggestions([]);
        setShowSuggestions(false);
        setIsCalculated(false);

        // Auto-fetch market data on selection
        setIsLoadingMarket(true);
        const data = await LocationCostService.getMarketData(selectedCity);
        if (data) {
            setMarketData(data);
        }
        setIsLoadingMarket(false);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full text-zinc-900 pb-32 relative">

            {/* Article Modal Overlay */}
            <AnimatePresence>
                {viewingArticle && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-8">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={() => setViewingArticle(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white border border-zinc-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl relative z-60 shadow-2xl flex flex-col"
                        >
                            <div className={`h-32 bg-gradient-to-r ${viewingArticle.gradient} shrink-0 relative flex items-center px-8`}>
                                <button
                                    onClick={() => setViewingArticle(null)}
                                    className="absolute top-4 right-4 p-2 bg-black/10 rounded-full hover:bg-black/20 text-white transition-colors"
                                >
                                    <X size={18} />
                                </button>
                                <viewingArticle.icon size={64} className="text-white/20 absolute right-8" />
                                <div>
                                    <span className="text-[10px] uppercase tracking-widest text-white/90 bg-black/10 px-2 py-1 rounded-full mb-2 inline-block leading-none">
                                        {viewingArticle.category}
                                    </span>
                                    <h2 className="text-2xl font-serif text-white">{viewingArticle.title}</h2>
                                </div>
                            </div>
                            <div className="p-8">
                                <div className="flex items-center gap-2 text-xs text-zinc-400 mb-6 uppercase tracking-widest">
                                    <Clock size={12} /> {viewingArticle.readTime}
                                </div>
                                <div className="prose prose-zinc prose-sm text-zinc-600">
                                    {viewingArticle.content}
                                </div>
                                <button
                                    onClick={() => setViewingArticle(null)}
                                    className="mt-8 w-full py-3 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 rounded-xl text-sm font-medium transition-colors text-zinc-900"
                                >
                                    Close Guide
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6 animate-fadeIn">
                <div className="space-y-4 max-w-2xl">
                    <h2 className="text-4xl md:text-5xl font-serif tracking-tighter text-slate-900 leading-tight">
                        Will Your Budget Actually Build Your Dream Home?
                    </h2>
                    <p className="text-zinc-500 text-lg leading-relaxed">
                        In just 30 seconds, you'll find out what you can afford to build and exactly what to do next (it's completely free) 😊🏡
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                {/* LEFT COLUMN: Inputs */}
                <div className="lg:col-span-5 space-y-8 animate-fadeIn" style={{ animationDelay: '0.1s' }}>

                    {/* 1. Market Research */}
                    <div className="bg-white border border-zinc-200 rounded-2xl p-6 relative shadow-sm">

                        <div className="flex items-center gap-3 mb-4">
                            <div className="size-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                                <MapPin size={16} />
                            </div>
                            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900">Where are you building?</h3>
                        </div>

                        <div className="flex gap-2 mb-4 relative">
                            <div className="relative w-full">
                                <input
                                    placeholder="Enter City, State..."
                                    value={city}
                                    onChange={handleCityChange}
                                    className={`bg-transparent border-b py-2 focus:outline-none text-zinc-900 placeholder:text-zinc-400 w-full font-serif text-lg ${validationError ? 'border-red-500' : 'border-zinc-200 focus:border-purple-500'}`}
                                />
                                {showSuggestions && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-zinc-200 rounded-xl shadow-2xl z-50 overflow-hidden">
                                        {suggestions.map((s) => (
                                            <button
                                                key={s}
                                                onClick={() => selectCity(s)}
                                                className="w-full text-left px-4 py-3 text-sm text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors border-b border-zinc-100 last:border-0"
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {/* Loading Indicator (replaces button) */}
                            {isLoadingMarket && (
                                <div className="absolute right-0 top-2 flex items-center justify-center pointer-events-none">
                                    <Loader2 size={16} className="animate-spin text-zinc-400" />
                                </div>
                            )}
                        </div>

                        {validationError && (
                            <p className="text-xs text-red-500 mb-2 flex items-center gap-1">
                                <AlertTriangle size={12} /> {validationError}
                            </p>
                        )}

                        <AnimatePresence mode="wait">
                            {marketData ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100"
                                >
                                    <p className="text-xs text-zinc-600 leading-relaxed">
                                        <span className="text-blue-600 font-bold">AI Insight:</span> {marketData.description}
                                    </p>
                                    <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-200">
                                        <span className="text-zinc-500">Typical Range:</span>
                                        <span className="font-mono text-zinc-800 font-bold">${marketData.low} - ${marketData.high} / sqft</span>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="text-xs text-zinc-500 italic pl-1">Enter your location to get local cost data...</div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* 2. Project Inputs */}
                    <div className="space-y-8">
                        {/* Total Budget */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <label className="text-xs uppercase tracking-widest text-zinc-500">Total Investment Cap</label>
                                    <button onClick={() => setViewingArticle(ARTICLES.find(a => a.id === 13) || null)} className="text-blue-400/80 hover:text-blue-500 transition-colors p-1 hover:bg-zinc-100 rounded-full">
                                        <HelpCircle size={14} />
                                    </button>
                                </div>
                                <span className="text-xl font-serif text-zinc-900 font-bold">{formatCurrency(totalBudget)}</span>
                            </div>
                            <input
                                type="range"
                                min={300000} max={5000000} step={10000}
                                value={totalBudget}
                                onChange={(e) => { setTotalBudget(Number(e.target.value)); setIsCalculated(false); }}
                                className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
                            />
                        </div>

                        {/* Land Logic */}
                        <div className="bg-white border border-zinc-200 rounded-xl p-4 space-y-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Layers size={14} className="text-zinc-500" />
                                    <span className="text-xs uppercase tracking-widest text-zinc-900">Land Status</span>
                                    <button onClick={() => setViewingArticle(ARTICLES.find(a => a.id === 10) || null)} className="text-blue-400/80 hover:text-blue-500 transition-colors p-1 hover:bg-zinc-100 rounded-full">
                                        <HelpCircle size={14} />
                                    </button>
                                </div>
                                <div className="flex gap-2 mb-4 bg-zinc-100 p-1 rounded-lg w-fit">
                                    <button onClick={() => { setHasLand(true); setIsCalculated(false); }} className={`px-3 py-1.5 text-xs rounded-md transition-all ${hasLand === true ? 'bg-white text-zinc-900 shadow-sm font-bold' : 'text-zinc-500 hover:text-zinc-900'}`}>
                                        I have land
                                    </button>
                                    <button onClick={() => { setHasLand(false); setIsCalculated(false); }} className={`px-3 py-1.5 text-xs rounded-md transition-all ${hasLand === false ? 'bg-white text-zinc-900 shadow-sm font-bold' : 'text-zinc-500 hover:text-zinc-900'}`}>
                                        I need land
                                    </button>
                                </div>
                            </div>

                            <AnimatePresence>
                                {hasLand === false && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-zinc-500">Estimated Land Cost</span>
                                                <span className="font-mono text-zinc-900 font-bold">{formatCurrency(landCost)}</span>
                                            </div>
                                            <input
                                                type="range"
                                                min={0} max={1000000} step={5000}
                                                value={landCost}
                                                onChange={(e) => { setLandCost(Number(e.target.value)); setIsCalculated(false); }}
                                                className="w-full h-2 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-slate-600"
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Soft Cost Logic */}
                        <div className="bg-white border border-zinc-200 rounded-xl p-4 space-y-4 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs uppercase tracking-widest text-zinc-900 font-bold">Soft Cost Breakdown</span>
                            </div>

                            {/* Question 1: Plans */}
                            <div className="flex justify-between items-center py-2 border-b border-zinc-100 last:border-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-zinc-600">Do You Have Design Plans?</span>
                                    <button onClick={() => setViewingArticle(ARTICLES.find(a => a.id === 14) || null)} className="text-blue-400/80 hover:text-blue-500 transition-colors p-1 hover:bg-zinc-100 rounded-full">
                                        <HelpCircle size={14} />
                                    </button>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => { setHasPlans(true); setIsCalculated(false); }} className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${hasPlans ? 'bg-slate-900 text-white' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'}`}>Yes</button>
                                    <button onClick={() => { setHasPlans(false); setIsCalculated(false); }} className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${!hasPlans ? 'bg-slate-900 text-white' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'}`}>No</button>
                                </div>
                            </div>

                            {/* Question 2: Engineering (Only if they have plans) */}
                            <AnimatePresence>
                                {hasPlans && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="flex justify-between items-center py-2 border-b border-zinc-100 last:border-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-zinc-600">Are your plans engineered?</span>
                                                <button onClick={() => setViewingArticle(ARTICLES.find(a => a.id === 15) || null)} className="text-blue-400/80 hover:text-blue-500 transition-colors p-1 hover:bg-zinc-100 rounded-full">
                                                    <HelpCircle size={14} />
                                                </button>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => { setHasEngineering(true); setIsCalculated(false); }} className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${hasEngineering ? 'bg-slate-900 text-white' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'}`}>Yes</button>
                                                <button onClick={() => { setHasEngineering(false); setIsCalculated(false); }} className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${!hasEngineering ? 'bg-slate-900 text-white' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'}`}>No</button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Question 3: Utilities */}
                            <AnimatePresence>
                                {hasLand !== null && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="flex justify-between items-center py-2 border-b border-zinc-100 last:border-0">
                                            <span className="text-xs text-zinc-600">
                                                {hasLand ? "Is the lot developed (utilities on site)?" : "Are you buying land that is developed?"}
                                            </span>
                                            <div className="flex gap-2">
                                                <button onClick={() => { setHasUtilities(true); setIsCalculated(false); }} className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${hasUtilities ? 'bg-slate-900 text-white' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'}`}>Yes</button>
                                                <button onClick={() => { setHasUtilities(false); setIsCalculated(false); }} className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${!hasUtilities ? 'bg-slate-900 text-white' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'}`}>No</button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Size Slider */}
                        <div className="space-y-4 pt-6 border-t border-zinc-100">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <label className="text-xs uppercase tracking-widest text-zinc-500">Target Home Size</label>
                                    <button onClick={() => setViewingArticle(ARTICLES.find(a => a.id === 12) || null)} className="text-blue-400/80 hover:text-blue-500 transition-colors p-1 hover:bg-zinc-100 rounded-full">
                                        <HelpCircle size={14} />
                                    </button>
                                </div>
                                <span className="text-xl font-serif text-zinc-900 font-bold">{targetSqFt.toLocaleString()} sq ft</span>
                            </div>
                            <input
                                type="range"
                                min={1000} max={10000} step={50}
                                value={targetSqFt}
                                onChange={(e) => { setTargetSqFt(Number(e.target.value)); setIsCalculated(false); }}
                                className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
                            />
                            {/* Visualizer Helper */}
                            <div className="text-xs text-center text-zinc-500 bg-zinc-50 py-2 rounded-lg border border-zinc-100">
                                {targetSqFt < 2000 && "Comfortable 2-3 Bed, Small Lot"}
                                {targetSqFt >= 2000 && targetSqFt < 3000 && "Spacious Family Home, 3-4 Bed, Office"}
                                {targetSqFt >= 3000 && targetSqFt < 4500 && "Luxury Size, 4+ Bed, Rec Room, Large Garage"}
                                {targetSqFt >= 4500 && "Estate Size, Extensive Amenities"}
                            </div>
                        </div>

                        {/* CALCULATE BUTTON */}
                        <div className="pt-4">
                            <button
                                onClick={handleCalculateClick}
                                className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-gradient-to-r hover:from-slate-800 hover:to-slate-700 transition-all duration-300 shadow-lg shadow-slate-900/20 text-lg flex items-center justify-center gap-3"
                            >
                                <DollarSign size={20} />
                                Calculate My Budget Breakdown
                            </button>
                        </div>

                    </div>
                </div>

                {/* RIGHT COLUMN: The Breakdown & Reality Check */}
                <div id="results-section" className="lg:col-span-7 space-y-6 animate-fadeIn" style={{ animationDelay: '0.2s' }}>

                    {isCalculated ? (
                        <>
                            {/* The Waterfall Waterfall */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white rounded-3xl p-8 border border-zinc-200 shadow-xl shadow-slate-200/50"
                            >
                                <h3 className="text-lg font-serif text-zinc-900 mb-6">Where the money goes</h3>

                                <div className="space-y-1 relative">
                                    {/* Total Bar */}
                                    <div className="h-16 bg-zinc-50 rounded-xl flex items-center px-6 border border-zinc-200 justify-between relative z-30">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white rounded-lg border border-zinc-100"><DollarSign size={16} className="text-zinc-600" /></div>
                                            <span className="text-sm font-medium text-zinc-900">Total Budget</span>
                                        </div>
                                        <span className="text-lg font-bold">{formatCurrency(breakdown.totalBudget)}</span>
                                    </div>

                                    {/* Deductions Connector */}
                                    <div className="pl-10 ml-6 border-l-2 border-dashed border-zinc-200 space-y-4 py-4">
                                        <div className="flex justify-between items-center text-orange-500 px-4 bg-orange-50/50 py-1 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs uppercase tracking-widest">- Soft Costs ({(breakdown.softCostEstimate / breakdown.hardConstructionBudget * 100).toFixed(0)}%)</span>
                                            </div>
                                            <span className="font-mono text-sm font-bold">({formatCurrency(breakdown.softCostEstimate)})</span>
                                        </div>
                                        {!hasLand && (
                                            <div className="flex justify-between items-center text-red-500 px-4 bg-red-50/50 py-1 rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs uppercase tracking-widest">- Land Cost</span>
                                                </div>
                                                <span className="font-mono text-sm font-bold">({formatCurrency(breakdown.landCost)})</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Result: Hard Cost */}
                                    <motion.div
                                        layout
                                        className="h-24 bg-slate-900 text-white rounded-xl flex flex-col justify-center px-6 relative z-30 shadow-lg"
                                    >
                                        <span className="text-[10px] uppercase tracking-widest opacity-60 mb-1">Available for Construction (Hard Cost)</span>
                                        <div className="flex justify-between items-end">
                                            <span className="text-3xl font-bold tracking-tight">{formatCurrency(breakdown.hardConstructionBudget)}</span>
                                            <span className="text-xs font-mono opacity-60 bg-white/10 px-2 py-1 rounded-md">
                                                {((breakdown.hardConstructionBudget / breakdown.totalBudget) * 100).toFixed(0)}% of total
                                            </span>
                                        </div>
                                    </motion.div>
                                </div>
                            </motion.div>

                            {/* The Reality Check Gauge */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-white rounded-3xl p-8 border border-zinc-200 text-center relative overflow-hidden shadow-sm"
                            >
                                {feasibility && (
                                    <>
                                        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 opacity-30`} />

                                        {/* Dynamic Indicator */}
                                        <div className="mb-6 relative pointer-events-auto">
                                            <div className="flex items-center justify-center gap-2 mb-2">
                                                <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">Construction Power</span>
                                                <button onClick={() => setViewingArticle(ARTICLES.find(a => a.id === 11) || null)} className="text-blue-400/80 hover:text-blue-500 transition-colors p-1 hover:bg-zinc-100 rounded-full">
                                                    <HelpCircle size={16} />
                                                </button>
                                            </div>
                                            <h2 className={`text-6xl font-bold mt-2 ${feasibility.color} transition-colors duration-500`}>
                                                ${Math.round(breakdown.hardCostPerSqFt)}
                                                <span className="text-lg text-zinc-500 font-normal ml-2">/ per sqft</span>
                                            </h2>
                                        </div>

                                        <motion.div
                                            key={feasibility.status}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className={`inline-block px-6 py-3 rounded-xl border ${feasibility.status === 'Unrealistic' ? 'bg-red-50 border-red-200' : feasibility.status === 'Tight' ? 'bg-yellow-50 border-yellow-200' : 'bg-emerald-50 border-emerald-200'}`}
                                        >
                                            <div className="flex items-center gap-3 justify-center mb-1">
                                                {feasibility.status === 'Unrealistic' ? <AlertTriangle size={18} className={feasibility.color} /> : <CheckCircle size={18} className={feasibility.color} />}
                                                <span className={`text-sm font-bold uppercase tracking-widest ${feasibility.color}`}>
                                                    Status: {feasibility.status}
                                                </span>
                                            </div>
                                            <p className="text-xs text-zinc-600 max-w-sm mx-auto mt-2">
                                                {feasibility.message}
                                            </p>
                                        </motion.div>
                                    </>
                                )}

                                {!marketData && (
                                    <div className="py-12 flex flex-col items-center opacity-50">
                                        <div className="animate-pulse size-12 rounded-full bg-slate-100 mb-4" />
                                        <span className="text-sm font-serif italic text-zinc-500">Enter a city above to visualize feasibility...</span>
                                    </div>
                                )}
                            </motion.div>

                            {/* SMART REPORT GENERATOR */}
                            <AnimatePresence mode="wait">
                                {isAnalyzing ? (
                                    <motion.div
                                        key="analyzing"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="bg-white rounded-3xl p-8 border border-zinc-200 shadow-sm flex flex-col items-center justify-center min-h-[300px] text-center"
                                    >
                                        <Loader2 size={32} className="animate-spin text-slate-900 mb-4" />
                                        <h3 className="text-lg font-serif text-slate-900 mb-2">Analyzing your project via AI...</h3>
                                        <div className="text-sm text-zinc-500 flex flex-col gap-1 items-center">
                                            <span className="animate-pulse">Checking budget feasibility...</span>
                                            <span className="animate-pulse delay-75">Reviewing soft cost allocations...</span>
                                            <span className="animate-pulse delay-150">Generating personalized roadmap...</span>
                                        </div>
                                    </motion.div>
                                ) : generatedReport ? (
                                    <motion.div
                                        key="report"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-white rounded-3xl p-8 border border-zinc-200 shadow-xl relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
                                        <div className="flex items-center gap-2 mb-6">
                                            <div className="size-8 rounded-full bg-slate-100 flex items-center justify-center">
                                                <span className="text-lg">🤖</span>
                                            </div>
                                            <span className="text-xs font-bold uppercase tracking-widest text-slate-900">AI Project Analysis</span>
                                        </div>

                                        <h3 className="text-2xl font-serif text-slate-900 mb-4">{generatedReport.title}</h3>

                                        <div className="prose prose-zinc prose-sm text-zinc-600 mb-8 max-w-none">
                                            <p className="font-bold text-slate-900">{generatedReport.greeting}</p>
                                            {generatedReport.paragraphs.map((p, i) => (
                                                <p key={i}>{p}</p>
                                            ))}
                                        </div>

                                        <div className="space-y-4 mb-8">
                                            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Your Recommended Action Plan</h4>
                                            <div className="grid gap-3">
                                                {generatedReport.actionPlan.map((item, i) => (
                                                    <div key={i} className="flex gap-4 p-4 rounded-xl bg-zinc-50 border border-zinc-100">
                                                        <div className="size-6 shrink-0 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-xs font-bold text-slate-900 shadow-sm">
                                                            {i + 1}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-sm text-slate-900">{item.step}</div>
                                                            <div className="text-xs text-zinc-500">{item.description}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {!showBooking && (
                                            <>
                                                <div className="bg-blue-50/50 p-6 rounded-2xl mb-6">
                                                    <p className="text-sm text-zinc-700 leading-relaxed font-medium">
                                                        {generatedReport.closing}
                                                    </p>
                                                </div>

                                                <button
                                                    onClick={() => setShowBooking(true)}
                                                    className={`w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98] ${generatedReport.urgency === 'high'
                                                        ? 'bg-gradient-to-r from-orange-500 to-red-600 shadow-orange-500/30'
                                                        : 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/20'
                                                        }`}
                                                >
                                                    {generatedReport.cta.text} <ArrowRight size={18} />
                                                </button>
                                            </>
                                        )}
                                    </motion.div>
                                ) : null}
                            </AnimatePresence>

                            {/* Booking Widget (Outside Report Card) */}
                            <AnimatePresence>
                                {showBooking && generatedReport && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                        className="bg-white rounded-3xl border border-zinc-200 shadow-xl overflow-hidden mt-6"
                                    >
                                        <div className="bg-zinc-50 p-8 text-center border-b border-zinc-100">
                                            <div className="inline-flex items-center justify-center p-3 bg-green-100 text-green-700 rounded-full mb-4 shadow-sm">
                                                <CheckCircle size={24} />
                                            </div>
                                            <h4 className="font-serif text-2xl font-bold text-slate-900 mb-2">Great! Here's our live calendar.</h4>
                                            <p className="text-zinc-600 max-w-md mx-auto">
                                                Select a time below to book your free call to discuss <strong>{generatedReport.bookingTopic}</strong>.
                                            </p>
                                        </div>
                                        <div className="w-full relative min-h-[700px]">
                                            <iframe
                                                src="https://api.leadconnectorhq.com/widget/booking/xPaYSZulboJxxCpHa9dY"
                                                style={{ width: '100%', border: 'none', minHeight: '700px', overflow: 'hidden' }}
                                                scrolling="yes"
                                                id="EQQGeUU49pxoPjjuBmng_1767472093119"
                                            />
                                        </div>
                                        <script src="https://link.msgsndr.com/js/form_embed.js" type="text/javascript"></script>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </>
                    ) : (
                        // Placeholder when waiting for calculation
                        <div className="h-full flex flex-col items-center justify-center p-12 text-center opacity-40 border-2 border-dashed border-zinc-200 rounded-3xl min-h-[400px]">
                            <div className="bg-zinc-100 p-6 rounded-full mb-6">
                                <DollarSign size={48} className="text-zinc-400" />
                            </div>
                            <h3 className="text-xl font-serif text-zinc-900 mb-2">Ready to crunch the numbers?</h3>
                            <p className="text-zinc-500 max-w-xs mx-auto">
                                Adjust your inputs on the left and click "Calculate" to see your personalized budget breakdown and feasibility report.
                            </p>
                        </div>
                    )}

                </div>
            </div>

            {/* Disclaimer Footer */}
            <div className="mt-16 pt-8 border-t border-zinc-200 text-center max-w-4xl mx-auto opacity-60 hover:opacity-100 transition-opacity">
                <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-2">Legal Disclaimer</p>
                <p className="text-xs text-zinc-500 leading-relaxed">
                    This calculator is for educational and illustrative purposes only. All figures provided are estimates based on market averages and do not represent a final bid or binding offer. Actual construction costs may vary significantly due to site conditions, material volatility, design complexity, and other unforeseen factors or "hidden costs" not accounted for in this preliminary analysis. This tool is designed to help you assess budget realism and identify next steps, not to guarantee a specific price.
                </p>
            </div>

            {/* Lead Capture Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />

                        {/* Modal Content */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white z-10 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
                        >
                            <div className="p-8">
                                <div className="flex justify-end mb-2">
                                    <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-zinc-900 transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="text-center mb-8">
                                    <div className="bg-purple-50 size-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-purple-600">
                                        <Lock size={28} />
                                    </div>
                                    <h3 className="text-2xl font-serif font-bold text-slate-900 mb-2">Where can we send the numbers?</h3>
                                    <p className="text-zinc-500 text-sm">It usually comes over within 15 seconds</p>
                                </div>

                                <div className="space-y-4">
                                    <input
                                        placeholder="Full Name"
                                        className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        autoFocus
                                    />
                                    <input
                                        placeholder="Email Address"
                                        type="email"
                                        className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                    <input
                                        placeholder="Phone Number"
                                        type="tel"
                                        className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />

                                    <div className="pt-2">
                                        <label className="flex items-start gap-3 cursor-pointer group">
                                            <div className={`mt-0.5 size-5 rounded border flex items-center justify-center shrink-0 transition-colors ${agreedToTerms ? 'bg-purple-600 border-purple-600' : 'border-zinc-300 bg-white group-hover:border-purple-400'}`}>
                                                {agreedToTerms && <CheckCircle size={12} className="text-white" />}
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={agreedToTerms}
                                                onChange={(e) => setAgreedToTerms(e.target.checked)}
                                            />
                                            <span className="text-xs text-zinc-500 leading-snug">
                                                I agree to receive the budget breakdown and related communication.
                                                <div className="block mt-1 text-[10px] text-zinc-400 font-medium">Don't worry, we hate spammers too 🤝</div>
                                            </span>
                                        </label>
                                    </div>

                                    {modalError && (
                                        <p className="text-xs text-red-500 flex items-center gap-1 justify-center animate-pulse">
                                            <AlertTriangle size={12} /> {modalError}
                                        </p>
                                    )}

                                    <button
                                        onClick={handleModalSubmit}
                                        className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-gradient-to-r hover:from-slate-800 hover:to-slate-700 transition-all duration-300 shadow-lg shadow-slate-900/20 text-lg flex items-center justify-center gap-2 mt-4"
                                    >
                                        Reveal My Budget
                                        <ArrowRight size={18} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};
