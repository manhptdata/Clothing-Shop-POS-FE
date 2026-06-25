export interface Category {
  id: number;
  name: string;
  parentId?: number;
  active: boolean;
  deleted: boolean;
}

export interface ProductAttribute {
  id?: number;
  key: string;
  value: string;
}

export interface ProductOptionValue {
  id?: number;
  value: string;
}

export interface ProductOption {
  id?: number;
  name: string;
  position: number;
  values: ProductOptionValue[];
}

export interface ProductVariant {
  id?: number;
  sku: string;
  imageUrl?: string;
  option1Value?: ProductOptionValue;
  option2Value?: ProductOptionValue;
  option3Value?: ProductOptionValue;
  salePrice: number;
  importPrice?: number;
  lowStockThreshold: number;
  quantity: number;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  category: Category;
  imageUrls?: string[];
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  options: ProductOption[];
  variants: ProductVariant[];
  attributes: ProductAttribute[];
}

export interface ProductRequest {
  name: string;
  description?: string;
  categoryId: number;
  imageUrls?: string[];
  options?: Omit<ProductOption, 'id'>[];
  variants: Omit<ProductVariant, 'id'>[];
  attributes?: Omit<ProductAttribute, 'id'>[];
}

export type ProductUpdateRequest = Partial<ProductRequest>;

export interface ProductFilterParams {
  page?: number;
  size?: number;
  sort?: string;
  search?: string;
  name?: string;
  categoryId?: number;
  isDeleted?: boolean;
  stockStatus?: string;
}
