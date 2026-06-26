import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCreateCategoryMutation, useUpdateCategoryMutation } from '@/redux/api/categoryApi';
import type { Category } from '@/types/category.type';

interface CategoryFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    category?: Category | null;
}

export default function CategoryFormModal({
    isOpen,
    onClose,
    category,
}: CategoryFormModalProps) {
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
    const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();

    const isEditing = !!category;
    const isSaving = isCreating || isUpdating;

    useEffect(() => {
        if (isOpen) {
            if (category) {
                setName(category.name);
            } else {
                setName('');
            }
            setError('');
        }
    }, [isOpen, category]);

    const handleSubmit = async () => {
        if (!name.trim()) {
            setError('Tên danh mục là bắt buộc');
            return;
        }

        try {
            if (isEditing && category) {
                await updateCategory({ id: category.id, name: name.trim() }).unwrap();
            } else {
                await createCategory({ name: name.trim() }).unwrap();
            }
            onClose();
        } catch (err: any) {
            console.error('Lỗi lưu danh mục:', err);
            const errorMsg = err?.data?.message || err?.message || 'Đã xảy ra lỗi không xác định';
            setError(`Lỗi: ${errorMsg}`);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditing ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
            size="sm"
            footer={
                <>
                    <Button variant="outline" onClick={onClose} disabled={isSaving}>
                        Hủy bỏ
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSubmit}
                        isLoading={isSaving}
                        leftIcon={
                            <span className="material-symbols-outlined text-sm">
                                {isEditing ? 'save' : 'add_circle'}
                            </span>
                        }
                    >
                        {isEditing ? 'Cập nhật' : 'Tạo mới'}
                    </Button>
                </>
            }
        >
            <div className="space-y-4">
                <Input
                    id="category-name"
                    label="Tên danh mục *"
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                        if (error) setError('');
                    }}
                    placeholder="VD: Áo thun"
                    error={error}
                    disabled={isSaving}
                />
            </div>
        </Modal>
    );
}
