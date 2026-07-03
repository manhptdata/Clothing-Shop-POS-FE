export interface Category {
  id: number;
  name: string;
  parentId?: number;
  active: boolean;
  deleted: boolean;
}

export interface ProductAttribute {
  id?: number;
  attrKey: string;
  attrValue: string;
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
  isActive?: boolean;
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
  options?: { name: string; position: number; values: string[] }[];
  variants: {
    sku: string;
    imageUrl?: string;
    option1Value?: string;
    option2Value?: string;
    option3Value?: string;
    salePrice: number;
    importPrice?: number;
    lowStockThreshold: number;
  }[];
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
