export interface ProductAttribute {
  id?: number;
  key: string;
  value: string;
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  category: string;
  color: string;
  size: string;
  salePrice: number;
  importPrice: number;
  description: string;
  imageUrls: string[];
  lowStockThreshold: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  createdByUserID: number;
  updatedByUserID: number;
  attributes: ProductAttribute[];
}

export interface ProductRequest {
  sku: string;
  name: string;
  category: string;
  color?: string;
  size?: string;
  salePrice: number;
  importPrice?: number;
  description?: string;
  lowStockThreshold?: number;
  imageUrls?: string[];
  attributes?: Omit<ProductAttribute, 'id'>[];
}

export type ProductUpdateRequest = Partial<ProductRequest>;

export interface ProductFilterParams {
  page?: number;
  size?: number;
  sort?: string;
  search?: string;
  productName?: string;
  sku?: string;
  category?: string;
  isDeleted?: boolean;
}
