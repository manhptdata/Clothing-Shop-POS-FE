import { Link } from 'react-router-dom';

export default function ProductFormPage() {
  return (
    <div className="max-w-[1440px] mx-auto w-full">
      <div className="flex justify-between items-end mb-lg">
        <div>
          <h2 className="font-headline-md text-headline-md text-on-background">Thêm Sản phẩm Mới</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">Thiết lập chi tiết sản phẩm và các biến thể kho hàng.</p>
        </div>
        <div className="flex gap-sm">
          <button className="px-md py-sm rounded border border-outline-variant text-on-surface font-button text-button hover:bg-surface-container transition-colors">Lưu Nháp</button>
          <button className="px-md py-sm rounded bg-primary-container text-on-primary font-button text-button hover:bg-primary transition-colors">Đăng Sản phẩm</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        <div className="lg:col-span-2 space-y-md">
          <div className="bg-surface-container-lowest rounded-lg p-md border border-outline/10">
            <h3 className="font-title-sm text-title-sm text-on-background mb-md">Chi tiết Cốt lõi</h3>
            <div className="space-y-sm">
              <div className="flex flex-col gap-xs">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase" htmlFor="pt">Tên Sản phẩm</label>
                <input className="w-full px-sm py-sm rounded border border-outline-variant bg-transparent font-body-md text-body-md focus:outline-none focus:border-primary focus:border-2 transition-colors" id="pt" placeholder="VD: Khăn lụa" type="text" />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase" htmlFor="pd">Mô tả</label>
                <textarea className="w-full px-sm py-sm rounded border border-outline-variant bg-transparent font-body-md text-body-md focus:outline-none focus:border-primary focus:border-2 transition-colors resize-none" id="pd" placeholder="Mô tả chi tiết sản phẩm..." rows={4}></textarea>
              </div>
              <div className="flex flex-col gap-xs w-1/2">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase" htmlFor="pc">Danh mục</label>
                <select className="w-full px-sm py-sm rounded border border-outline-variant bg-transparent font-body-md text-body-md focus:outline-none" id="pc">
                  <option disabled value="">Chọn danh mục...</option>
                  <option>Phụ kiện</option>
                  <option>Quần áo</option>
                  <option>Giày dép</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-lg p-md border border-outline/10">
            <div className="flex justify-between items-center mb-md">
              <h3 className="font-title-sm text-title-sm text-on-background">Ma trận Biến thể</h3>
              <button className="flex items-center gap-xs px-sm py-xs rounded border border-primary text-primary font-button text-button hover:bg-surface-container-low transition-colors">
                <span className="material-symbols-outlined text-sm">add</span> Thêm Thuộc tính
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline/10">
                    {['Biến thể', 'Mã SP', 'Giá Bán', 'Giá Nhập', 'Tồn kho'].map((h) => (
                      <th key={h} className="py-sm px-sm font-label-caps text-label-caps text-on-surface-variant uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { variant: 'Ngọc lục bảo / Nhỏ', sku: 'SS-EM-S', sale: '250.000đ', imp: '85.000đ', stock: 12 },
                    { variant: 'Ngọc lục bảo / Vừa', sku: 'SS-EM-M', sale: '250.000đ', imp: '85.000đ', stock: 8 },
                    { variant: 'Ngà / Nhỏ', sku: 'SS-IV-S', sale: '250.000đ', imp: '85.000đ', stock: 24 },
                  ].map((r) => (
                    <tr key={r.sku} className="border-b border-outline/5 hover:bg-surface-container-low/30 transition-colors h-[56px]">
                      <td className="py-sm px-sm font-body-md text-body-md">{r.variant}</td>
                      <td className="py-sm px-sm"><input className="w-full px-xs py-xs rounded border border-outline-variant/50 bg-transparent font-body-sm" defaultValue={r.sku} /></td>
                      <td className="py-sm px-sm"><input className="w-24 text-right px-xs py-xs rounded border border-outline-variant/50 bg-transparent font-body-sm" defaultValue={r.sale} /></td>
                      <td className="py-sm px-sm"><input className="w-24 text-right px-xs py-xs rounded border border-outline-variant/50 bg-transparent font-body-sm" defaultValue={r.imp} /></td>
                      <td className="py-sm px-sm"><input className="w-20 text-right px-xs py-xs rounded border border-outline-variant/50 bg-transparent font-body-sm" defaultValue={r.stock} type="number" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
