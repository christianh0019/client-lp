import { Routes, Route, useLocation } from 'react-router-dom';
import { BudgetCalculator } from './components/BudgetCalculator';
import { getClientConfig } from './config/clients';
import { CheckCircle2 } from 'lucide-react';

function App() {
  const { pathname } = useLocation();
  // Extract slug from path: /slug/... -> slug
  // Default to '' if root
  const slug = pathname.split('/')[1];
  const client = getClientConfig(slug);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-purple-200 selection:text-purple-900">

      {/* Header */}
      <div className="w-full bg-white border-b border-slate-100 py-4 px-6 fixed top-0 z-50">
        <div className="container mx-auto flex justify-between items-center text-sm font-bold text-slate-900">
          <div className="flex items-center gap-2">
            {/* Dynamic Logo */}
            {client.logo ? (
              <img
                src={client.logo}
                alt={client.name}
                className="h-8 md:h-10 w-auto object-contain"
              />
            ) : (
              <>
                <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-serif">B</div>
                <span className="text-xl font-serif tracking-tight">BuilderProject</span>
              </>
            )}
          </div>
          <span className="text-green-600 flex items-center gap-2">
            <CheckCircle2 size={16} />
            Free Budget Tool
          </span>
        </div>
      </div>

      <div className="flex-grow pt-24 pb-20 px-4 md:px-6">
        <div className="container mx-auto">

          <Routes>
            <Route path="/" element={<BudgetCalculator />} />
            <Route path="/:clientSlug" element={<BudgetCalculator />} />
          </Routes>

        </div>
      </div>

      <footer className="py-8 text-center text-slate-400 text-xs">
        <p>&copy; {new Date().getFullYear()} BuildSurge Collectives LLC. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
