import { Link, useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useGetProductByIdQuery } from '@/redux/api/productApi';
import { useGetCategoriesQuery } from '@/redux/api/categoryApi';
import ProductFormModal from './components/ProductFormModal';
import { useAppSelector } from '@/redux/hooks';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const userPerms = user?.permissions || [];
  const isAdmin = user?.role === 'ROLE_ADMIN';
  const hasManageProductPermission = isAdmin || userPerms.includes('MANAGE_PRODUCT');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { data: categoriesData } = useGetCategoriesQuery();
  const categories = categoriesData || [];

  const { data, isLoading, error } = useGetProductByIdQuery(Number(id), {
    skip: !id,
  });

  const product = data?.data;

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-on-surface-variant">Đang tải thông tin sản phẩm...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-error flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-4xl">error</span>
          <p>Không tìm thấy sản phẩm hoặc có lỗi xảy ra.</p>
          <button
            onClick={() => navigate('/products')}
            className="px-4 py-2 bg-primary text-on-primary rounded"
          >
            Quay lại kho
          </button>
        </div>
      </div>
    );
  }

  const mainImage = selectedImage || product.imageUrls?.[0];
  const lowestPrice = Math.min(...product.variants.map(v => v.salePrice || 0));
  const highestPrice = Math.max(...product.variants.map(v => v.salePrice || 0));
  const priceDisplay = lowestPrice === highestPrice
    ? `${lowestPrice.toLocaleString()} ₫`
    : `${lowestPrice.toLocaleString()} ₫ - ${highestPrice.toLocaleString()} ₫`;

  return (
    <div className="flex-1 px-margin-desktop py-lg max-w-[1440px] mx-auto w-full">
      {/* Breadcrumbs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-lg gap-sm">
        <nav className="flex items-center gap-xs font-body-sm text-body-sm text-on-surface-variant">
          <Link className="hover:text-primary transition-colors" to="/products">Kho hàng</Link>
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_right</span>
          <span className="hover:text-primary transition-colors">{product.category?.name || 'Danh mục'}</span>
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_right</span>
          <span className="text-on-surface font-medium">{product.name}</span>
        </nav>
        <div className="flex items-center gap-sm">
          {hasManageProductPermission && (
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="px-md py-2 bg-primary-container text-on-primary font-button text-button rounded hover:bg-primary transition-colors flex items-center gap-xs"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span> Chỉnh sửa
            </button>
          )}
          <button
            onClick={() => navigate('/products')}
            className="px-md py-2 border border-primary text-primary font-button text-button rounded hover:bg-surface-container-high transition-colors flex items-center gap-xs"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span> Trở về
          </button>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        {/* Main Image (8 cols) */}
        <div className="md:col-span-8 flex flex-col gap-gutter">
          <div className="relative w-full aspect-[4/3] bg-surface-container-low border border-on-surface/10 rounded-lg overflow-hidden group flex items-center justify-center">
            {mainImage ? (
              <img src={mainImage} alt={product.name} className="w-full h-full object-contain p-2" />
            ) : (
              <span className="material-symbols-outlined text-on-surface-variant/20" style={{ fontSize: '120px' }}>image</span>
            )}
            {product.isDeleted && (
              <div className="absolute top-md left-md bg-error text-on-error px-3 py-1 rounded font-label-caps text-label-caps">
                Ngừng giao dịch
              </div>
            )}
          </div>

          {/* Gallery */}
          {product.imageUrls && product.imageUrls.length > 0 && (
            <div className="grid grid-cols-4 gap-sm md:gap-gutter">
              {product.imageUrls.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={`aspect-square bg-surface-container-low border rounded overflow-hidden flex items-center justify-center transition-all duration-200 ${mainImage === img
                    ? 'border-primary ring-2 ring-primary/20 scale-95'
                    : 'border-on-surface/10 hover:border-primary/50'
                    }`}
                >
                  <img src={img} alt={`Detail ${i}`} className="w-full h-full object-contain select-none p-1" />
                </button>
              ))}
            </div>
          )}

          {/* Attributes (Đặc điểm chung) */}
          {product.attributes && product.attributes.length > 0 && (
            <div className="bg-surface-container-lowest border border-on-surface/10 p-md rounded-lg mt-4">
              <h3 className="font-title-sm text-title-sm font-semibold text-on-surface mb-md flex items-center gap-xs">
                <span className="material-symbols-outlined text-primary">label</span>
                Đặc điểm chung
              </h3>
              <div className="divide-y divide-on-surface/5 font-body-md text-body-md text-on-surface">
                {product.attributes.map((attr, idx) => (
                  <div key={idx} className="grid grid-cols-3 py-2.5 last:pb-0 first:pt-0 gap-4">
                    <span className="font-semibold text-on-surface col-span-1">{attr.attrKey}</span>
                    <span className="text-on-surface-variant font-normal col-span-2">{attr.attrValue}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Product Info (4 cols) */}
        <div className="md:col-span-4 flex flex-col gap-gutter">
          {/* Header Info */}
          <div className="bg-surface-container-lowest border border-on-surface/10 p-md rounded-lg">
            <div className="flex justify-between items-start mb-sm">
              <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                SKU: {product.variants[0]?.sku || 'N/A'} {product.variants.length > 1 ? `(+${product.variants.length - 1} biến thể)` : ''}
              </p>
            </div>
            <h2 className="font-headline-md text-headline-md font-medium text-on-surface mb-2">{product.name}</h2>
            <p className="font-headline-md text-headline-md font-semibold text-primary mb-md">{priceDisplay}</p>
            <div className="h-px w-full bg-on-surface/10 mb-md"></div>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed whitespace-pre-wrap">
              {product.description || 'Chưa có mô tả chi tiết.'}
            </p>
          </div>

          {/* Inventory Status */}
          <div className="bg-surface-container-lowest border border-on-surface/10 p-md rounded-lg flex-1">
            <h3 className="font-title-sm text-title-sm font-semibold text-on-surface mb-md flex items-center gap-xs">
              <span className="material-symbols-outlined text-primary">inventory_2</span>
              Biến thể & Tồn kho ({product.variants.length})
            </h3>
            <div className="space-y-sm max-h-[400px] overflow-y-auto pr-2">
              {product.variants.map((v) => {
                const optionNames = [v.option1Value, v.option2Value, v.option3Value].filter(Boolean).join(' - ');
                const isOutOfStock = v.quantity === 0;
                const isLowStock = v.quantity > 0 && v.quantity <= v.lowStockThreshold;

                let statusText = 'Còn hàng';
                let statusColor = 'text-on-surface-variant';
                let dotColor = 'bg-primary-container';

                if (isOutOfStock) {
                  statusText = 'Hết hàng';
                  statusColor = 'text-error';
                  dotColor = 'bg-error';
                } else if (isLowStock) {
                  statusText = 'Sắp hết';
                  statusColor = 'text-secondary';
                  dotColor = 'bg-secondary';
                }

                return (
                  <div key={v.id || v.sku} className="flex flex-col py-2 border-b border-on-surface/5 last:border-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-body-sm text-body-sm font-medium ${isOutOfStock ? 'text-on-surface/50' : 'text-on-surface'}`}>
                        {optionNames || 'Mặc định'}
                      </span>
                      <span className={`text-xs font-mono ${isOutOfStock ? 'text-on-surface/40' : 'text-on-surface-variant'}`}>{v.sku}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`font-body-sm text-body-sm ${statusColor}`}>{statusText}</span>
                      <div className="flex items-center gap-xs">
                        <div className={`w-2 h-2 rounded-full ${dotColor}`}></div>
                        <span className={`font-body-sm text-body-sm font-medium ${isOutOfStock ? 'text-on-surface-variant/50' : 'text-on-surface'}`}>
                          {v.quantity} có sẵn
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      {/* Edit Modal */}
      {product && (
        <ProductFormModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          product={product}
          categories={categories}
        />
      )}
    </div>
  );
}
