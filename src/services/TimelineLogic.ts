export interface Phase {
    name: string;
    minDuration: number;
    maxDuration: number;
    description: string;
    delayWarning?: string; // Optional warning box content
    color: string;
}

export interface TimelineResult {
    minTotalMonths: number;
    maxTotalMonths: number;
    moveInDateMin: Date;
    moveInDateMax: Date;
    phases: {
        name: string;
        minDuration: number;
        maxDuration: number;
        startDate: Date; // Based on Avg/Max for simplicity in plotting, or just illustrative
        description: string;
        delayWarning?: string;
        color: string;
    }[];
}

export interface TimelineInputs {
    landStatus: 'Yes' | 'Not yet' | 'In process';
    designStatus: 'Plans Complete' | 'In Progress' | 'Not Started';
    financing: 'Cash' | 'Pre-approved loan' | 'Still exploring';
    targetDate?: string;
}

// Helper
const addMonths = (date: Date, months: number) => {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
};

export const calculateAdjustedTimeline = (inputs: TimelineInputs): TimelineResult => {
    const phases: Phase[] = [];

    // --- Phase 1: Land & Prep ---
    let landMin = 0, landMax = 0;
    let landDesc = "";
    let landWarn = undefined;

    if (inputs.landStatus === 'Yes') {
        landMin = 1; landMax = 1;
        landDesc = "Since you own land, we focus immediately on site feasibility.";
    } else if (inputs.landStatus === 'In process') {
        landMin = 1; landMax = 2;
        landDesc = "Time budgeted to finalize your land purchase and close escrow.";
    } else {
        landMin = 3; landMax = 5;
        landDesc = "Finding the perfect lot is the most variable step.";
        landWarn = "Land inventory is tight. Finding the right lot can take longer than expected.";
    }

    // Financing Impact
    if (inputs.financing === 'Still exploring') {
        landMax += 1;
        landDesc += " Includes buffer for bank approvals.";
    }

    phases.push({
        name: inputs.landStatus === 'Not yet' ? 'Land Search & Prep' : 'Project Prep',
        minDuration: landMin,
        maxDuration: landMax,
        description: landDesc,
        delayWarning: landWarn,
        color: 'bg-blue-500'
    });


    // --- Phase 2: Design & Engineering ---
    let designMin = 0, designMax = 0;
    let designDesc = "";

    if (inputs.designStatus === 'Plans Complete') {
        designMin = 1; designMax = 1;
        designDesc = "Plans are ready! Only time needed for final builder review and bidding.";
    } else if (inputs.designStatus === 'In Progress') {
        designMin = 2; designMax = 4;
        designDesc = "Finish engineering and make final material selections.";
    } else {
        designMin = 3; designMax = 6;
        designDesc = "Full custom design process including architectural concepts and revisions.";
    }

    phases.push({
        name: 'Design & Bidding',
        minDuration: designMin,
        maxDuration: designMax,
        description: designDesc,
        color: 'bg-purple-500'
    });


    // --- Phase 3: Permitting (High Variance) ---
    phases.push({
        name: 'Permits & Approvals',
        minDuration: 2,
        maxDuration: 4,
        description: "City or county review of your construction documents.",
        delayWarning: "Permitting timelines are outside our control and city backlogs change weekly. We buffer for this, but be prepared for delays.",
        color: 'bg-orange-500'
    });


    // --- Phase 4: Construction ---
    phases.push({
        name: 'Construction',
        minDuration: 10,
        maxDuration: 13,
        description: "From foundation pour to final walkthrough and keys.",
        delayWarning: "Weather and material availability can impact the build schedule.",
        color: 'bg-green-500'
    });


    // For visualizing phases linearly, we usually just show the "Max" or "Avg" timeline 
    // to give them a realistic roadmap, but display the "Range" in text.
    // Let's track a single visual timeline based on MAX duration to be safe/conservative.
    let visualCurrent = new Date();

    const resultPhases = [];
    let minTotalMonths = 0;
    let maxTotalMonths = 0;

    for (const phase of phases) {
        minTotalMonths += phase.minDuration;
        maxTotalMonths += phase.maxDuration;

        // For the visual timeline, we use Max duration to prevent over-promising
        const start = new Date(visualCurrent);
        const end = addMonths(visualCurrent, phase.maxDuration);
        visualCurrent = end;

        resultPhases.push({
            name: phase.name,
            minDuration: phase.minDuration,
            maxDuration: phase.maxDuration,
            startDate: start,
            endDate: end,
            description: phase.description,
            delayWarning: phase.delayWarning,
            color: phase.color
        });
    }

    return {
        minTotalMonths,
        maxTotalMonths,
        moveInDateMin: addMonths(new Date(), minTotalMonths),
        moveInDateMax: addMonths(new Date(), maxTotalMonths),
        phases: resultPhases
    };
};

export const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
