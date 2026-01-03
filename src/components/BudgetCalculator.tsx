import React, { useState, useEffect } from 'react';
import { LocationCostService, type MarketData } from '../services/LocationCostService';
import { calculateBudgetBreakdown, getFeasibilityStatus as checkFeasibility } from '../services/BudgetLogic';
import { MapPin, CheckCircle, AlertTriangle, ArrowRight, Layers, DollarSign, Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export const BudgetCalculator: React.FC = () => {
    // Local State (replaced Contexts)
    const [totalBudget, setTotalBudget] = useState(1500000);
    const [landCost, setLandCost] = useState(300000);
    const [targetSqFt, setTargetSqFt] = useState(3000);
    const [includeSoftCosts, setIncludeSoftCosts] = useState(true);
    const [hasLand, setHasLand] = useState(false);
    const [city, setCity] = useState('');
    const [marketData, setMarketData] = useState<MarketData | null>(null);

    // UI State
    const [isLoadingMarket, setIsLoadingMarket] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Calculate Breakdown
    const breakdown = calculateBudgetBreakdown(totalBudget, !hasLand ? landCost : 0, targetSqFt, includeSoftCosts);

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
    };

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

    const selectCity = (selectedCity: string) => {
        setCity(selectedCity);
        setSuggestions([]);
        setShowSuggestions(false);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full text-zinc-900 pb-32 relative">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6 animate-fadeIn">
                <div className="space-y-3">
                    <h2 className="text-4xl md:text-5xl font-serif tracking-tighter text-slate-900">Your Budget Blueprint</h2>
                    <div className="h-[1px] w-12 bg-zinc-300"></div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Align your dream with market reality</p>
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
                                    onKeyPress={(e) => e.key === 'Enter' && handleRunMarketResearch()}
                                    className="bg-transparent border-b border-zinc-200 py-2 focus:border-purple-500 focus:outline-none text-zinc-900 placeholder:text-zinc-400 w-full font-serif text-lg"
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
                            <button
                                onClick={handleRunMarketResearch}
                                disabled={isLoadingMarket}
                                className="bg-slate-900 hover:bg-slate-800 text-white rounded-lg px-4 flex items-center justify-center transition-all shrink-0"
                            >
                                {isLoadingMarket ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                            </button>
                        </div>

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
                                <label className="text-xs uppercase tracking-widest text-zinc-500">Total Investment Cap</label>
                                <span className="text-xl font-serif text-zinc-900 font-bold">{formatCurrency(totalBudget)}</span>
                            </div>
                            <input
                                type="range"
                                min={300000} max={5000000} step={10000}
                                value={totalBudget}
                                onChange={(e) => setTotalBudget(Number(e.target.value))}
                                className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
                            />
                        </div>

                        {/* Land Logic */}
                        <div className="bg-white border border-zinc-200 rounded-xl p-4 space-y-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Layers size={14} className="text-zinc-500" />
                                    <span className="text-xs uppercase tracking-widest text-zinc-900">Land Status</span>
                                </div>
                                <div className="flex gap-2 mb-4 bg-zinc-100 p-1 rounded-lg w-fit">
                                    <button onClick={() => setHasLand(true)} className={`px-3 py-1.5 text-xs rounded-md transition-all ${hasLand ? 'bg-white text-zinc-900 shadow-sm font-bold' : 'text-zinc-500 hover:text-zinc-900'}`}>
                                        I have land
                                    </button>
                                    <button onClick={() => setHasLand(false)} className={`px-3 py-1.5 text-xs rounded-md transition-all ${!hasLand ? 'bg-white text-zinc-900 shadow-sm font-bold' : 'text-zinc-500 hover:text-zinc-900'}`}>
                                        I need land
                                    </button>
                                </div>
                            </div>

                            <AnimatePresence>
                                {!hasLand && (
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
                                                onChange={(e) => setLandCost(Number(e.target.value))}
                                                className="w-full h-2 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-slate-600"
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Soft Cost Toggle */}
                        <div className="flex items-center justify-between p-4 border border-zinc-200 bg-white rounded-xl hover:bg-zinc-50 transition-colors cursor-pointer shadow-sm" onClick={() => setIncludeSoftCosts(!includeSoftCosts)}>
                            <div className="flex items-center gap-3">
                                <div className={`size-4 border rounded flex items-center justify-center transition-colors ${includeSoftCosts ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-400'} `}>
                                    {includeSoftCosts && <CheckCircle size={10} className="text-white" />}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-zinc-900">Include Soft Costs?</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-zinc-500">Permits, Design, Engineering (~20%)</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Size Slider */}
                        <div className="space-y-4 pt-6 border-t border-zinc-100">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <label className="text-xs uppercase tracking-widest text-zinc-500">Target Home Size</label>
                                </div>
                                <span className="text-xl font-serif text-zinc-900 font-bold">{targetSqFt.toLocaleString()} sq ft</span>
                            </div>
                            <input
                                type="range"
                                min={1000} max={10000} step={50}
                                value={targetSqFt}
                                onChange={(e) => setTargetSqFt(Number(e.target.value))}
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

                    </div>
                </div>

                {/* RIGHT COLUMN: The Breakdown & Reality Check */}
                <div className="lg:col-span-7 space-y-6 animate-fadeIn" style={{ animationDelay: '0.2s' }}>

                    {/* The Waterfall Waterfall */}
                    <div className="bg-white rounded-3xl p-8 border border-zinc-200 shadow-xl shadow-slate-200/50">
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
                                {includeSoftCosts && (
                                    <div className="flex justify-between items-center text-orange-500 px-4 bg-orange-50/50 py-1 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs uppercase tracking-widest">- Soft Costs (~20%)</span>
                                        </div>
                                        <span className="font-mono text-sm font-bold">({formatCurrency(breakdown.softCostEstimate)})</span>
                                    </div>
                                )}
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
                    </div>

                    {/* The Reality Check Gauge */}
                    <div className="bg-white rounded-3xl p-8 border border-zinc-200 text-center relative overflow-hidden shadow-sm">
                        {feasibility && (
                            <>
                                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 opacity-30`} />

                                {/* Dynamic Indicator */}
                                <div className="mb-6 relative pointer-events-auto">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">Construction Power</span>
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
                    </div>

                </div>
            </div>

        </div>
    );
};
