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
    designStatus: 'Complete' | 'In progress' | 'Not started';
    targetDate?: Date;
}

const BASE_PHASES: Phase[] = [
    { name: 'Getting Ready', durationMonths: 2, description: 'Finalizing financing and land feasibility.', color: 'bg-blue-500' },
    { name: 'Design & Planning', durationMonths: 4, description: 'Architectural drawings, engineering, and adjustments.', color: 'bg-purple-500' },
    { name: 'Permits & Prep', durationMonths: 3, description: 'City submissions, approvals, and site preparation.', color: 'bg-orange-500' },
    { name: 'Construction', durationMonths: 12, description: 'Foundation to final walkthrough.', color: 'bg-green-500' },
];

export const calculateAdjustedTimeline = (inputs: TimelineInputs): TimelineResult => {
    // Clone phases to avoid mutating constant
    let phases = JSON.parse(JSON.stringify(BASE_PHASES));

    // Logic: Adjust Phases based on Inputs

    // 1. Getting Ready (Land)
    if (inputs.landStatus === 'Yes') {
        // If they have land, this phase is faster (just finance/feasibility)
        phases[0].durationMonths = 1;
    }
    // If "In Process" or "Not Yet", keep at 2-3 months default.

    // 2. Design
    if (inputs.designStatus === 'Complete') {
        // Skip main design, just keep 1 month for "Builder Review/Bidding"
        phases[1].durationMonths = 1;
        phases[1].description = 'Final builder review and bidding.';
    } else if (inputs.designStatus === 'In progress') {
        phases[1].durationMonths = 2; // Halfway there
    }

    // Calculation Loop
    let current = new Date();
    const resultPhases = [];
    let totalMonths = 0;

    for (const phase of phases) {
        if (phase.durationMonths <= 0) continue; // Skip empty phases

        const start = new Date(current);
        // Add months
        current.setMonth(current.getMonth() + phase.durationMonths);
        const end = new Date(current);

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
