import { useState } from 'react';
import { VendingMachineView } from './components/VendingMachineView';

export default function App() {
  const [resetSignal, setResetSignal] = useState(0);

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-slate-900">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          <span className="text-lg font-bold tracking-tight text-slate-900 font-display whitespace-nowrap shrink-0">
            Mesin Vending
          </span>

          <nav aria-label="Navigasi Project 12" className="hidden sm:flex items-center gap-6 text-sm text-slate-600">
            <span className="whitespace-nowrap shrink-0">Soal 12 · Class VendingMachine</span>
          </nav>

          <button
            type="button"
            onClick={() => setResetSignal((prev) => prev + 1)}
            className="min-h-[40px] px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            Reset Mesin
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        <VendingMachineView resetSignal={resetSignal} />
      </main>
    </div>
  );
}
