import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Table, Column } from '@/components/ui/Table';

export default function ProductFormPage() {
  const variants = [
    { variant: 'Ngọc lục bảo / Nhỏ', sku: 'SS-EM-S', sale: '250.000đ', imp: '85.000đ', stock: 12 },
    { variant: 'Ngọc lục bảo / Vừa', sku: 'SS-EM-M', sale: '250.000đ', imp: '85.000đ', stock: 8 },
    { variant: 'Ngà / Nhỏ', sku: 'SS-IV-S', sale: '250.000đ', imp: '85.000đ', stock: 24 },
  ];

  const columns: Column<typeof variants[0]>[] = [
    { key: 'variant', header: 'Biến thể', render: (row) => <span className="font-body-md text-body-md">{row.variant}</span> },
    { key: 'sku', header: 'Mã SP', render: (row) => <Input id={`sku-${row.sku}`} defaultValue={row.sku} className="py-xs text-sm" /> },
    { key: 'sale', header: 'Giá Bán', className: 'w-32', render: (row) => <Input id={`sale-${row.sku}`} defaultValue={row.sale} className="py-xs text-sm text-right" /> },
    { key: 'imp', header: 'Giá Nhập', className: 'w-32', render: (row) => <Input id={`imp-${row.sku}`} defaultValue={row.imp} className="py-xs text-sm text-right" /> },
    { key: 'stock', header: 'Tồn kho', className: 'w-24', render: (row) => <Input id={`stock-${row.sku}`} type="number" defaultValue={row.stock} className="py-xs text-sm text-right" /> },
  ];

  return (
    <div className="max-w-[1440px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-end mb-lg">
        <div>
          <h2 className="font-headline-md text-headline-md text-on-background">Thêm Sản phẩm Mới</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">Thiết lập chi tiết sản phẩm và các biến thể kho hàng.</p>
        </div>
        <div className="flex flex-wrap gap-sm w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-none justify-center">Lưu Nháp</Button>
          <Button className="flex-1 sm:flex-none justify-center">Đăng Sản phẩm</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        <div className="lg:col-span-2 space-y-md">
          <div className="bg-surface-container-lowest rounded-lg p-md border border-outline/10">
            <h3 className="font-title-sm text-title-sm text-on-background mb-md">Chi tiết Cốt lõi</h3>
            <div className="space-y-sm">
              <Input
                id="pt"
                label="Tên Sản phẩm"
                placeholder="VD: Khăn lụa"
              />
              <div className="flex flex-col gap-xs">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase" htmlFor="pd">Mô tả</label>
                <textarea className="w-full px-sm py-sm rounded border border-outline-variant bg-transparent font-body-md text-body-md focus:outline-none focus:border-primary focus:border-2 transition-colors resize-none" id="pd" placeholder="Mô tả chi tiết sản phẩm..." rows={4}></textarea>
              </div>
              <Select
                id="pc"
                label="Danh mục"
                options={[
                  { value: 'phukien', label: 'Phụ kiện' },
                  { value: 'quanao', label: 'Quần áo' },
                  { value: 'giaydep', label: 'Giày dép' },
                ]}
                placeholder="Chọn danh mục..."
                className="w-1/2"
              />
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-lg p-md border border-outline/10">
            <div className="flex justify-between items-center mb-md">
              <h3 className="font-title-sm text-title-sm text-on-background">Ma trận Biến thể</h3>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<span className="material-symbols-outlined text-sm">add</span>}
              >
                Thêm Thuộc tính
              </Button>
            </div>
            <Table columns={columns} data={variants} rowKey={(row) => row.sku} />
          </div>
        </div>

        <div className="space-y-md">
          <div className="bg-surface-container-lowest rounded-lg p-md border border-outline/10">
            <h3 className="font-title-sm text-title-sm text-on-background mb-md">Thư viện Ảnh</h3>
            <div className="border-2 border-dashed border-outline-variant/50 rounded-lg p-lg flex flex-col items-center justify-center text-center cursor-pointer hover:bg-surface-container-low/50 transition-colors h-48">
              <span className="material-symbols-outlined text-outline-variant mb-xs" style={{ fontSize: '32px' }}>cloud_upload</span>
              <p className="font-button text-button text-primary">Nhấn để tải lên</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">hoặc kéo thả ảnh chất lượng cao vào đây</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
