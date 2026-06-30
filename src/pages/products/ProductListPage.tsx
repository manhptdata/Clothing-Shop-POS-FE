import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { Pagination } from '@/components/ui/Pagination';
import { useGetProductsQuery, useDeleteProductMutation } from '@/redux/api/productApi';
import { useState, useEffect } from 'react';
import { Product, ProductVariant } from '@/types/product.types';
import { useGetCategoriesQuery } from '@/redux/api/categoryApi';
import ProductFilterSidebar from './ProductFilterSidebar';
import ProductTable from './ProductTable';
import ProductFormModal from './components/ProductFormModal';

export default function ProductListPage() {
  // ===== STATE =====
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  // Filter states (gửi lên API)
  const [search, setSearch] = useState('');
  const [productName, setProductName] = useState('');
  const [sku, setSku] = useState('');
  const [categoryID, setCategoryID] = useState<number | undefined>(undefined);
  const [isDeleted, setIsDeleted] = useState<boolean | undefined>(false);
  const [stockStatus, setStockStatus] = useState<string | undefined>(undefined);

  // Temporary filter states (cho sidebar)
  const [tempSearch, setTempSearch] = useState('');
  const [tempProductName, setTempProductName] = useState('');
  const [tempSku, setTempSku] = useState('');
  const [tempCategoryID, setTempCategoryID] = useState<number | undefined>(undefined);
  const [tempStatus, setTempStatus] = useState('Tất cả');

  const [deleteProduct] = useDeleteProductMutation();

  // Hàm mở modal khi sửa
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  // Hàm xóa mềm sản phẩm
  const handleDeleteProduct = async (id: number, name: string) => {
    const isConfirmed = window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${name}"?`);
    if (!isConfirmed) return;

    try {
      await deleteProduct(id).unwrap();
      toast.success('Xóa sản phẩm thành công!');
    } catch (err: any) {
      console.error('Lỗi khi xóa sản phẩm:', err);
      const errorMsg = err?.data?.message || err?.message || 'Đã xảy ra lỗi không xác định';
      toast.error(`Xóa thất bại! Lỗi: ${errorMsg}`);
    }
  };

  // ===== API CALLS =====
  const productFilterParams = {
    page: page + 1, // Backend configured as 1-based page index (one-indexed-parameters=true)
    size,
    search: search || undefined,
    productName: productName || undefined,
    sku: sku || undefined,
    categoryID: categoryID || undefined,
    isDeleted: isDeleted !== undefined ? isDeleted : undefined,
    stockStatus: stockStatus || undefined,
  };

  const { data: responseData, isLoading, isFetching } = useGetProductsQuery(productFilterParams);
  const { data: categoriesData } = useGetCategoriesQuery();

  const products = responseData?.data?.content || [];
  const pagination = responseData?.data;
  const categories = categoriesData || [];
  const totalElements = responseData?.data?.totalElements || 0;
  const totalPages = responseData?.data?.totalPages || 0;

  const [cachedProducts, setCachedProducts] = useState<any[]>([]);

  useEffect(() => {
    if (products && products.length > 0) {
      setCachedProducts(products);
    }
  }, [products]);

  // ===== HELPER FUNCTIONS =====
  // Định nghĩa type ở đầu file
  type StatusType = 'success' | 'warning' | 'danger' | 'default';

  const getStatus = (variants: ProductVariant[]): { text: string; class: StatusType } => {
    if (!variants?.length) return { text: 'HẾT HÀNG', class: 'danger' };

    const hasStock = variants.some(v => (v.quantity || 0) > (v.lowStockThreshold || 5));
    const hasLowStock = variants.some(v => {
      const qty = v.quantity || 0;
      const threshold = v.lowStockThreshold || 5;
      return qty > 0 && qty <= threshold;
    });

    if (hasStock) return { text: 'CÒN HÀNG', class: 'success' };
    if (hasLowStock) {
      const total = variants.reduce((sum, v) => sum + (v.quantity || 0), 0);
      return { text: `SẮP HẾT (${total})`, class: 'warning' };
    }
    return { text: 'HẾT HÀNG', class: 'danger' };
  };

  const getVariantStatus = (quantity: number, threshold: number = 10) => {
    if (quantity === 0) return { label: 'Hết hàng', class: 'out-of-stock', dotColor: 'gray' };
    if (quantity <= 3) return { label: 'Cực kỳ thấp', class: 'critical', dotColor: 'red' };
    if (quantity <= threshold) return { label: 'Sắp hết', class: 'low', dotColor: 'orange' };
    return { label: 'Còn hàng', class: 'ok', dotColor: 'green' };
  };

  // ===== FILTER HANDLERS =====
  const handleApplyFilter = () => {
    if (tempSearch) {
      setSearch(tempSearch);
      setProductName('');  // Clear tên
      setSku('');          // Clear SKU
      setTempProductName('');
      setTempSku('');
    } else {
      setSearch(tempSearch);
      setProductName(tempProductName);
      setSku(tempSku);
    }

    setCategoryID(tempCategoryID);

    // 👇 XỬ LÝ STOCK STATUS
    switch (tempStatus) {
      case 'Còn hàng':
        setStockStatus('in-stock');
        setIsDeleted(false);
        break;
      case 'Sắp hết':
        setStockStatus('low-stock');
        setIsDeleted(false);
        break;
      case 'Có ít nhất 1 biến thể hết hàng':
        setStockStatus('partial-out-of-stock');
        setIsDeleted(false);
        break;
      case 'Hết hàng toàn bộ sản phẩm':
        setStockStatus('out-of-stock');
        setIsDeleted(false);
        break;
      case 'Đã xóa':
        setStockStatus(undefined);
        setIsDeleted(true);
        break;
      case 'Tất cả':
      default:
        setStockStatus(undefined);
        setIsDeleted(false);
        break;
    }

    setPage(0);
  };

  const handleClearFilters = () => {
    // Reset temp states
    setTempSearch('');
    setTempProductName('');
    setTempSku('');
    setTempCategoryID(undefined);
    setTempStatus('Tất cả');

    // Reset actual filter states
    setSearch('');
    setProductName('');
    setSku('');
    setCategoryID(undefined);
    setIsDeleted(false);
    setStockStatus(undefined); // 👈 RESET STOCK STATUS
    setPage(0);
  };

  const handleQuickSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {

      setTempProductName('');
      setTempSku('');
      setProductName('');
      setSku('');
      setSearch(tempSearch);
      setPage(0);

    }
  };
  // ===== FILTER HANDLERS =====
  const handleSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSize(Number(e.target.value));
    setPage(0); // Reset về trang đầu khi đổi size
  };

  // ===== RENDER =====
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* ===== CỘT BÊN TRÁI: Filter + Button ===== */}
      <div className="w-full lg:w-80 flex-shrink-0">
        {/* Filter Sidebar */}
        <ProductFilterSidebar
          tempProductName={tempProductName}
          setTempProductName={setTempProductName}
          tempSku={tempSku}
          setTempSku={setTempSku}
          tempCategoryID={tempCategoryID}
          setTempCategoryID={setTempCategoryID}
          tempStatus={tempStatus}
          setTempStatus={setTempStatus}
          categories={categories}
          handleApplyFilter={handleApplyFilter}
          handleClearFilters={handleClearFilters}
        />

        {/* Button Thêm sản phẩm */}
        <Button
          variant="primary"
          onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
          className="w-full justify-center mt-4"
          leftIcon={<span className="material-symbols-outlined text-sm">add</span>}
        >
          Thêm sản phẩm
        </Button>
      </div>



      {/*  Product Table  */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap justify-between items-end mb-lg gap-4">
          <div>
            <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface">
              Quản lý sản phẩm
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2">
              Hiển thị {pagination?.totalElements || 0} sản phẩm
              {categoryID && categories.find(c => c.id === categoryID) && (
                <span className="ml-2 text-primary">· {categories.find(c => c.id === categoryID)?.name}</span>
              )}
              {stockStatus && (
                <span className="ml-2 text-primary">
                  · {stockStatus === 'in-stock' ? 'Còn hàng' :
                    stockStatus === 'low-stock' ? 'Sắp hết' :
                      'Hết hàng'}
                </span>
              )}
            </p>
          </div>

          {/* Quick search */}
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <input
                type="text"
                placeholder="Tìm nhanh..."
                value={tempSearch}
                onChange={(e) => setTempSearch(e.target.value)}
                onKeyDown={handleQuickSearch}
                className="w-full sm:w-64 px-4 py-2 pr-10 border border-outline/30 rounded-lg bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-sm">
                search
              </span>
            </div>

          </div>
        </div>

        {products.length === 0 && isFetching && cachedProducts.length === 0 ? (
          <div className="text-center py-20 text-on-surface-variant">Đang tải danh sách...</div>
        ) : (
          <>
            <ProductTable
              products={products.length === 0 && (isFetching || isLoading) ? cachedProducts : products}
              getStatus={getStatus}
              getVariantStatus={getVariantStatus}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
            />
            <div className="mt-xl">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                totalElements={totalElements}
                pageSize={size}
                onPageChange={setPage}
                onSizeChange={setSize}
                className="bg-transparent border-t border-on-surface/10 px-0 w-full"
              />
            </div>
          </>
        )}
      </div>
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={editingProduct}
        categories={categories}
      />
    </div>
  );
}