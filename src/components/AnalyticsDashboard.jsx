import React, { useState } from 'react';

// Mock data representing the exact output from the Supabase views:
// SELECT * FROM public.v_wizard_conversion_funnel;
const mockFunnelData = [
  { step: 1, name: "Step 1: Property Profile", views: 1240, completions: 1180, retention_rate: 95.1, drop_off_rate: 4.9, description: "Select house type and starting BER" },
  { step: 2, name: "Step 2: Carbon Tax Slider", views: 1180, completions: 920, retention_rate: 77.9, drop_off_rate: 22.1, description: "Calculate fuel exposure and tax penalties" },
  { step: 3, name: "Step 3: Vision Scanner", views: 920, completions: 610, retention_rate: 66.3, drop_off_rate: 33.7, description: "Upload boiler, attic, or heating photo" },
  { step: 4, name: "Step 4: Grant Estimator", views: 610, completions: 580, retention_rate: 95.0, drop_off_rate: 5.0, description: "View SEAI grant and property equity surges" },
  { step: 5, name: "Step 5: Stripe Checkout", views: 580, completions: 128, retention_rate: 22.1, drop_off_rate: 77.9, description: "Click Order Assessment and pay €49" }
];

// SELECT * FROM public.v_wizard_dropoff_bottlenecks;
const mockBottlenecks = [
  { step: 5, name: "Step 5: Stripe Checkout", raw_drop_offs: 452, loss_percentage: 77.9, severity: "High", fix: "Introduce testimonial badges and highlight Joe's 100% Conflict-Free Guarantee right above the checkout CTA." },
  { step: 3, name: "Step 3: Vision Scanner", raw_drop_offs: 310, loss_percentage: 33.7, severity: "Medium", fix: "Ensure users understand they can skip the photo upload if they do not have a boiler image handy." },
  { step: 2, name: "Step 2: Carbon Tax Slider", raw_drop_offs: 260, loss_percentage: 22.1, severity: "Low", fix: "Simplify the annual kerosene spending categories so users don't guess their bills." }
];

const mockDevices = {
  mobile: { count: 892, percentage: 71.9, label: "Mobile Port (100dvh)" },
  desktop: { count: 298, percentage: 24.0, label: "Desktop Grid (lg:grid-cols-2)" },
  tablet: { count: 50, percentage: 4.1, label: "Tablet Frame" }
};

export default function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState('overview'); // overview | sql
  const [filterDevice, setFilterDevice] = useState('all');

  // Overall Statistics
  const totalSessions = 1240;
  const totalConversions = 128;
  const overallConversionRate = ((totalConversions / totalSessions) * 100).toFixed(1);
  const totalDropOffs = totalSessions - totalConversions;
  const totalAbandonmentRate = ((totalDropOffs / totalSessions) * 100).toFixed(1);

  // SQL queries to display in the developer console helper tab
  const sqlQueries = {
    conversionFunnel: `
-- Aggregates Step 1 to Step 5 retention percentages and overall conversion rate
CREATE OR REPLACE VIEW public.v_wizard_conversion_funnel AS
WITH step_counts AS (
  SELECT 
    step,
    COUNT(DISTINCT session_id) AS raw_users,
    COUNT(DISTINCT CASE WHEN action = 'step_completed' THEN session_id END) AS completed_users
  FROM public.wizard_funnel_events
  GROUP BY step
)
SELECT 
  step,
  raw_users AS views,
  completed_users AS completions,
  ROUND((completed_users::numeric / NULLIF(raw_users, 0)) * 100, 1) AS retention_rate,
  ROUND(((raw_users - completed_users)::numeric / NULLIF(raw_users, 0)) * 100, 1) AS drop_off_rate
FROM step_counts
ORDER BY step ASC;
    `.trim(),
    dropoffs: `
-- Flags specific steps where users hesitate or abandon the modal questionnaire
CREATE OR REPLACE VIEW public.v_wizard_dropoff_bottlenecks AS
SELECT 
  step,
  (views - completions) AS raw_drop_offs,
  drop_off_rate AS loss_percentage,
  CASE 
    WHEN drop_off_rate >= 50 THEN 'High'
    WHEN drop_off_rate >= 20 THEN 'Medium'
    ELSE 'Low'
  END AS severity
FROM public.v_wizard_conversion_funnel
WHERE (views - completions) > 0
ORDER BY raw_drop_offs DESC;
    `.trim()
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-900 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">EcoSmartHome Admin</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Onboarding Funnel Analytics</h1>
            <p className="text-sm text-slate-400">Privacy-first, zero-latency telemetry dashboard for Joe's €49 Roadmap conversions.</p>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center bg-slate-900 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeTab === 'overview' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Overview Console
            </button>
            <button
              onClick={() => setActiveTab('sql')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeTab === 'sql' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Supabase SQL Views
            </button>
          </div>
        </div>

        {activeTab === 'overview' ? (
          <>
            {/* KPI Metrics Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Total Funnel Sessions</span>
                <span className="text-2xl sm:text-3xl font-black text-white">{totalSessions.toLocaleString()}</span>
                <span className="text-xs text-slate-500 block mt-1">Unique anonymous IDs</span>
              </div>
              <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Stripe Conversions</span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-400">{totalConversions.toLocaleString()}</span>
                <span className="text-xs text-emerald-500 font-semibold block mt-1">€{(totalConversions * 49).toLocaleString()} gross revenue</span>
              </div>
              <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Conversion Rate</span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-400">{overallConversionRate}%</span>
                <span className="text-xs text-slate-500 block mt-1">Elite target: &gt;8% threshold</span>
              </div>
              <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Abandonment Rate</span>
                <span className="text-2xl sm:text-3xl font-black text-amber-500">{totalAbandonmentRate}%</span>
                <span className="text-xs text-slate-500 block mt-1">Cumulative loss before Stripe</span>
              </div>
            </div>

            {/* Main Visualizations Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Funnel Chart Card - Take up 2 columns */}
              <div className="lg:col-span-2 bg-slate-900/30 border border-slate-900 p-6 rounded-2xl flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-extrabold text-white mb-1.5">Conversion Funnel Progression</h3>
                  <p className="text-xs text-slate-400 mb-6">Visual tracking of user progression metrics from initial state entry to order completion.</p>
                  
                  {/* CSS-Based Horizontal Stack Funnel */}
                  <div className="space-y-5">
                    {mockFunnelData.map((step) => {
                      // Calculate width proportion relative to step 1
                      const stepWidth = (step.views / totalSessions) * 100;
                      return (
                        <div key={step.step} className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-200">
                              <span className="text-emerald-500 mr-1">#{step.step}</span> {step.name}
                            </span>
                            <span className="text-slate-400 font-mono">
                              <strong>{step.completions}</strong> completed / {step.views} views ({step.retention_rate}% keep)
                            </span>
                          </div>
                          <div className="w-full bg-slate-950 h-5 rounded-lg overflow-hidden border border-slate-900 flex">
                            <div 
                              className={`h-full transition-all duration-500 ${
                                step.step === 5 ? 'bg-gradient-to-r from-emerald-600 to-emerald-500' : 'bg-slate-800'
                              }`} 
                              style={{ width: `${stepWidth}%` }}
                            />
                            {step.drop_off_rate > 0 && (
                              <div 
                                className="h-full bg-red-500/10 border-l border-red-500/20" 
                                style={{ width: `${100 - stepWidth}%` }}
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-8 bg-slate-950/60 p-4 rounded-xl border border-slate-900 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                    💡
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    <strong>Conversion Audit Note:</strong> Steps 1, 2 and 4 display exceptionally strong retention profiles (&gt;75%). Friction is heavily isolated inside <strong>Step 3 (Multimodal photo uploads)</strong> and <strong>Step 5 (Checkout landing)</strong>.
                  </p>
                </div>
              </div>

              {/* Sidebar: Device Breakdown & Quick Insights */}
              <div className="space-y-6">
                
                {/* Device breakdown card */}
                <div className="bg-slate-900/30 border border-slate-900 p-6 rounded-2xl">
                  <h3 className="text-lg font-extrabold text-white mb-1.5">Device Segmentation</h3>
                  <p className="text-xs text-slate-400 mb-6">Telemetry device source parsing to verify responsive sizing priorities.</p>
                  
                  <div className="space-y-4">
                    {Object.entries(mockDevices).map(([key, data]) => (
                      <div key={key} className="space-y-1">
                        <div className="flex justify-between items-center text-xs font-semibold">
                          <span className="text-slate-300 capitalize">{key} ({data.label})</span>
                          <span className="text-white">{data.percentage}%</span>
                        </div>
                        <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-emerald-500 h-full rounded-full" 
                            style={{ width: `${data.percentage}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono block">
                          {data.count} recorded sessions
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Performance telemetry check card */}
                <div className="bg-slate-900/30 border border-slate-900 p-6 rounded-2xl">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Edge Ingestion Telemetry</h3>
                  <div className="space-y-3.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Ingestion Path</span>
                      <span className="font-mono text-emerald-400 text-[10px] bg-slate-950 px-2 py-0.5 rounded border border-slate-900">/api/analytics/track-step</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Server Response Time</span>
                      <span className="font-bold text-white">0.4 ms (204 No Content)</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Ingestion Method</span>
                      <span className="font-bold text-slate-300">navigator.sendBeacon</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">GDPR Compliance</span>
                      <span className="text-emerald-400 font-bold">100% Compliant (No Cookies)</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Bottom Bottlenecks & Strategic Recommendations Panel */}
            <div className="bg-slate-900/30 border border-slate-900 p-6 rounded-2xl">
              <h3 className="text-lg font-extrabold text-white mb-1.5">Drop-off Hotspots & Actionable Fixes</h3>
              <p className="text-xs text-slate-400 mb-6">Database aggregated bottlenecks from view `v_wizard_dropoff_bottlenecks` cross-referenced with conversion suggestions.</p>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-900 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Step & Name</th>
                      <th className="py-3 px-4">Raw User Drop-offs</th>
                      <th className="py-3 px-4">Step Loss Percentage</th>
                      <th className="py-3 px-4">Severity Rating</th>
                      <th className="py-3 px-4">Strategic Recommendation & Fix</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900 text-xs">
                    {mockBottlenecks.map((item) => (
                      <tr key={item.step} className="hover:bg-slate-900/10 transition-colors">
                        <td className="py-4 px-4 font-bold text-white">{item.name}</td>
                        <td className="py-4 px-4 font-mono text-slate-300">{item.raw_drop_offs} users</td>
                        <td className="py-4 px-4 font-bold text-slate-200">{item.loss_percentage}%</td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            item.severity === 'High' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                            item.severity === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          }`}>
                            {item.severity}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-slate-400 leading-relaxed max-w-sm">{item.fix}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          /* SQL Queries Code View Tab */
          <div className="bg-slate-900/30 border border-slate-900 p-6 rounded-2xl space-y-6">
            <div>
              <h3 className="text-lg font-extrabold text-white mb-1">Supabase database SQL Schema Views</h3>
              <p className="text-xs text-slate-400">Joe or your developers can run these pre-compiled SQL queries directly inside Supabase to rebuild these visual views.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">1. Funnel Conversion View Script</span>
                <pre className="p-4 bg-slate-950 rounded-xl border border-slate-900 text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed max-h-[300px]">
                  {sqlQueries.conversionFunnel}
                </pre>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">2. Drop-off Bottlenecks View Script</span>
                <pre className="p-4 bg-slate-950 rounded-xl border border-slate-900 text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed max-h-[300px]">
                  {sqlQueries.dropoffs}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Footer */}
        <footer className="text-center pt-6 border-t border-slate-900">
          <p className="text-[10px] text-slate-600 font-semibold tracking-wider uppercase">
            EcoSmartHome IE • TELEMETRY SHIELD ENGINE v1.0.0 • CONFIDENTIAL ADMIN CONSOLE
          </p>
        </footer>

      </div>
    </div>
  );
}
