import React from 'react';
import {
    DollarSign, PenTool, Gavel, Layout,
    AlertTriangle, Compass, HelpCircle
} from 'lucide-react';

export interface Article {
    id: number;
    title: string;
    subtitle: string;
    readTime: string;
    category: 'Strategy' | 'Finance' | 'Design' | 'Legal' | 'Construction' | 'Budgeting';
    gradient: string;
    icon: React.ElementType;
    content: React.ReactNode;
    featured?: boolean;
    stageIds: number[]; // Maps to Roadmap Stages 0-6
    videoUrl?: string; // Optional YouTube Embed URL
}

export const ARTICLES: Article[] = [
    {
        id: 1,
        title: "The 2025 Guide to Construction Loans",
        subtitle: "Interest reserves, draw schedules, and why 'Cash is King' might be wrong.",
        readTime: "12 min read",
        category: "Finance",
        gradient: "from-emerald-900 to-green-950",
        icon: DollarSign,
        featured: true,
        stageIds: [1, 2, 3], // Setting Budget, Finding Land, Designing
        videoUrl: "https://www.youtube.com/embed/S92fTz_Iggc", // Example: Construction Loan Basics
        content: (
            <div className="space-y-6 text-zinc-600 leading-relaxed font-light">
                <p>
                    Most borrowers treat a construction loan like a mortgage. It isn't. It's a line of credit that behaves
                    like a checking account with a detonator attached.
                </p>
                <h3 className="text-xl text-slate-900 font-serif">The Interest Reserve Trap</h3>
                <p>
                    Banks will offer to "roll interest into the loan." This sounds like a favor. It effectively means you are
                    borrowing money to pay the interest on the money you borrowed. On a $2M build, this compound effect can
                    cost you $40k+ in "phantom costs" before you move in.
                </p>
                <h3 className="text-xl text-slate-900 font-serif">The Draw Schedule</h3>
                <p>
                    Your builder needs cash flow. Your bank wants risk mitigation. You are caught in the middle.
                    If the bank inspector "feels" the foundation is only 80% done, they short the draw. The builder stops work.
                    The project stalls.
                </p>
            </div>
        )
    },
    {
        id: 2,
        title: "Custom vs. Tract: The Asset Class",
        subtitle: "Start with 20% equity or start underwater. The math of development.",
        readTime: "5 min read",
        category: "Strategy",
        gradient: "from-blue-900 to-slate-900",
        icon: Compass,
        stageIds: [0, 1], // Getting Started, Budget
        content: (

            <div className="space-y-6 text-zinc-600 leading-relaxed font-light">
                <p>
                    Let's talk about the uncomfortable truth of buying a home. When you buy a house from a production builder (like the big national names you see on billboards), you aren't just paying for the lumber, the bricks, and the labor.
                </p >
                <p>
                    You are paying for their marketing department. You are paying for their model homes. You are paying for their corporate overhead. And most importantly, you are paying for their <strong>profit margin</strong>.
                </p>

                <h3 className="text-2xl text-slate-900 font-serif mt-8 mb-4">The "Retail" Price Tag</h3>
                <p>
                    Think of a production home like buying a suit off the rack at a department store.
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-4 mb-6">
                    <li>The fabric cost $50.</li>
                    <li>The labor cost $100.</li>
                    <li>The store is selling it to you for $500.</li>
                </ul>
                <p>
                    That gap—the $350 difference—is the "Retail Markup." In real estate, this markup is typically <strong>20% to 30%</strong>. If you buy a $1,000,000 tract home, it likely only cost the builder $700,000 to actually build. You just paid $300,000 for the convenience of buying it "finished."
                </p>

                <h3 className="text-2xl text-slate-900 font-serif mt-8 mb-4">Custom Homes: Buying "Wholesale"</h3>
                <p>
                    When you decide to build a custom home, you are effectively firing the middleman. <strong>YOU become the developer.</strong>
                </p>
                <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 my-8">
                    <p className="text-emerald-700 font-medium text-lg mb-2">
                        This is called "Sweat Equity."
                    </p>
                    <p className="text-sm text-zinc-600">
                        By taking on the work of hiring an architect, finding land, and managing the process (with a builder), you get to keep that 20-30% margin for yourself.
                    </p>
                </div>

                <h3 className="text-2xl text-slate-900 font-serif mt-8 mb-4">Instant Equity vs. Underwater</h3>
                <p>
                    This is why custom homes are a completely different <strong>Asset Class</strong>.
                </p>
                <p>
                    <strong>Scenario A (Tract Home):</strong> You buy for $1M. The market dips 5%. Your house is now worth $950k. You are underwater. You literally lost money the day you signed the papers because you paid full retail price.
                </p>
                <p>
                    <strong>Scenario B (Custom Home):</strong> You spend $1M <em>total</em> (land + build). But because you built it yourself, it appraises for $1.3M (the retail value) the day you move in. The market dips 5%. Your house is worth $1.23M. <strong>You are still up $230,000.</strong>
                </p>

                <h3 className="text-2xl text-slate-900 font-serif mt-8 mb-4">It's Not Just About Money</h3>
                <p>
                    Beyond the finances, there is the Quality Factor. Production builders are optimized for <em>speed</em> and <em>shareholder value</em>. They use the cheapest materials that meet code.
                </p>
                <p>
                    When you build custom, you are optimized for <em>living</em>. You focus on insulation quality, window efficiency, and layout flow.
                </p>
                <p className="border-l-2 border-zinc-200 pl-4 italic text-zinc-500 my-6">
                    "A tract home is designed to be SOLD on a Sunday afternoon. A custom home is designed to be LIVED IN for 20 years."
                </p>

                <h3 className="text-2xl text-slate-900 font-serif mt-8 mb-4">The Catch? It's Hard Work.</h3>
                <p>
                    We won't lie to you. Capturing that $300k of equity takes work. It takes patience. It takes dealing with the city, the weather, and the dust.
                </p>
                <p>
                    But that is exactly what this app is for. We are here to guide you through the hard work so you can claim the reward at the finish line.
                </p>
            </div >
        )
    },
    {
        id: 3,
        title: "The 7 Stages of a Build",
        subtitle: "A roadmap to the chaos. What happens when.",
        readTime: "8 min read",
        category: "Construction",
        gradient: "from-orange-900 to-red-950",
        icon: Layout,
        stageIds: [0, 5], // Getting Started, In Progress
        videoUrl: "https://www.youtube.com/embed/XPw_7Kj8Xl0", // Example: Home Building Process
        content: (
            <div className="space-y-6 text-zinc-600 leading-relaxed font-light">
                <ul className="list-disc pl-6 space-y-4">
                    <li><strong className="text-slate-900">1. Vision:</strong> Sketches and mood boards.</li>
                    <li><strong className="text-slate-900">2. Pre-Approval:</strong> The budget reality check.</li>
                    <li><strong className="text-slate-900">3. Land:</strong> Finding the dirt.</li>
                    <li><strong className="text-slate-900">4. Architects:</strong> Turning drawings into blueprints.</li>
                    <li><strong className="text-slate-900">5. Construction:</strong> The 12-month push.</li>
                </ul>
            </div>
        )
    },
    {
        id: 4,
        title: "Designing for Resale",
        subtitle: "How to be unique without alienating the market.",
        readTime: "6 min read",
        category: "Design",
        gradient: "from-purple-900 to-indigo-950",
        icon: PenTool,
        stageIds: [3], // Designing
        content: <p className="text-zinc-600">Full guide on creating timeless design features that appraise well...</p>
    },
    {
        id: 5,
        title: "Lien Waivers 101",
        subtitle: "How to prevent paying for your roof twice.",
        readTime: "4 min read",
        category: "Legal",
        gradient: "from-zinc-800 to-zinc-950",
        icon: Gavel,
        stageIds: [4, 5], // Choosing Builder, In Progress
        content: (
            <div className="space-y-6 text-zinc-600">
                <p>
                    If your builder pays the roofer, but the roofer doesn't pay their supplier, the supplier can put a lien
                    on YOUR house. Even if you paid the builder in full. Learn how to demand unconditional lien waivers.
                </p>
            </div>
        )
    },
    {
        id: 6,
        title: "The 'Cost Plus' Trap",
        subtitle: "Why 'Fixed Price' contracts are a myth in custom building.",
        readTime: "7 min read",
        category: "Finance",
        gradient: "from-emerald-900 to-teal-950",
        icon: DollarSign,
        stageIds: [4], // Choosing Builder
        videoUrl: "https://www.youtube.com/embed/3D0tA5aQ0rY", // Example: Cost Plus vs Fixed Price
        content: <p className="text-zinc-600">Fixed Price contracts incentivize the builder to cut corners. Cost Plus incentivizes them to spend. Which is better?</p>
    },
    {
        id: 7,
        title: "Land Feasibility: 5 Red Flags",
        subtitle: "Soil, Slope, and Utilities. Don't buy a money pit.",
        readTime: "9 min read",
        category: "Strategy",
        gradient: "from-red-900 to-rose-950",
        icon: AlertTriangle,
        stageIds: [2], // Finding Land
        content: <p className="text-zinc-600">If the land is cheap, there is a reason. Usually it involves $50k in retaining walls or a $30k septic system.</p>
    },
    {
        id: 8,
        title: "Architect vs. Designer",
        subtitle: "Do you need a licensed pro or a talented artist?",
        readTime: "5 min read",
        category: "Design",
        gradient: "from-indigo-900 to-violet-950",
        icon: PenTool,
        stageIds: [3], // Designing
        content: <p className="text-zinc-600">For a basic layout, a designer saves you money. For complex engineering, you need an architect. Know the difference.</p>
    },
    // NEW EDUCATIONAL CONTENT FOR BUDGET CREATOR
    {
        id: 9,
        title: "The Invisible 20%: Understanding Soft Costs",
        subtitle: "Why a $1M budget only buys you an $800k house.",
        readTime: "8 min read",
        category: "Budgeting",
        gradient: "from-orange-800 to-amber-950",
        icon: HelpCircle,
        stageIds: [1], // Setting Budget
        content: (
            <div className="space-y-6 text-zinc-600 leading-relaxed font-light">
                <p>
                    Imagine you walk into a store to buy a $100 pair of sneakers, but at the register, they ring up as $125. You ask why, and the clerk says,
                    "Oh, the extra $25 is for the box, the receipt paper, and the electricity to run the lights in here."
                </p>
                <p>
                    That is exactly how <strong>Soft Costs</strong> work in home building.
                </p>
                <p>
                    Novice builders often make the mistake of thinking every dollar they spend goes into lumber, windows, and countertops (Hard Costs).
                    But before you can pour a single drop of concrete, you have to pay for the "permission" and "planning" to build.
                </p>

                <h3 className="text-2xl text-slate-900 font-serif mt-8 mb-4">The Breakdown: Where does the money go?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <strong className="text-slate-900 block mb-2 text-lg">1. Architecture & Engineering (8-12%)</strong>
                        <p className="text-sm">You aren't just paying for pretty drawings. You are paying for structural stamps, civil engineering (drainage), and energy calculations.</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <strong className="text-slate-900 block mb-2 text-lg">2. Government Fees (3-5%)</strong>
                        <p className="text-sm">Permits, impact fees, tap fees. This is literally the cost of writing a check to the city just to be allowed to start.</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <strong className="text-slate-900 block mb-2 text-lg">3. Site Prep (Variable)</strong>
                        <p className="text-sm">Soil tests, surveys, hauling away debris. The land doesn't come ready-to-build by default.</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <strong className="text-slate-900 block mb-2 text-lg">4. Financial Costs (2-5%)</strong>
                        <p className="text-sm">Loan origination fees and "interest during construction." Yes, you pay interest on the money while you use it.</p>
                    </div>
                </div>

                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 my-8">
                    <h4 className="text-blue-600 font-bold uppercase tracking-widest text-xs mb-2">Pro Tip</h4>
                    <p className="text-slate-900 font-medium">
                        Always reserve <span className="text-blue-600">20-25%</span> of your total budget for soft costs.
                    </p>
                    <p className="text-sm mt-2 text-zinc-500">
                        If you have $1,000,000 total, you have ~$750,000 to actually build the structure. If you budget $1M for construction, you will run out of money before the drywall goes up.
                    </p>
                </div>
            </div>
        )
    },
    {
        id: 10,
        title: "Do You Own Land?",
        subtitle: "Why this is a key question for your budget.",
        readTime: "3 min read",
        category: "Budgeting",
        gradient: "from-green-800 to-emerald-950",
        icon: Compass,
        stageIds: [2], // Finding Land
        content: (
            <div className="space-y-6 text-zinc-600 leading-relaxed font-light">
                <p>
                    Every dream home starts with a special piece of land. Think of it as the canvas where your masterpiece will be painted. Whether you have your canvas ready or are still searching for the perfect one, knowing where your home will be built is a huge part of planning your budget.
                </p>
                <p>
                    This question helps us understand where you are in your home-building journey and gives us important clues to provide you with a more accurate estimate.
                </p>

                <h3 className="text-2xl text-slate-900 font-serif mt-8 mb-4">If your answer is: "Yes, I own land!"</h3>
                <p>
                    That’s fantastic! You’ve already taken one of the biggest steps in the custom home journey.
                </p>
                <p>
                    Having your land helps us narrow down the budget significantly. The location, size, and even the shape of your property tell us a lot about the project. For example, some land is flat and ready to build on, while other land might have hills or trees that need to be worked with. Knowing these details helps us create a smarter, more accurate budget for you from the very beginning.
                </p>

                <h3 className="text-2xl text-slate-900 font-serif mt-8 mb-4">If your answer is: "No, I'm still looking."</h3>
                <p>
                    You are in the perfect place to start! Most people begin dreaming about their home long before they find the land for it, and that’s completely okay.
                </p>

                <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 my-8">
                    <p className="text-emerald-700 font-medium text-lg mb-2">
                        Factor in the Cost
                    </p>
                    <p className="text-sm text-zinc-600">
                        Answering "no" simply tells us that we need to factor the cost of buying land into your <strong>"Total All-In Investment."</strong> The search for the perfect spot is one of the most exciting parts of the adventure, and we can help guide you. Finding the right land is just as important as designing the right home.
                    </p>
                </div>

                <h3 className="text-2xl text-slate-900 font-serif mt-8 mb-4">Why Your Land Matters So Much</h3>
                <p>
                    The land you choose affects more than just the purchase price. It also influences the cost of getting the property ready for your home. This includes connecting utilities like water and power, and preparing the ground for a solid foundation.
                </p>
                <p>
                    By telling us whether you own land, you help us give you the clearest possible picture of your investment. It’s the first step in making sure your budget is built on a solid foundation—just like your future home.
                </p>
            </div>
        )
    },
    {
        id: 11,
        title: "The Myth of Cost Per Square Foot",
        subtitle: "Why asking 'How much per foot?' is like asking 'How much per pound?'",
        readTime: "7 min read",
        category: "Budgeting",
        gradient: "from-blue-900 to-indigo-950",
        icon: DollarSign,
        stageIds: [1, 4], // Budget, Choosing Builder
        content: (
            <div className="space-y-6 text-zinc-600 leading-relaxed font-light">
                <p>
                    Asking a builder "How much do you charge per square foot?" is the single most common question in our industry.
                    It is also the most dangerous one to rely on.
                </p>

                <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 my-8 text-center">
                    <h3 className="text-xl md:text-2xl font-serif text-slate-900 mb-4">The Car Analogy</h3>
                    <div className="flex flex-col md:flex-row justify-center gap-8 md:gap-16 items-center">
                        <div className="space-y-2">
                            <div className="text-4xl">🚙</div>
                            <div className="font-bold text-slate-900">Toyota Camry</div>
                            <div className="text-sm opacity-50">3,500 lbs</div>
                            <div className="text-emerald-600 font-mono">$8.50 / lb</div>
                        </div>
                        <div className="text-2xl opacity-30">VS</div>
                        <div className="space-y-2">
                            <div className="text-4xl">🏎️</div>
                            <div className="font-bold text-slate-900">Ferrari 488</div>
                            <div className="text-sm opacity-50">3,300 lbs</div>
                            <div className="text-emerald-600 font-mono">$90.00 / lb</div>
                        </div>
                    </div>
                    <p className="mt-6 text-sm md:text-base max-w-lg mx-auto">
                        They weigh the same. They both have 4 wheels. But one is a commodity, and one is a high-performance machine.
                        <strong>Square footage is just the "weight" of the house.</strong> It tells you nothing about the quality.
                    </p>
                </div>

                <h3 className="text-2xl text-slate-900 font-serif mt-8 mb-4">What actually drives the cost?</h3>
                <ul className="list-disc pl-6 space-y-4 marker:text-blue-500">
                    <li className="pl-2">
                        <strong className="text-slate-900">Complexity:</strong> A simple box with 4 corners is the cheapest shape to build. Every time you add a corner, a roof valley, or a vault, the price goes up, even if the square footage stays the same.
                    </li>
                    <li className="pl-2">
                        <strong className="text-slate-900">Volume vs. Area:</strong> A room with 20ft ceilings costs twice as much to frame, drywall, paint, and heat as a room with 10ft ceilings, yet on paper, they are the same "100 sq ft" room.
                    </li>
                    <li className="pl-2">
                        <strong className="text-slate-900">Finishes (The Ferrari Factor):</strong> Marble vs. Laminate. Wolf Range vs. GE Stove. Custom Cabinets vs. IKEA. These choices can swing the budget by $200k without changing the size of the house by one inch.
                    </li>
                </ul>

                <p className="mt-8 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm">
                    <strong>Warning:</strong> If a builder gives you a low price per square foot over the phone without seeing your plans, run. They are quoting you a Camry, and you are likely designing a Ferrari.
                </p>
            </div>
        )
    },
    {
        id: 12,
        title: "Quality Over Quantity: Right-Sizing",
        subtitle: "How to design a better home, not just a bigger one.",
        readTime: "6 min read",
        category: "Design",
        gradient: "from-purple-900 to-fuchsia-950",
        icon: Layout,
        stageIds: [3], // Designing
        content: (
            <div className="space-y-6 text-zinc-600 leading-relaxed font-light">
                <p>
                    The average American home has ballooned to over 2,500 sq ft, yet families have gotten smaller.
                    We are building "storage units for people" rather than homes designed for living.
                </p>
                <p>
                    The single best way to maximize your budget is to <strong className="text-slate-900">build less house, but build it better.</strong>
                </p>

                <h3 className="text-2xl text-slate-900 font-serif mt-8 mb-4">The 80/20 Rule of Living</h3>
                <div className="relative pl-6 border-l-2 border-purple-200 my-6">
                    <p className="italic text-lg">
                        "You will spend 80% of your time in 20% of your house."
                    </p>
                </div>
                <p>
                    Think about it. You wake up (Bedroom), go to the Kitchen (Coffee), sit in the Living Room (Relax).
                    That Dining Room? Used twice a year. That Guest Room? Used for 10 days by in-laws.
                </p>
                <p>
                    Instead of building a mediocre 4,000 sq ft house, consider a spectacular 2,800 sq ft house.
                </p>

                <h3 className="text-2xl text-slate-900 font-serif mt-8 mb-4">Unlocking Value</h3>
                <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                        <span><strong>Eliminate Hallways:</strong> Hallways are "dead space" that costs $300/sqft to build but adds zero value to your life. Open plans remove this waste.</span>
                    </li>
                    <li className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                        <span><strong>Flex Rooms:</strong> Don't build a Guest Room AND an Office. Build a fantastic Office with a Murphy bed. Now you have one room that works 365 days a year.</span>
                    </li>
                    <li className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                        <span><strong>Outdoor Living:</strong> A covered patio costs 50% less than an indoor room but makes the house feel twice as big.</span>
                    </li>
                </ul>
            </div>
        )
    },
    {
        id: 13,
        title: "Understanding 'Total All-In Investment'",
        subtitle: "The fuel tank for your entire journey—not just the engine.",
        readTime: "4 min read",
        category: "Budgeting",
        gradient: "from-slate-800 to-black",
        icon: DollarSign,
        stageIds: [0, 1], // Getting Started, Budget
        content: (
            <div className="space-y-6 text-zinc-600 leading-relaxed font-light">
                <p>
                    Building a custom home is an exciting journey, and the first step is understanding your budget.
                    When you think about your budget, it's easy to only picture the house itself—the walls, the roof, the beautiful kitchen.
                </p>
                <p>
                    But building a home is a bit like planning a big vacation. Your total vacation budget doesn't just cover the hotel; it also has to include the plane tickets, the food, and the fun activities that make the trip possible.
                </p>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 my-6">
                    <p className="font-serif text-lg text-slate-900 mb-2">The Fuel Tank Analogy</p>
                    <p className="text-sm text-zinc-600">
                        Think of your <strong>Total All-In Investment</strong> as your project's entire fuel tank. Not all of that fuel goes into the actual construction.
                        A portion of it powers the important steps that happen before we can even break ground.
                    </p>
                </div>

                <h3 className="text-2xl text-slate-900 font-serif mt-8 mb-4">The 4 Pillars of Your Investment</h3>
                <ul className="space-y-4">
                    <li className="flex gap-4 items-start">
                        <div className="min-w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">1</div>
                        <div>
                            <strong className="text-slate-900 block">The Land</strong>
                            <p className="text-sm mt-1">This is the spot where your dream home will live. Whether you already own it or need to buy it, the cost of the land is a big piece of your total investment.</p>
                        </div>
                    </li>
                    <li className="flex gap-4 items-start">
                        <div className="min-w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">2</div>
                        <div>
                            <strong className="text-slate-900 block">The "Soft Costs"</strong>
                            <p className="text-sm mt-1">Imagine these as the blueprints and permissions needed for your journey. This includes architect fees, engineering plans, and city permit fees.</p>
                        </div>
                    </li>
                    <li className="flex gap-4 items-start">
                        <div className="min-w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">3</div>
                        <div>
                            <strong className="text-slate-900 block">The Site Costs</strong>
                            <p className="text-sm mt-1">Getting your land ready for construction. Like preparing the foundation before you build with LEGOs. Clearing trees, leveling ground, and bringing in utilities.</p>
                        </div>
                    </li>
                    <li className="flex gap-4 items-start">
                        <div className="min-w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">4</div>
                        <div>
                            <strong className="text-slate-900 block">The Construction</strong>
                            <p className="text-sm mt-1">The part you've been dreaming of! Foundations, framing, finishes, and fixtures. This is usually about 75-80% of the total pie.</p>
                        </div>
                    </li>
                </ul>

                <p className="mt-8">
                    Our budget calculator is designed to help you see this full picture, so you can plan with confidence and turn your dream home into a reality.
                </p>
            </div>
        )
    }
];

export const CATEGORIES = ['All', 'Strategy', 'Finance', 'Design', 'Legal', 'Construction', 'Budgeting'];
