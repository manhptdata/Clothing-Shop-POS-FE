import axios from 'axios';
import { ENV } from '@/config/env';
import axiosInstance from '@/config/axiosInstance';

export const uploadImageToCloudinary = async (file: File): Promise<string> => {
    const cloudName = ENV.CLOUDINARY_CLOUD_NAME;
    const uploadPreset = ENV.CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
        throw new Error('Thiếu cấu hình Cloudinary (CLOUDINARY_CLOUD_NAME hoặc CLOUDINARY_UPLOAD_PRESET). Vui lòng thêm vào file .env');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    try {
        const response = await axios.post(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            formData
        );
        return response.data.secure_url;
    } catch (error) {
        console.error('Lỗi upload ảnh lên Cloudinary:', error);
        throw error;
    }
};

export const uploadMultipleImagesToCloudinary = async (files: FileList | File[]): Promise<string[]> => {
    const uploadPromises = Array.from(files).map(file => uploadImageToCloudinary(file));
    return Promise.all(uploadPromises);
};

export const deleteImageFromCloudinary = async (url: string): Promise<boolean> => {
    try {
        // Gọi lên backend để xoá file an toàn bằng API Secret
        await axiosInstance.delete(`/uploads?url=${encodeURIComponent(url)}`);
        return true;
    } catch (error) {
        console.error('Lỗi xoá ảnh trên Cloudinary:', error);
        return false;
    }
};
