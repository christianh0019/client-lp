import type { BudgetBreakdown, FeasibilityStatus } from './BudgetLogic';

export interface ReportData {
    breakdown: BudgetBreakdown;
    feasibility: { status: FeasibilityStatus; message: string } | null;
    inputs: {
        hasLand: boolean | null;
        hasPlans: boolean;
        hasEngineering: boolean;
        city: string;
        name: string;
        targetSqFt: number;
    };
}

export interface GeneratedReport {
    title: string;
    greeting: string;
    paragraphs: string[];
    actionPlan: {
        step: string;
        description: string;
    }[];
    cta: {
        text: string;
        primary: boolean;
        action: 'book_consult' | 'find_land' | 'get_bid' | 'assess_viability';
    };
    urgency: 'high' | 'medium' | 'low';
    closing: string;
}

export const ReportGenerator = {
    generate: (data: ReportData): GeneratedReport => {
        const { breakdown, feasibility, inputs } = data;
        const firstName = inputs.name.split(' ')[0] || 'there';

        // 1. Determine Core Problem / Status
        let coreStatus: 'unrealistic' | 'no_land' | 'design_needed' | 'engineering_needed' | 'ready_to_build' = 'design_needed';

        if (feasibility?.status === 'Unrealistic') {
            coreStatus = 'unrealistic';
        } else if (!inputs.hasLand) {
            coreStatus = 'no_land';
        } else if (!inputs.hasPlans) {
            coreStatus = 'design_needed';
        } else if (!inputs.hasEngineering) {
            coreStatus = 'engineering_needed';
        } else {
            coreStatus = 'ready_to_build';
        }

        // 2. Draft Content based on Status
        let title = '';
        let greeting = `Hi ${firstName},`;
        let paragraphs: string[] = [];
        let actionPlan: { step: string; description: string }[] = [];
        let cta: GeneratedReport['cta'] = { text: 'Schedule Free Consultation', primary: true, action: 'book_consult' };
        let urgency: 'high' | 'medium' | 'low' = 'medium';
        let closing = '';

        switch (coreStatus) {
            case 'unrealistic':
                title = "Budget Feasibility Analysis";
                paragraphs = [
                    `I've analyzed your target budget of ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(breakdown.totalBudget)} against current market rates in ${inputs.city}.`,
                    `At ${Math.round(breakdown.hardCostPerSqFt)}/sqft, we are currently below the robust building standard for this area. This doesn't mean your project is impossible, but it does mean we need to be strategic about scope, size, or selections to align with reality.`
                ];
                actionPlan = [
                    { step: "Budget Reality Check", description: "Review line-item costs to identify where we can save without sacrificing quality." },
                    { step: "Scope Adjustment", description: "Explore adjusting the square footage or finish levels to fit the budget." },
                    { step: "Land Search Strategy", description: "Find a lot that requires less site work to free up budget for the build." }
                ];
                cta = { text: "Book a Budget Viability Call", primary: true, action: 'assess_viability' };
                urgency = 'high';
                closing = "BuilderProject specializes in value engineering tailored to your specific financial goals. We can help you identify exactly where to adjust your scope to make this project viable without losing the features you love. We'd love to walk you through a few options.";
                break;

            case 'no_land':
                title = "Project Roadmap: The Foundation Phase";
                paragraphs = [
                    `Your budget looks healthy for a ${inputs.targetSqFt} sq ft home in ${inputs.city}. The biggest variable right now is the land.`,
                    `A house is designed for a specific lot—its slope, views, and solar orientation. Designing before you have land often leads to costly redesigns later.`
                ];
                actionPlan = [
                    { step: "Land Acquisition", description: "Identify and secure a lot that supports your vision and budget." },
                    { step: "Feasibility Study", description: "Before closing, verify utilities, zoning, and topography." },
                    { step: "Initial Design Concepts", description: "Once the land is secured, we begin sketching your home to fit the terrain." }
                ];
                cta = { text: "Start Your Land Search", primary: true, action: 'find_land' };
                urgency = 'medium';
                closing = "Finding the perfect lot is the first step to a successful build, and it's something we help clients with every day. BuilderProject can help you evaluate potential properties for hidden costs before you make an offer. Let's chat about what you're looking for.";
                break;

            case 'design_needed':
                title = "Project Roadmap: Design & Vision";
                paragraphs = [
                    `You have the land, which is a huge milestone! Based on your budget of ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(breakdown.totalBudget)}, you are in a great position to build a fantastic custom home in ${inputs.city}.`,
                    `The next critical step is translating your ideas into buildable plans. This is where we define the flow, the look, and the lifestyle of your new home.`
                ];
                actionPlan = [
                    { step: "Architectural Design", description: "Create floor plans and elevations that maximize your lot's potential." },
                    { step: "Preliminary Pricing", description: "Get cost feedback early in the design process to stay on budget." },
                    { step: "Selections", description: "Choose finishes and fixtures that define your style." }
                ];
                cta = { text: "Schedule Free Design Consultation", primary: true, action: 'book_consult' };
                urgency = 'medium';
                closing = "At BuilderProject, we believe design should be driven by both creativity and cost-awareness. We can help you start the design process with a clear budget in mind so you don't fall in love with a home that's expensive to build. We'd love to hear your ideas.";
                break;

            case 'engineering_needed':
                title = "Project Roadmap: Technical Execution";
                paragraphs = [
                    `It's great that you already have design plans! That puts you ahead of 80% of aspiring homeowners.`,
                    `To turn those drawings into a standing structure, we need to bridge the gap with engineering. This ensures your home is structurally sound and compliant with ${inputs.city} codes.`
                ];
                actionPlan = [
                    { step: "Structural Engineering", description: "Calculate load paths, foundation design, and framing details." },
                    { step: "Civil & Soils", description: "Address drainage, grading, and soil bearing capacity." },
                    { step: "Permit Submission", description: "Compile all technical documents for city approval." }
                ];
                cta = { text: "Get Your Engineering Quote", primary: true, action: 'book_consult' };
                urgency = 'medium';
                closing = "Navigating the technical requirements of engineering and permitting can be complex, but we handle it all the time. BuilderProject can coordinate the entire pre-construction team to get your project permit-ready faster. Let's discuss your timeline.";
                break;

            case 'ready_to_build':
                title = "Project Roadmap: Pre-Construction";
                paragraphs = [
                    `Impressive! You have land, plans, and engineering. You represent the ideal client who is ready to move efficiently.`,
                    `Your budget of ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(breakdown.totalBudget)} is workable. The next step is to get a hard construction bid and secure your slot in the build schedule.`
                ];
                actionPlan = [
                    { step: "Hard Bid Construction", description: "Finalize a fixed-price or cost-plus contract for construction." },
                    { step: "Permit Acquisition", description: "Pull the final building permits from the city." },
                    { step: "Ground Breaking", description: "Mobilize the site and begin construction." }
                ];
                cta = { text: "Request a Construction Bid", primary: true, action: 'get_bid' };
                urgency = 'high';
                closing = "Since you're ready to build, we're ready to bid. BuilderProject offers transparent, detailed construction management to bring your fully-formed vision to life on time and on budget. We'd love to review your plans and give you a firm number.";
                break;
        }

        return {
            title,
            greeting,
            paragraphs,
            actionPlan,
            cta,
            urgency,
            closing
        };
    }
};
