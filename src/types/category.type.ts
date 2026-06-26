// src/features/categories/types.ts

// Response từ API (khớp với data trả về)
export interface Category {
    id: number;
    name: string;
    active: boolean;
    deleted: boolean;
}

// Dùng cho form thêm/sửa category
export interface CategoryFormData {
    categoryName: string;
}

// Request khi tạo/cập nhật category
export interface CategoryRequest {
    name: string;
}

// Response wrapper từ API
export interface ApiResponse<T> {
    statusCode: number;
    error: string | null;
    message: string;
    data: T;
}