// ── Stock Receipt Types ────────────────────────────────────────────────────────

export interface StockReceiptItem {
    id: number;
    variantId: number;
    sku: string;
    quantity: number;
    importPrice: number | null;
}

export interface StockReceipt {
    id: number;
    code: string;
    supplierId?: number;
    supplierName?: string;
    status: 'DRAFT' | 'CONFIRMED' | 'CANCELLED';
    note: string | null;
    totalQuantity: number;
    totalAmount: number;
    createdAt: string;
    createdBy: number | null;
    confirmedAt: string | null;
    confirmedBy: number | null;
    items: StockReceiptItem[];
}

export interface StockReceiptItemRequest {
    variantId: number;
    quantity: number;
    importPrice?: number;
}

export interface StockReceiptRequest {
    supplierId: number;
    note?: string;
    items: StockReceiptItemRequest[];
}
