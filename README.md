# Client-LP: The Ultimate Custom Home Budget Calculator & Lead Magnet

**Client-LP** is a high-performance, React-based lead generation tool designed specifically for Custom Home Builders. It goes beyond simple contact forms by offering tangible value to prospective clients: a detailed, realistic budget breakdown and an "AI-generated" project roadmap.

This tool builds trust, positions the builder as an expert, and pre-qualifies leads by educating them on the financial realities of custom home building before they ever book a call.

## 🚀 Key Features

### 1. Reverse-Engineering Budget Logic
Most calculators ask "How much does your house cost?". This calculator asks **"What is your total budget?"** and primarily works backward to tell the client what they can afford to build ($ per sq ft).
-   **Input**: Total Investment, Land Cost, Target Size.
-   **Logic**: Automatically deducts Land and Soft Costs first.
-   **Output**: The remaining "Hard Construction Budget" and the resulting **Construction Power** (Cost per Sq Ft).

### 2. Granular Soft Cost Analysis
The calculator doesn't just guess soft costs. It intelligently asks about the project status to refine the numbers:
-   **Land Status**: Owned vs. Needed (Dynamic Land Cost Slider).
-   **Design Plans**: Do they exist? (Adjusts Architectural fees).
-   **Engineering**: Is it done? (Adjusts Engineering fees).
-   **Utilities**: Is the lot developed? (Adjusts Site Work/Impact fees).
*Result: A highly accurate "Soft Cost" bucket that educating clients on where their money goes.*

### 3. Market-Aware Feasibility Gauge
The system validates the user's budget against real-world market data for their selected city.
-   **Unrealistic**: Budget is below market minimums.
-   **Tight**: Budget is workable but requires strict scope control.
-   **Good**: Healthy budget for a custom home.
-   **Luxury**: High-end budget allowing for premium finishes.

### 4. "Smart Agent" Report Engine (`ReportGenerator.ts`)
After lead capture, the system runs a deterministic "AI" analysis of the user's specific situation to generate a personalized project roadmap.
-   **Scenario Detection**: Identifies if the user is stuck at Land Acquisition, Design, Engineering, or is Ready to Build.
-   **Personalized Copy**: Greets the user by name and references their specific budget and city.
-   **Tailored Advice**:
    -   *If Unrealistic*: Suggests value engineering and scope reduction.
    -   *If No Land*: Advises on land feasibility and acquisition.
    -   *If Ready*: Encourages moving to a hard bid.

### 5. Dynamic Calls-to-Action (CTA) & Booking
The Call-to-Action button adapts to the report's conclusion:
-   **"Start Your Land Search"** (for users without land).
-   **"Schedule Design Consultation"** (for users needing plans).
-   **"Discuss Engineering Strategy"** (for users with plans but no permits).
-   **"Request Construction Bid"** (for ready-to-build users).

**Conversion Feature**: Clicking the CTA seamlessly reveals an **inline booking calendar**, keeping the user on the page while offering a direct path to a meeting.

---

## 🛠 Technical Architecture

This project is built with a modern stack optimized for speed and user experience:

-   **Framework**: React (Vite)
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS
-   **Animation**: Framer Motion (for smooth sliders, modals, and report reveals)
-   **Routing**: React Router DOM (Single Page App structure)

### Core Files

-   `src/components/BudgetCalculator.tsx`: The heart of the application. Manages all UI state, lead capture modal, and orchestrates the report generation.
-   `src/services/BudgetLogic.ts`: Pure functional logic for all financial calculations. Validated against industry standards for soft cost percentages.
-   `src/services/ReportGenerator.ts`: The "Brain" of the operation. Contains the logic to map project states to specific advice, urgency levels, and CTAs.
-   `src/services/LocationCostService.ts`: Handles market data retrieval (extensible to an API).

---

## 💡 The "Why" (Deliverables)

For the Builder/Agency, this tool delivers:
1.  **High-Quality Leads**: You get data on their **Budget, Land Status, Design Status, and Timeline** before you speak.
2.  **Trust & Authority**: You give them valuable financial clarity for free, establishing yourself as the honest guide.
3.  **Efficiency**: The "Unrealistic" feasibility status gently educates clients who can't afford you, saving your sales team from bad calls.
4.  **Booking Automation**: The integrated calendar removes friction from the "Interest" to "Meeting" conversion step.

## 📦 Setup & Deployment

1.  **Install Dependencies**: `npm install`
2.  **Run Development**: `npm run dev`
3.  **Build for Production**: `npm run build`

*Designed to be deployed on Vercel/Netlify as a standalone Landing Page or embedded submodule.*
