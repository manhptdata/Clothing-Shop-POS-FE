import { Link } from 'react-router-dom';

export default function OrderCreatePage() {
  return (
    <div className="max-w-[1440px] mx-auto w-full">
      {/* POS Split Layout */}
      <div className="flex gap-gutter h-[calc(100vh-8rem)]">
        {/* Left: Catalog (65%) */}
        <section className="w-[65%] flex flex-col">
          {/* Filters */}
          <div className="flex gap-sm overflow-x-auto pb-2 mb-md">
            {['Tất cả', 'Áo', 'Quần', 'Áo khoác', 'Phụ kiện'].map((cat, i) => (
              <button key={cat} className={`px-4 py-2 rounded-lg font-button text-button whitespace-nowrap transition-colors ${i === 0 ? 'bg-primary text-on-primary' : 'border border-outline/20 text-on-surface-variant hover:border-primary hover:text-primary'}`}>
                {cat}
              </button>
            ))}
          </div>
          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto grid grid-cols-2 lg:grid-cols-3 gap-md content-start">
            {[
              { name: 'Áo khoác len Cashmere', category: 'Áo khoác', price: '1.250.000đ', stock: 12, selected: false },
              { name: 'Khăn lụa họa tiết', category: 'Phụ kiện', price: '280.000đ', stock: 45, selected: true },
              { name: 'Áo sơ mi dáng cứng', category: 'Áo', price: '345.000đ', stock: 8, selected: false },
              { name: 'Túi Tote da Signature', category: 'Phụ kiện', price: '890.000đ', stock: 0, outOfStock: true },
            ].map((p) => (
              <div key={p.name} className={`group border rounded-xl overflow-hidden bg-surface-container-lowest cursor-pointer flex flex-col relative transition-colors ${p.selected ? 'border-primary' : 'border-outline/10 hover:border-primary/50'} ${p.outOfStock ? 'opacity-60' : ''}`}>
                <div className="aspect-[4/5] bg-surface-container-low relative overflow-hidden flex items-center justify-center">
                  <span className="material-symbols-outlined text-5xl text-on-surface-variant/30">checkroom</span>
                  {p.selected && (
                    <div className="absolute top-2 left-2 bg-primary text-on-primary px-2 py-1 rounded-full flex items-center gap-1 z-20">
                      <span className="material-symbols-outlined text-[12px]">check</span>
                      <span className="text-[10px] font-label-caps">Trong giỏ</span>
                    </div>
                  )}
                  <div className={`absolute top-2 right-2 bg-surface-container-lowest/90 px-2 py-1 rounded text-[10px] font-label-caps border ${p.outOfStock ? 'text-error border-error/20 bg-error-container' : 'text-on-surface-variant border-outline/10'}`}>
                    {p.outOfStock ? 'Hết hàng' : `SL: ${p.stock}`}
                  </div>
                </div>
                <div className="p-sm flex flex-col flex-1 justify-between gap-xs">
                  <div>
                    <h3 className="font-body-sm text-body-sm font-medium text-on-background line-clamp-1">{p.name}</h3>
                    <p className="font-label-caps text-label-caps text-on-surface-variant mt-1">{p.category}</p>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-title-sm text-title-sm text-primary">{p.price}</span>
                    <button disabled={p.outOfStock} className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors disabled:cursor-not-allowed disabled:opacity-50">
                      <span className="material-symbols-outlined text-sm">add</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Right: Cart & Checkout (35%) */}
        <section className="w-[35%] bg-inverse-surface border-l border-outline/20 flex flex-col rounded-xl overflow-hidden">
          <div className="px-md py-md border-b border-outline/20 sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <h2 className="font-headline-md text-headline-md text-on-tertiary">Đơn hàng hiện tại</h2>
              <button className="text-on-surface-variant hover:text-on-tertiary">
                <span className="material-symbols-outlined">more_vert</span>
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-md flex flex-col gap-md">
            {/* Customer */}
            <div className="bg-inverse-surface border border-outline/20 rounded-xl p-md flex flex-col gap-sm">
              <div className="flex items-start justify-between">
                <div className="flex gap-sm items-center">
                  <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-primary font-title-sm">NK</div>
                  <div>
                    <h3 className="font-title-sm text-title-sm text-on-tertiary">Nguyễn Văn Khách</h3>
                    <p className="font-body-sm text-body-sm text-outline mt-1">khach.n@example.com</p>
                  </div>
                </div>
                <button className="text-outline hover:text-on-tertiary"><span className="material-symbols-outlined text-sm">edit</span></button>
              </div>
              <div className="h-px bg-outline/20 w-full my-1"></div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary-container text-sm">workspace_premium</span>
                  <span className="font-label-caps text-label-caps text-secondary-container">Hạng: VÀNG</span>
                </div>
                <div className="font-body-sm text-body-sm text-outline">Điểm: <span className="text-on-tertiary font-medium">150</span></div>
              </div>
            </div>

            {/* Line Items */}
            <div className="flex flex-col gap-sm">
              <h4 className="font-label-caps text-label-caps text-outline mb-2">Sản phẩm (1)</h4>
              <div className="flex gap-sm bg-inverse-surface border border-outline/20 rounded-lg p-sm">
                <div className="w-16 h-20 rounded bg-surface-container-low flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-on-surface-variant/30">checkroom</span>
                </div>
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div className="flex justify-between items-start">
                    <h5 className="font-body-sm text-body-sm text-on-tertiary">Khăn lụa họa tiết</h5>
                    <span className="font-title-sm text-title-sm text-on-tertiary whitespace-nowrap">280.000đ</span>
                  </div>
                  <div className="flex justify-between items-center mt-auto">
                    <div className="flex items-center gap-3 bg-[#3d4247] rounded-lg px-2 py-1">
                      <button className="text-outline hover:text-on-tertiary"><span className="material-symbols-outlined text-[16px]">remove</span></button>
                      <span className="font-body-sm text-on-tertiary w-3 text-center">1</span>
                      <button className="text-outline hover:text-on-tertiary"><span className="material-symbols-outlined text-[16px]">add</span></button>
                    </div>
                    <button className="text-outline hover:text-error transition-colors">
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Footer */}
          <div className="p-md border-t border-outline/20 bg-inverse-surface mt-auto">
            <div className="flex flex-col gap-3 mb-6">
              {[
                { label: 'Tạm tính', value: '280.000đ' },
                { label: 'Giảm giá', value: '-0đ' },
                { label: 'Thuế (VAT 8%)', value: '22.400đ' },
              ].map((r) => (
                <div key={r.label} className="flex justify-between items-center text-outline font-body-sm text-body-sm">
                  <span>{r.label}</span><span className="text-on-tertiary">{r.value}</span>
                </div>
              ))}
              <div className="h-px bg-outline/20 w-full my-1"></div>
              <div className="flex justify-between items-end mt-1">
                <span className="font-body-md text-body-md text-on-tertiary font-medium">Tổng cộng</span>
                <span className="font-headline-md text-headline-md text-primary-fixed">302.400đ</span>
              </div>
            </div>
            <button className="w-full py-4 bg-primary text-on-primary rounded-xl font-title-sm text-title-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
              <span className="material-symbols-outlined">credit_card</span>
              <span>Thanh toán</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
