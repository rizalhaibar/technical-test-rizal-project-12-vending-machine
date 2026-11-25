export type DrinkId = 'aqua' | 'teh-botol' | 'pocari-sweat';

export const ACCEPTED_DENOMINATIONS = [2000, 5000, 10000, 20000] as const;
export type AcceptedDenomination = (typeof ACCEPTED_DENOMINATIONS)[number];

export interface DrinkItem {
  id: DrinkId;
  code: string;
  name: string;
  volume: string;
  price: number;
  stock: number;
  maxStock: number;
}

export interface TransactionLog {
  id: string;
  timestamp: string;
  type: 'insert' | 'purchase' | 'refund' | 'error' | 'restock';
  message: string;
  amount?: number;
}

export interface OperationResult {
  ok: boolean;
  message: string;
  change?: number;
  dispensedDrink?: DrinkItem;
}

export interface VendingMachineSnapshot {
  drinks: DrinkItem[];
  balance: number;
  totalRevenue: number;
  outOfStockDrinks: DrinkItem[];
  logs: TransactionLog[];
}

export function formatRupiah(amount: number): string {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

/**
 * Class VendingMachine
 * Mengelola 1 mesin vending machine dengan 3 pilihan minuman:
 * - Aqua (Rp 5.000)
 * - Teh Botol (Rp 7.000)
 * - Pocari Sweat (Rp 10.000)
 * Menerima pecahan: 2.000, 5.000, 10.000, 20.000
 * Mendeteksi ketersediaan stok dan status stok habis.
 */
export class VendingMachine {
  private drinks: Map<DrinkId, DrinkItem>;
  private balance: number;
  private totalRevenue: number;
  private logs: TransactionLog[];

  constructor(initialStock?: Partial<Record<DrinkId, number>>) {
    const defaultDrinks: DrinkItem[] = [
      {
        id: 'aqua',
        code: 'A1',
        name: 'Aqua',
        volume: '600 ml',
        price: 5000,
        stock: initialStock?.aqua ?? 5,
        maxStock: 8,
      },
      {
        id: 'teh-botol',
        code: 'B1',
        name: 'Teh Botol',
        volume: '450 ml',
        price: 7000,
        stock: initialStock?.['teh-botol'] ?? 4,
        maxStock: 8,
      },
      {
        id: 'pocari-sweat',
        code: 'C1',
        name: 'Pocari Sweat',
        volume: '500 ml',
        price: 10000,
        stock: initialStock?.['pocari-sweat'] ?? 2,
        maxStock: 8,
      },
    ];

    this.drinks = new Map(defaultDrinks.map((drink) => [drink.id, { ...drink }]));
    this.balance = 0;
    this.totalRevenue = 0;
    this.logs = [];
  }

  private pushLog(type: TransactionLog['type'], message: string, amount?: number): void {
    const now = new Date();
    const timestamp = now.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    this.logs.unshift({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp,
      type,
      message,
      amount,
    });

    if (this.logs.length > 20) {
      this.logs = this.logs.slice(0, 20);
    }
  }

  public isValidDenomination(amount: number): amount is AcceptedDenomination {
    return (ACCEPTED_DENOMINATIONS as readonly number[]).includes(amount);
  }

  public insertMoney(amount: number): OperationResult {
    if (!this.isValidDenomination(amount)) {
      const message = `Pecahan ${formatRupiah(amount)} ditolak. Mesin hanya menerima Rp 2.000, Rp 5.000, Rp 10.000, atau Rp 20.000.`;
      this.pushLog('error', message, amount);
      return { ok: false, message };
    }

    this.balance += amount;
    const message = `Uang masuk ${formatRupiah(amount)}. Total saldo: ${formatRupiah(this.balance)}.`;
    this.pushLog('insert', message, amount);
    return { ok: true, message };
  }

  public isOutOfStock(drinkId: DrinkId): boolean {
    const drink = this.drinks.get(drinkId);
    if (!drink) {
      return true;
    }
    return drink.stock <= 0;
  }

  public getOutOfStockDrinks(): DrinkItem[] {
    return Array.from(this.drinks.values())
      .filter((drink) => drink.stock <= 0)
      .map((drink) => ({ ...drink }));
  }

  public hasAnyOutOfStock(): boolean {
    return this.getOutOfStockDrinks().length > 0;
  }

  public buyDrink(drinkId: DrinkId): OperationResult {
    const drink = this.drinks.get(drinkId);
    if (!drink) {
      const message = 'Minuman tidak ditemukan di mesin.';
      this.pushLog('error', message);
      return { ok: false, message };
    }

    if (this.isOutOfStock(drinkId)) {
      const message = `Stok ${drink.name} sedang habis! Silakan pilih minuman lain atau isi ulang stok.`;
      this.pushLog('error', message);
      return { ok: false, message };
    }

    if (this.balance < drink.price) {
      const shortage = drink.price - this.balance;
      const message = `Saldo tidak cukup untuk ${drink.name} (${formatRupiah(drink.price)}). Kurang ${formatRupiah(shortage)}.`;
      this.pushLog('error', message);
      return { ok: false, message };
    }

    drink.stock -= 1;
    const change = this.balance - drink.price;
    this.totalRevenue += drink.price;
    this.balance = 0;

    const stockNotice = drink.stock === 0 ? ` Peringatan: Stok ${drink.name} kini habis.` : '';
    const changeText = change > 0 ? ` Kembalian: ${formatRupiah(change)}.` : ' Uang pas.';
    const message = `Berhasil membeli ${drink.name} (${formatRupiah(drink.price)}).${changeText}${stockNotice}`;
    this.pushLog('purchase', message, drink.price);

    return {
      ok: true,
      message,
      change,
      dispensedDrink: { ...drink },
    };
  }

  public refund(): OperationResult {
    if (this.balance <= 0) {
      return { ok: false, message: 'Tidak ada saldo untuk dikembalikan.' };
    }

    const refundedAmount = this.balance;
    this.balance = 0;
    const message = `Saldo ${formatRupiah(refundedAmount)} dikembalikan ke pengguna.`;
    this.pushLog('refund', message, refundedAmount);

    return { ok: true, message, change: refundedAmount };
  }

  public restockDrink(drinkId: DrinkId, quantity = 1): OperationResult {
    const drink = this.drinks.get(drinkId);
    if (!drink) {
      return { ok: false, message: 'Minuman tidak ditemukan.' };
    }

    const nextStock = Math.min(drink.maxStock, Math.max(0, drink.stock + quantity));
    drink.stock = nextStock;
    const message = `Stok ${drink.name} diperbarui menjadi ${drink.stock} unit.`;
    this.pushLog('restock', message);

    return { ok: true, message };
  }

  public emptyDrinkStock(drinkId: DrinkId): OperationResult {
    const drink = this.drinks.get(drinkId);
    if (!drink) {
      return { ok: false, message: 'Minuman tidak ditemukan.' };
    }

    drink.stock = 0;
    const message = `Stok ${drink.name} diset habis (0 unit) untuk simulasi deteksi stok kosong.`;
    this.pushLog('restock', message);

    return { ok: true, message };
  }

  public resetMachine(): OperationResult {
    this.drinks.forEach((drink) => {
      if (drink.id === 'aqua') drink.stock = 5;
      if (drink.id === 'teh-botol') drink.stock = 4;
      if (drink.id === 'pocari-sweat') drink.stock = 2;
    });
    this.balance = 0;
    this.totalRevenue = 0;
    this.logs = [];
    this.pushLog('restock', 'Mesin vending direset ke kondisi awal.');

    return { ok: true, message: 'Mesin vending direset ke kondisi awal.' };
  }

  public getSnapshot(): VendingMachineSnapshot {
    return {
      drinks: Array.from(this.drinks.values()).map((d) => ({ ...d })),
      balance: this.balance,
      totalRevenue: this.totalRevenue,
      outOfStockDrinks: this.getOutOfStockDrinks(),
      logs: this.logs.map((l) => ({ ...l })),
    };
  }
}
