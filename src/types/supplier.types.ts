export interface Supplier {
    id: number;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    note?: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface SupplierRequest {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    note?: string;
}

export interface SupplierQueryParams {
    page?: number;
    size?: number;
    sort?: string;
    search?: string;
    isActive?: boolean;
}
