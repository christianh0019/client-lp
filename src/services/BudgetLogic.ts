
export const DEFAULT_SOFT_COST_PCT = 0.20; // 20% default

export interface BudgetBreakdown {
    totalBudget: number;
    landCost: number;
    softCostEstimate: number;
    hardConstructionBudget: number;
    hardCostPerSqFt: number;
}

export type FeasibilityStatus = 'Unrealistic' | 'Tight' | 'Comfortable' | 'Luxury';

export interface SoftCostInputs {
    hasPlans: boolean;
    hasEngineering: boolean;
    hasUtilities: boolean;
}

/**
 * Calculates the "Hard Construction Budget" by stripping away land and soft costs.
 */
export const calculateBudgetBreakdown = (
    totalBudget: number,
    landCost: number,
    sqFt: number,
    inputs: SoftCostInputs
): BudgetBreakdown => {
    // 1. Deduct Land
    const budgetAfterLand = Math.max(0, totalBudget - landCost);

    // 2. Calculate Soft Costs granularly
    // Base (Management/Overhead): 5%
    // Need Plans: +5%
    // Need Engineering: +5%
    // Need Utilities: +5%

    let softCostPct = 0.05; // Base 5%

    if (!inputs.hasPlans) softCostPct += 0.05;
    if (!inputs.hasEngineering) softCostPct += 0.05;
    if (!inputs.hasUtilities) softCostPct += 0.05;

    // Calculate
    const hardConstructionBudget = budgetAfterLand / (1 + softCostPct);
    const softCostEstimate = budgetAfterLand - hardConstructionBudget;

    // 3. Per Sq Ft
    const hardCostPerSqFt = sqFt > 0 ? hardConstructionBudget / sqFt : 0;

    return {
        totalBudget,
        landCost,
        softCostEstimate,
        hardConstructionBudget,
        hardCostPerSqFt
    };
};

/**
 * Determines status based on local market data.
 */
export const getFeasibilityStatus = (
    costPerSqFt: number,
    marketLow: number, // e.g. 250
    marketHigh: number // e.g. 450
): { status: FeasibilityStatus; color: string; message: string } => {

    if (costPerSqFt < marketLow) {
        return {
            status: 'Unrealistic',
            color: 'text-red-500',
            message: `At $${Math.round(costPerSqFt)}/ft, you are below the local minimum of $${marketLow}/ft. This is high risk.`
        };
    }

    if (costPerSqFt < (marketLow + 50)) {
        return {
            status: 'Tight',
            color: 'text-yellow-500',
            message: `At $${Math.round(costPerSqFt)}/ft, you are in the entry-level range. Standard finishes only.`
        };
    }

    if (costPerSqFt > marketHigh) {
        return {
            status: 'Luxury',
            color: 'text-purple-400',
            message: `At $${Math.round(costPerSqFt)}/ft, you can build a true luxury home with premium finishes.`
        };
    }

    return {
        status: 'Comfortable',
        color: 'text-emerald-500',
        message: `At $${Math.round(costPerSqFt)}/ft, you are in the sweet spot for a quality custom home.`
    };
};
