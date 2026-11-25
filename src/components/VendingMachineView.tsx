import { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Banknote,
  CheckCircle2,
  PackageCheck,
  RotateCcw,
  ShoppingBag,
  Trash2,
} from 'lucide-react';
import {
  ACCEPTED_DENOMINATIONS,
  VendingMachine,
  formatRupiah,
  type DrinkId,
  type DrinkItem,
  type OperationResult,
  type VendingMachineSnapshot,
} from '../models/VendingMachine';
import { DrinkArtwork } from './DrinkArtwork';

interface VendingMachineViewProps {
  resetSignal: number;
}

export function VendingMachineView({ resetSignal }: VendingMachineViewProps) {
  const machineRef = useRef<VendingMachine>(new VendingMachine());
  const [snapshot, setSnapshot] = useState<VendingMachineSnapshot>(() =>
    machineRef.current.getSnapshot()
  );
  const [feedback, setFeedback] = useState<{
    tone: 'neutral' | 'success' | 'error';
    text: string;
  }>({
    tone: 'neutral',
    text: 'Masukkan pecahan uang (Rp 2.000, Rp 5.000, Rp 10.000, atau Rp 20.000), lalu pilih minuman.',
  });
  const [dispensedItem, setDispensedItem] = useState<{
    drink: DrinkItem;
    change: number;
  } | null>(null);

  const syncFromMachine = (result: OperationResult) => {
    setSnapshot(machineRef.current.getSnapshot());
    setFeedback({
      tone: result.ok ? 'success' : 'error',
      text: result.message,
    });
  };

  useEffect(() => {
    if (resetSignal === 0) return;
    const res = machineRef.current.resetMachine();
    setDispensedItem(null);
    syncFromMachine(res);
  }, [resetSignal]);

  const handleInsertMoney = (amount: number) => {
    const res = machineRef.current.insertMoney(amount);
    syncFromMachine(res);
  };

  const handleBuyDrink = (drinkId: DrinkId) => {
    const res = machineRef.current.buyDrink(drinkId);
    if (res.ok && res.dispensedDrink) {
      setDispensedItem({
        drink: res.dispensedDrink,
        change: res.change ?? 0,
      });
    }
    syncFromMachine(res);
  };

  const handleRefund = () => {
    const res = machineRef.current.refund();
    syncFromMachine(res);
  };

  const handleRestock = (drinkId: DrinkId, qty: number) => {
    const res = machineRef.current.restockDrink(drinkId, qty);
    syncFromMachine(res);
  };

  const handleEmptyStock = (drinkId: DrinkId) => {
    const res = machineRef.current.emptyDrinkStock(drinkId);
    syncFromMachine(res);
  };

  const handleResetAll = () => {
    const res = machineRef.current.resetMachine();
    setDispensedItem(null);
    syncFromMachine(res);
  };

  const outOfStockNames = snapshot.outOfStockDrinks.map((d) => d.name);

  return (
    <section aria-label="Simulator Mesin Vending" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 text-balance">
            Mesin Vending Minuman
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Implementasi class <span className="font-mono text-slate-800">VendingMachine</span> dengan
            validasi pecahan uang, perhitungan kembalian, dan deteksi stok habis.
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetAll}
          className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0 self-start md:self-auto"
        >
          <RotateCcw className="w-4 h-4" />
          Reset Mesin
        </button>
      </div>

      {/* Out-of-Stock Detection Banner */}
      {outOfStockNames.length > 0 ? (
        <div
          role="alert"
          className="flex items-start sm:items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-950"
        >
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5 sm:mt-0" />
          <div className="text-sm">
            <span className="font-semibold">Deteksi Stok Habis:</span>{' '}
            <span>{outOfStockNames.join(', ')} saat ini stoknya habis (0 unit).</span>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950">
          <PackageCheck className="w-5 h-5 text-emerald-700 shrink-0" />
          <div className="text-sm">
            <span className="font-semibold">Status Stok Mesin:</span> Semua 3 jenis minuman tersedia
            dan siap dibeli.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Vending Machine Showcase Cabinet */}
        <div className="lg:col-span-7 bg-slate-900 text-white rounded-2xl border border-slate-800 p-5 sm:p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Etalase Minuman</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Tersedia 3 minuman · Pilih item untuk membeli
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400">Saldo Saat Ini</div>
              <div className="text-lg font-bold font-mono text-teal-400">
                {formatRupiah(snapshot.balance)}
              </div>
            </div>
          </div>

          {/* 3 Drink Slots */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {snapshot.drinks.map((drink) => {
              const isOut = drink.stock <= 0;
              const isAffordable = snapshot.balance >= drink.price;
              const canBuy = !isOut && isAffordable;

              return (
                <div
                  key={drink.id}
                  className={`rounded-xl border p-4 flex flex-col justify-between transition-colors ${
                    isOut
                      ? 'bg-slate-950/60 border-rose-900/70'
                      : canBuy
                        ? 'bg-slate-800/90 border-teal-500/60'
                        : 'bg-slate-800/60 border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                    <span className="font-mono font-semibold text-slate-300">{drink.code}</span>
                    <span>{drink.volume}</span>
                  </div>

                  <div className="flex flex-col items-center py-3">
                    <DrinkArtwork drinkId={drink.id} outOfStock={isOut} className="w-16 h-24" />
                  </div>

                  <div className="mt-3 space-y-3">
                    <div>
                      <h3 className="text-base font-semibold text-white">{drink.name}</h3>
                      <p className="text-sm font-mono font-semibold text-teal-400 mt-0.5">
                        {formatRupiah(drink.price)}
                      </p>
                    </div>

                    {/* Stock Status Line */}
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-700/70">
                      <span className="text-slate-400">Ketersediaan</span>
                      {isOut ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-rose-400">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Stok Habis
                        </span>
                      ) : (
                        <span className="font-mono font-medium text-slate-200">
                          {drink.stock} / {drink.maxStock}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleBuyDrink(drink.id)}
                      className={`w-full min-h-[44px] px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
                        isOut
                          ? 'bg-rose-950/80 text-rose-300 border border-rose-800 hover:bg-rose-900/80'
                          : canBuy
                            ? 'bg-teal-600 hover:bg-teal-500 text-white'
                            : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                      }`}
                    >
                      {isOut
                        ? 'Stok Habis'
                        : canBuy
                          ? 'Beli Minuman'
                          : `Kurang ${formatRupiah(drink.price - snapshot.balance)}`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dispense Tray */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between gap-4 mb-2">
              <span className="text-xs font-medium text-slate-400">Kotak Pengambilan Minuman</span>
              {dispensedItem && (
                <button
                  type="button"
                  onClick={() => setDispensedItem(null)}
                  className="text-xs font-medium text-teal-400 hover:text-teal-300 underline"
                >
                  Ambil Minuman
                </button>
              )}
            </div>

            {dispensedItem ? (
              <div className="flex items-center gap-4 py-2">
                <DrinkArtwork drinkId={dispensedItem.drink.id} className="w-10 h-14 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white">
                    {dispensedItem.drink.name} siap diambil
                  </p>
                  <p className="text-xs font-mono text-slate-400 mt-0.5">
                    Harga: {formatRupiah(dispensedItem.drink.price)} · Kembalian:{' '}
                    <span className="text-teal-400 font-semibold">
                      {formatRupiah(dispensedItem.change)}
                    </span>
                  </p>
                </div>
                <ShoppingBag className="w-5 h-5 text-teal-400 shrink-0" />
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-3">
                Belum ada minuman yang dikeluarkan. Pilih minuman setelah memasukkan uang.
              </p>
            )}
          </div>
        </div>

        {/* Right: Money Insertion, LED Status, & Stock Tester */}
        <div className="lg:col-span-5 space-y-6">
          {/* LED Display & Feedback */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="text-xs text-slate-500">Saldo Masuk</div>
                <div className="text-2xl font-bold font-mono text-slate-900 mt-0.5">
                  {formatRupiah(snapshot.balance)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500">Total Penjualan</div>
                <div className="text-lg font-semibold font-mono text-slate-700 mt-1">
                  {formatRupiah(snapshot.totalRevenue)}
                </div>
              </div>
            </div>

            <div
              role="status"
              className={`flex items-start gap-2.5 p-3.5 rounded-xl text-sm border ${
                feedback.tone === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : feedback.tone === 'error'
                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              {feedback.tone === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : feedback.tone === 'error' ? (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              ) : (
                <Banknote className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              )}
              <span>{feedback.text}</span>
            </div>

            {/* Accepted Denominations */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">Masukkan Uang</h3>
                <span className="text-xs text-slate-500">Pecahan valid</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {ACCEPTED_DENOMINATIONS.map((denom) => (
                  <button
                    key={denom}
                    type="button"
                    onClick={() => handleInsertMoney(denom)}
                    className="min-h-[44px] px-3 py-2.5 rounded-lg bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-500 text-slate-900 font-mono text-sm font-semibold flex items-center justify-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                  >
                    <Banknote className="w-4 h-4 text-teal-600" />
                    {formatRupiah(denom)}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleRefund}
                  disabled={snapshot.balance <= 0}
                  className="min-h-[40px] px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-45 disabled:cursor-not-allowed transition-colors"
                >
                  Kembalikan Saldo
                </button>

                <button
                  type="button"
                  onClick={() => handleInsertMoney(1000)}
                  className="min-h-[40px] px-3 py-1.5 text-xs font-medium rounded-lg text-slate-600 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                >
                  Uji Pecahan Rp 1.000 (Ditolak)
                </button>
              </div>
            </div>
          </div>

          {/* Operator Stock Controls for testing Out-of-Stock detection */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Kelola &amp; Simulasi Stok</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Uji deteksi stok habis atau isi ulang minuman pada mesin.
              </p>
            </div>

            <div className="divide-y divide-slate-100">
              {snapshot.drinks.map((drink) => (
                <div
                  key={drink.id}
                  className="py-2.5 flex items-center justify-between gap-3 text-sm"
                >
                  <div className="min-w-0">
                    <div className="font-medium text-slate-900">{drink.name}</div>
                    <div className="text-xs font-mono text-slate-500">
                      Stok: {drink.stock} {drink.stock === 0 ? '(Habis)' : 'unit'}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleRestock(drink.id, 1)}
                      disabled={drink.stock >= drink.maxStock}
                      className="min-h-[36px] px-2.5 py-1 text-xs font-medium rounded-md border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40"
                    >
                      +1
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEmptyStock(drink.id)}
                      disabled={drink.stock === 0}
                      title={`Kosongkan stok ${drink.name}`}
                      className="min-h-[36px] px-2.5 py-1 text-xs font-medium rounded-md border border-rose-200 text-rose-700 hover:bg-rose-50 disabled:opacity-40 inline-flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Habiskan
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Log */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Riwayat Aktivitas Mesin</h3>
              <span className="text-xs font-mono text-slate-400">
                {snapshot.logs.length} catatan
              </span>
            </div>

            {snapshot.logs.length === 0 ? (
              <p className="text-xs text-slate-500 py-2">
                Belum ada transaksi. Masukkan uang untuk memulai.
              </p>
            ) : (
              <ul className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {snapshot.logs.map((log) => (
                  <li
                    key={log.id}
                    className="text-xs flex items-start gap-2.5 py-1.5 border-b border-slate-100 last:border-b-0"
                  >
                    <span className="font-mono text-slate-400 shrink-0">{log.timestamp}</span>
                    <span
                      className={
                        log.type === 'error'
                          ? 'text-rose-700 font-medium'
                          : log.type === 'purchase'
                            ? 'text-emerald-700 font-medium'
                            : 'text-slate-700'
                      }
                    >
                      {log.message}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
