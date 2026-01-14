"use client";

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f8fafc,_#e2e8f0)] text-[#0f172a] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl bg-white/90 backdrop-blur rounded-3xl shadow-2xl border border-white/70 px-8 py-12 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--accent-1)]/10 text-[var(--accent-1)] text-4xl font-bold mb-6 animate-spin-slow">
          ⚙️
        </div>
        <p className="uppercase tracking-[0.3em] text-xs font-semibold text-slate-400 mb-3">
          Scheduled Maintenance
        </p>
        <h1 className="text-4xl md:text-5xl font-semibold leading-tight text-slate-900 mb-4">
          We are polishing things up
        </h1>
        <p className="text-base md:text-lg text-slate-600 mb-8">
          Our team is making things better right now. Thanks for sticking with us—we’ll be back shortly.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => window.location.href = "/coach/dashboard"}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[var(--accent-1)] text-white font-semibold transition hover:opacity-90 shadow-lg shadow-[var(--accent-1)]/30"
          >
            Refresh Page
          </button>
          <button
            onClick={() => window.location.href = "mailto:support@wellnessz.com"}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-slate-200 text-slate-600 font-semibold transition hover:bg-slate-100"
          >
            Contact Support
          </button>
        </div>
        <p className="mt-8 text-xs text-slate-400 tracking-wide">
          Thank you for your patience 💛
        </p>
      </div>
    </div>
  );
}

