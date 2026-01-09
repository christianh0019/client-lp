export interface Phase {
    name: string;
    durationMonths: number;
    description: string;
    color: string;
}

export interface TimelineResult {
    totalMonths: number;
    moveInDate: Date;
    phases: {
        name: string;
        startDate: Date;
        endDate: Date;
        description: string;
        color: string;
    }[];
}

export interface TimelineInputs {
    landStatus: 'Yes' | 'Not yet' | 'In process';
    designStatus: 'Plans Complete' | 'In Progress' | 'Not Started';
    financing: 'Cash' | 'Pre-approved loan' | 'Still exploring';
    targetDate?: string;
}

// Helper to add months safely
const addMonths = (date: Date, months: number) => {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
};

export const calculateAdjustedTimeline = (inputs: TimelineInputs): TimelineResult => {
    const phases: Phase[] = [];

    // --- Phase 1: Land & Prep ---
    let landDuration = 0;
    let landDesc = "";

    if (inputs.landStatus === 'Yes') {
        landDuration = 1;
        landDesc = "Since you own land, we skip the search and focus on site feasibility and soil tests.";
    } else if (inputs.landStatus === 'In process') {
        landDuration = 2;
        landDesc = "Budgeting time to finalize your land purchase and close escrow.";
    } else {
        landDuration = 4;
        landDesc = "Finding the perfect lot is step one. We've budgeted 3-4 months for search and closing.";
    }

    // Financing Impact on Prep
    if (inputs.financing === 'Still exploring') {
        landDuration += 1;
        landDesc += " Includes extra time to secure pre-approval.";
    } else if (inputs.financing === 'Cash') {
        landDesc += " Cash financing will speed up closing.";
    }

    phases.push({
        name: inputs.landStatus === 'Not yet' ? 'Land Search & Prep' : 'Project Prep',
        durationMonths: landDuration,
        description: landDesc,
        color: 'bg-blue-500'
    });


    // --- Phase 2: Design & Engineering ---
    let designDuration = 0;
    let designDesc = "";

    if (inputs.designStatus === 'Plans Complete') {
        designDuration = 1;
        designDesc = "Your plans are ready! We just need 1 month for final builder review and sub-contractor bidding.";
    } else if (inputs.designStatus === 'In Progress') {
        designDuration = 3;
        designDesc = "Since you've started design, we'll need a few months to finalize engineering and selections.";
    } else {
        designDuration = 5;
        designDesc = "Full custom design from concept to construction docs tailored to your lifestyle.";
    }

    phases.push({
        name: 'Design & Bidding',
        durationMonths: designDuration,
        description: designDesc,
        color: 'bg-purple-500'
    });


    // --- Phase 3: Permitting ---
    // This is static for now, as we can't really guess by city without a database
    phases.push({
        name: 'Permits & Approvals',
        durationMonths: 3,
        description: "Submission to the city/county for building permits. This timeline varies heavily by municipality.",
        color: 'bg-orange-500'
    });


    // --- Phase 4: Construction ---
    // Standard custom home is ~10-12 months
    const buildDuration = 11;
    phases.push({
        name: 'Construction',
        durationMonths: buildDuration,
        description: "From foundation to final walkthrough. Excavation, framing, systems, and finishes.",
        color: 'bg-green-500'
    });


    // --- Calculation Loop ---
    let current = new Date();
    const resultPhases = [];
    let totalMonths = 0;

    for (const phase of phases) {
        if (phase.durationMonths <= 0) continue;

        const start = new Date(current);
        const end = addMonths(current, phase.durationMonths);
        current = end; // Advance time

        totalMonths += phase.durationMonths;

        resultPhases.push({
            name: phase.name,
            startDate: start,
            endDate: end,
            description: phase.description,
            color: phase.color
        });
    }

    return {
        totalMonths,
        moveInDate: current,
        phases: resultPhases
    };
};

export const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
