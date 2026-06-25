import { useState, useRef } from 'react';

interface ImageUploaderProps {
    images: string[];
    onChange: (images: string[]) => void;
}

export function ImageUploader({ images, onChange }: ImageUploaderProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        // Giả lập upload ảnh (thực tế gọi API upload)
        const newImages = Array.from(files).map(file => URL.createObjectURL(file));
        onChange([...images, ...newImages]);
    };

    const removeImage = (index: number) => {
        onChange(images.filter((_, i) => i !== index));
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
                className="border-2 border-dashed border-outline-variant/50 rounded-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-surface-container-low/50 transition-colors min-h-[120px]"
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                />
                <span className="material-symbols-outlined text-outline-variant text-3xl">cloud_upload</span>
                <p className="font-button text-button text-primary mt-1">Nhấn để tải lên</p>
                <p className="font-body-sm text-body-sm text-on-surface-variant text-xs">
                    hoặc kéo thả ảnh vào đây
                </p>
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
                            className={`relative aspect-square rounded-lg overflow-hidden group cursor-move border-2 transition-all duration-200 ${draggedIndex === index
                                ? 'border-primary opacity-40 scale-95'
                                : 'border-transparent hover:border-outline-variant'
                                }`}
                        >
                            <img src={url} alt={`Product ${index + 1}`} className="w-full h-full object-cover select-none pointer-events-none" />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex justify-between p-1.5 items-start">
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