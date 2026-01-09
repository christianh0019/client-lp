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

export const PHASES: Phase[] = [
    { name: 'Concept & Design', durationMonths: 3, description: 'Floor plans, elevations, and revisions.', color: 'bg-blue-500' },
    { name: 'Engineering & Permits', durationMonths: 3, description: 'Structural engineering, soil tests, and city approval.', color: 'bg-purple-500' },
    { name: 'Site Prep & Foundation', durationMonths: 2, description: 'Excavation, utilities, and pouring concrete.', color: 'bg-orange-500' },
    { name: 'Framing & Dry-In', durationMonths: 3, description: 'Walls up, roof on, windows installed.', color: 'bg-yellow-500' },
    { name: 'Systems & Rough-Ins', durationMonths: 2, description: 'Plumbing, electrical, and HVAC installation.', color: 'bg-cyan-500' },
    { name: 'Interior & Finishes', durationMonths: 4, description: 'Drywall, cabinets, flooring, and paint.', color: 'bg-green-500' },
];

export const calculateTimeline = (startDate: Date = new Date()): TimelineResult => {
    let current = new Date(startDate);
    const resultPhases = [];

    for (const phase of PHASES) {
        const start = new Date(current);
        // Add months
        current.setMonth(current.getMonth() + phase.durationMonths);
        const end = new Date(current);

        resultPhases.push({
            name: phase.name,
            startDate: start,
            endDate: end,
            description: phase.description,
            color: phase.color
        });
    }

    return {
        totalMonths: PHASES.reduce((acc, p) => acc + p.durationMonths, 0),
        moveInDate: current,
        phases: resultPhases
    };
};

export const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
