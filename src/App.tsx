import { useState } from 'react';
import SurveyForm from './components/SurveyForm';
import { BudgetCalculator } from './components/BudgetCalculator';
import { CheckCircle2 } from 'lucide-react';

function App() {
  const [unlocked, setUnlocked] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-purple-200 selection:text-purple-900">

      {/* Header */}
      <div className="w-full bg-white border-b border-slate-100 py-4 px-6 fixed top-0 z-50">
        <div className="container mx-auto flex justify-between items-center text-sm font-bold text-slate-900">
          <div className="flex items-center gap-2">
            {/* Logo placeholder */}
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-serif">B</div>
            <span className="text-xl font-serif tracking-tight">BuilderProject</span>
          </div>
          <span className="text-green-600 flex items-center gap-2">
            <CheckCircle2 size={16} />
            Free Budget Tool
          </span>
        </div>
      </div>

      <div className="flex-grow pt-24 pb-20 px-4 md:px-6">
        <div className="container mx-auto">

          {!unlocked ? (
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12 animate-fadeIn">
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-6 leading-tight">
                  Calculate Your Custom Home Budget <br className="hidden md:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-pink-600">
                    In Seconds
                  </span>
                </h1>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                  Stop guessing. Use our AI-powered calculator to get real-time cost estimates based on your local market data. Answer 4 quick questions to unlock the tool.
                </p>
              </div>

              <SurveyForm onComplete={() => setUnlocked(true)} />
            </div>
          ) : (
            <BudgetCalculator />
          )}

        </div>
      </div>

      <footer className="py-8 text-center text-slate-400 text-xs">
        <p>&copy; {new Date().getFullYear()} BuildSurge Collectives LLC. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
