import { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { BudgetCalculator } from './components/BudgetCalculator';
import { getClientConfig, type ClientConfig } from './config/clients';
import { AdminPage } from './pages/AdminPage';
import { ApplicationPage } from './pages/ApplicationPage';
import { TimelineGenerator } from './pages/TimelineGenerator';
import { AirtableService } from './services/AirtableService';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { AIRTABLE_CONSTANTS } from './config/constants';

function App() {
  const { pathname } = useLocation();
  const slug = pathname.split('/')[1] || '';

  const [client, setClient] = useState<ClientConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadClient = async () => {
      setLoading(true);
      // Use hardcoded Base ID for consistency, fallback to env for older compatibility
      const baseId = AIRTABLE_CONSTANTS.BASE_ID || import.meta.env.VITE_AIRTABLE_BASE_ID;

      if (baseId) {
        // init checks for API key internally from env
        AirtableService.init(baseId);
        try {
          // Skip airtable for 'admin' path to avoid wasted calls
          if (slug.toLowerCase() !== 'admin') {
            const remoteConfig = await AirtableService.getClientBySlug(slug);
            if (remoteConfig) {
              setClient(remoteConfig);
              setLoading(false);
              return;
            }
          }
        } catch (e) {
          console.error("Failed to load remote config", e);
        }
      }

      // Fallback to local file
      setClient(getClientConfig(slug));
      setLoading(false);
    };

    loadClient();
  }, [slug]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-slate-900" size={32} />
          <p className="text-zinc-400 text-sm font-serif">Loading Builder Environment...</p>
        </div>
      </div>
    );
  }

  // Safe check, though fallback ensures it is never null usually
  if (!client) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-purple-200 selection:text-purple-900">

      {/* Header */}
      {/* Hide header on admin page for cleanliness? Or keep it. Keeping it. */}
      {slug !== 'admin' && (
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
              {pathname.includes('/timeline') ? 'Custom Home Timeline Tool' : 'Free Budget Tool'}
            </span>
          </div>
        </div>
      )}

      <div className={`flex-grow ${slug === 'admin' ? 'pt-0' : 'pt-24'} pb-20 px-4 md:px-6`}>
        <div className="container mx-auto">

          <Routes>
            {/* Admin Route */}
            <Route path="/admin" element={<AdminPage />} />

            {/* Legacy Root Redirect (optional logic, but typically / should go to main funnel) */}
            <Route path="/" element={<BudgetCalculator initialClient={client} />} />

            {/* Funnel Routes */}
            {/* 1. Explicit Funnel Paths - Matches /:slug/path */}
            <Route path="/:clientSlug/budget-calculator" element={<BudgetCalculator initialClient={client} />} />
            <Route path="/:clientSlug/application" element={<ApplicationPage client={client} />} />
            <Route path="/:clientSlug/timeline" element={<TimelineGenerator client={client} />} />

            {/* 2. Legacy Redirect - Matches /:slug ONLY (no subpath) */}
            {/* Redirects to Budget Calculator to preserve ad traffic */}
            <Route path="/:clientSlug" element={<Navigate to={`/${slug}/budget-calculator`} replace />} />
          </Routes>

        </div>
      </div>

      {slug !== 'admin' && (
        <footer className="py-8 text-center text-slate-400 text-xs">
          <p>&copy; {new Date().getFullYear()} BuildSurge Collectives LLC. All rights reserved.</p>
        </footer>
      )}
    </div>
  );
}

export default App;
