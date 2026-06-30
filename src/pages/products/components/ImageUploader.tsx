import React, { useState, useRef } from 'react';
import { uploadMultipleImagesToCloudinary, deleteImageFromCloudinary } from '@/utils/cloudinary';

interface ImageUploaderProps {
    images: string[];
    onChange: (images: string[]) => void;
}

export function ImageUploader({ images, onChange }: ImageUploaderProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        try {
            setIsUploading(true);
            const uploadedUrls = await uploadMultipleImagesToCloudinary(files);
            onChange([...images, ...uploadedUrls]);
        } catch (error) {
            console.error('Lỗi khi tải ảnh lên:', error);
            alert('Có lỗi xảy ra khi tải ảnh lên. Vui lòng kiểm tra lại cấu hình.');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = ''; // Reset input
            }
        }
    };

    const removeImage = async (index: number) => {
        const urlToRemove = images[index];
        // Xoá trên giao diện trước
        onChange(images.filter((_, i) => i !== index));
        
        // Gọi API xoá ngầm (không block UI)
        if (urlToRemove.includes('res.cloudinary.com')) {
            const success = await deleteImageFromCloudinary(urlToRemove);
            if (!success) {
                console.warn('Lỗi khi xoá ảnh trên server, nhưng đã xoá khỏi UI');
            }
        }
    };

    // Drag and Drop handlers
    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
    };

    const handleDrop = (index: number) => {
        if (draggedIndex === null || draggedIndex === index) return;

        const updatedImages = [...images];
        const temp = updatedImages[draggedIndex];
        updatedImages[draggedIndex] = updatedImages[index];
        updatedImages[index] = temp;

        onChange(updatedImages);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    return (
        <div className="bg-surface-container rounded-lg p-4 border border-outline/10">
            <h3 className="font-title-sm text-title-sm text-on-background mb-4">
                Thư viện ảnh ({images.length})
            </h3>

            <div
                className={`border-2 border-dashed border-outline-variant/50 rounded-lg p-4 flex flex-col items-center justify-center text-center transition-colors min-h-[120px] ${isUploading ? 'opacity-50 cursor-not-allowed bg-surface-container-high' : 'cursor-pointer hover:bg-surface-container-low/50'
                    }`}
                onClick={() => !isUploading && fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                />
                {isUploading ? (
                    <>
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
                        <p className="font-button text-button text-primary">Đang tải lên...</p>
                    </>
                ) : (
                    <>
                        <span className="material-symbols-outlined text-outline-variant text-3xl">cloud_upload</span>
                        <p className="font-button text-button text-primary mt-1">Nhấn để tải lên</p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant text-xs">
                            hoặc kéo thả ảnh vào đây
                        </p>
                    </>
                )}
            </div>

            {/* Grid ảnh */}
            {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-4">
                    {images.map((url, index) => (
                        <div
                            key={index}
                            draggable
                            onDragStart={() => handleDragStart(index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDrop={() => handleDrop(index)}
                            onDragEnd={handleDragEnd}
                            className={`relative aspect-square rounded-lg overflow-hidden group cursor-move transition-all duration-200 border border-outline/10 ${draggedIndex === index
                                ? 'opacity-40 scale-95'
                                : ''
                                }`}
                        >
                            <img src={url} alt={`Product ${index + 1}`} className="w-full h-full object-cover select-none pointer-events-none" />
                            
                            {/* Overlay cho Ảnh đại diện (chỉ áp dụng cho ảnh đầu tiên) */}
                            {index === 0 && (
                                <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-center py-1 text-[11px] font-medium z-10">
                                    Ảnh đại diện
                                </div>
                            )}

                            {/* Hover overlay chung */}
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex justify-between p-1.5 items-start z-20">
                                <span className="bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-mono select-none">
                                    #{index + 1}
                                </span>
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                                    className="p-1 bg-black/60 hover:bg-error rounded-full text-white transition-colors"
                                >
                                    <span className="material-symbols-outlined text-xs">close</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}