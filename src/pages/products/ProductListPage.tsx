import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';

export default function ProductListPage() {
  const products = [
    { id: 1, name: 'Áo khoác Trench len', price: '$2,450', sku: 'FW24-001', status: 'CÒN HÀNG', statusClass: 'success', desc: 'Xanh lá đậm • Size M' },
    { id: 2, name: 'Áo Blouse lụa xếp ly', price: '$890', sku: 'FW24-042', status: 'SẮP HẾT: 2', statusClass: 'warning', desc: 'Kem • Size S' },
    { id: 3, name: 'Quần tây ống rộng', price: '$1,150', sku: 'FW24-018', status: 'HẾT HÀNG', statusClass: 'danger', desc: 'Đen tuyền • Size L', dimmed: true },
    { id: 4, name: 'Áo len đan Cashmere rộng', price: '$1,800', sku: 'FW24-055', status: 'CÒN HÀNG', statusClass: 'success', desc: 'Xám nâu • Size M' },
    { id: 5, name: 'Túi Tote da', price: '$3,200', sku: 'ACC-009', status: 'CÒN HÀNG', statusClass: 'success', desc: 'Đen mun • Freesize' },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Filters Sidebar */}
      <aside className="w-full lg:w-64 flex-shrink-0 mb-lg lg:mb-0">
        <div className="bg-primary-container text-on-primary-container p-md rounded-lg sticky top-32">
          <div className="flex items-center justify-between mb-md border-b border-on-primary-container/20 pb-sm">
            <h2 className="font-headline-md text-headline-md text-on-primary">Bộ lọc</h2>
            <span className="material-symbols-outlined text-on-primary">tune</span>
          </div>
          <div className="space-y-md">
            <div>
              <h3 className="font-label-caps text-label-caps text-on-primary-container/80 mb-sm uppercase">Danh mục</h3>
              <div className="space-y-2">
                {['Tất cả', 'Đồ may sẵn', 'Đồ da', 'Phụ kiện'].map((cat, i) => (
                  <label key={cat} className="flex items-center space-x-2 cursor-pointer group">
                    <input defaultChecked={i === 0} className="form-checkbox h-4 w-4 rounded-sm text-primary" type="checkbox" />
                    <span className="font-body-sm text-body-sm text-on-primary">{cat}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-label-caps text-label-caps text-on-primary-container/80 mb-sm uppercase pt-sm border-t border-on-primary-container/20">Trạng thái</h3>
              <div className="space-y-2">
                {['Còn hàng', 'Sắp hết', 'Hết hàng'].map((s, i) => (
                  <label key={s} className="flex items-center space-x-2 cursor-pointer group">
                    <input defaultChecked={i === 0} name="status" className="form-radio h-4 w-4 text-primary" type="radio" />
                    <span className="font-body-sm text-body-sm text-on-primary">{s}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <Button className="w-full mt-md bg-on-primary text-primary-container hover:bg-white transition-colors">
            Áp dụng lọc
          </Button>
        </div>
      </aside>

      {/* Catalog Grid */}
      <div className="flex-1">
        <div className="flex justify-between items-end mb-lg">
          <div>
            <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface">Bộ sưu tập mùa thu</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2">Hiển thị 24 sản phẩm trong Đồ may sẵn</p>
          </div>
          <div className="flex gap-sm">
            <Link to="/products/new">
              <Button leftIcon={<span className="material-symbols-outlined text-[18px]">add</span>}>
                Thêm sản phẩm
              </Button>
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-gutter">
          {products.map((p) => (
            <div key={p.sku} className={`border border-outline/20 rounded-lg bg-surface-container-lowest overflow-hidden group hover:border-primary/50 transition-colors duration-300 flex flex-col ${p.dimmed ? 'opacity-75' : ''}`}>
              <Link to={`/products/${p.id}`} className="relative aspect-[3/4] bg-surface-container overflow-hidden block">
                <div className="w-full h-full bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-5xl">checkroom</span>
                </div>
                <div className="absolute top-sm right-sm">
                  <Badge variant={p.statusClass as any}>{p.status}</Badge>
                </div>
              </Link>
              <div className="p-md flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <Link to={`/products/${p.id}`}>
                    <h3 className="font-title-sm text-title-sm text-on-surface hover:text-primary transition-colors">{p.name}</h3>
                  </Link>
                  <span className="font-title-sm text-title-sm text-on-surface">{p.price}</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">{p.desc}</p>
                <div className="mt-auto flex items-center justify-between">
                  <span className="text-xs font-label-caps text-on-surface-variant uppercase tracking-wider">Mã SP: {p.sku}</span>
                  <Link to={`/products/${p.id}/edit`} className="text-primary hover:text-primary-container transition-colors">
                    <span className="material-symbols-outlined">edit</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-xl">
          <Pagination
            totalPages={3}
            currentPage={0}
            onPageChange={(page) => console.log('Page:', page)}
            className="bg-transparent border-t border-on-surface/10 px-0"
          />
        </div>
      </div>
    </div>
  );
}
