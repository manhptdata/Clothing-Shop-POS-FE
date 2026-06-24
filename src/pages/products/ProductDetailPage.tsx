import { Link, useParams } from 'react-router-dom';

const sizeVariants = [
  { size: 'XS', status: 'In Stock', units: '4 units', dotColor: 'bg-primary-container', textColor: 'text-on-surface' },
  { size: 'S', status: 'Low Stock', units: '1 unit', dotColor: 'bg-secondary-container', textColor: 'text-on-surface' },
  { size: 'M', status: 'Out of Stock', units: '0 units', dotColor: 'bg-error', textColor: 'text-error', dim: true },
  { size: 'L', status: 'In Stock', units: '6 units', dotColor: 'bg-primary-container', textColor: 'text-on-surface' },
];

export default function ProductDetailPage() {
  const { id } = useParams();

  return (
    <div className="bg-background text-on-background antialiased flex flex-col md:flex-row min-h-screen">
      {/* SideNavBar */}
      <nav className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 border-r border-on-surface/10 bg-surface py-lg z-40">
        <div className="px-md mb-xl flex items-center gap-sm">
          <div className="w-10 h-10 rounded-full bg-surface-container-high overflow-hidden shrink-0 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary">store</span>
          </div>
          <div>
            <h1 className="font-title-sm text-title-sm font-bold text-primary">LuxeRetail</h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Flagship Paris</p>
          </div>
        </div>
        <ul className="flex-1 flex flex-col gap-base">
          <li>
            <Link to="/dashboard" className="flex items-center gap-sm py-sm text-on-surface-variant pl-5 hover:bg-surface-container transition-colors font-body-md text-body-md">
              <span className="material-symbols-outlined">dashboard</span> Dashboard
            </Link>
          </li>
          <li>
            <Link to="/products" className="flex items-center gap-sm py-sm text-primary border-l-4 border-primary font-bold pl-4 bg-surface-container font-body-md text-body-md">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>inventory_2</span> Inventory
            </Link>
          </li>
          <li>
            <Link to="/customers" className="flex items-center gap-sm py-sm text-on-surface-variant pl-5 hover:bg-surface-container transition-colors font-body-md text-body-md">
              <span className="material-symbols-outlined">star</span> Clients
            </Link>
          </li>
        </ul>
        <div className="px-md mt-auto mb-lg">
          <Link to="/products/new">
            <button className="w-full bg-primary-container text-on-primary font-button text-button py-sm rounded flex items-center justify-center gap-xs hover:bg-primary transition-colors">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
              New Collection
            </button>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* TopNavBar */}
        <header className="hidden md:flex justify-between items-center px-margin-desktop py-sm sticky top-0 z-50 bg-surface border-b border-on-surface/10">
          <div className="flex items-center gap-md">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" style={{ fontSize: '20px' }}>search</span>
              <input className="pl-10 pr-4 py-2 border border-on-surface/10 rounded-full bg-surface-container-lowest focus:outline-none focus:border-primary font-body-sm text-body-sm w-64 transition-all" placeholder="Search inventory..." type="text" />
            </div>
          </div>
          <div className="flex items-center gap-md text-on-surface-variant">
            <button className="hover:text-primary transition-colors"><span className="material-symbols-outlined">notifications</span></button>
            <button className="hover:text-primary transition-colors"><span className="material-symbols-outlined">shopping_bag</span></button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 px-margin-desktop py-lg max-w-[1440px] mx-auto w-full">
          {/* Breadcrumbs */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-lg gap-sm">
            <nav className="flex items-center gap-xs font-body-sm text-body-sm text-on-surface-variant">
              <Link className="hover:text-primary transition-colors" to="/products">Inventory</Link>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_right</span>
              <a className="hover:text-primary transition-colors" href="#">Evening Wear</a>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_right</span>
              <span className="text-on-surface font-medium">Silk Charmeuse Slip Dress</span>
            </nav>
            <div className="flex items-center gap-sm">
              <button className="px-md py-2 border border-primary text-primary font-button text-button rounded hover:bg-surface-container-high transition-colors flex items-center gap-xs">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>share</span> Share
              </button>
              <Link to={`/products/${id}/edit`}>
                <button className="px-md py-2 bg-primary-container text-on-primary font-button text-button rounded hover:bg-primary transition-colors flex items-center gap-xs">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span> Edit Details
                </button>
              </Link>
            </div>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
            {/* Main Image (8 cols) */}
            <div className="md:col-span-8 flex flex-col gap-gutter">
              <div className="relative w-full aspect-[4/3] bg-surface-container-low border border-on-surface/10 rounded-lg overflow-hidden group flex items-center justify-center">
                <span className="material-symbols-outlined text-on-surface-variant/20" style={{ fontSize: '120px' }}>checkroom</span>
                <div className="absolute top-md left-md bg-secondary-fixed text-on-secondary-fixed-variant px-3 py-1 rounded font-label-caps text-label-caps border border-secondary-fixed-dim/50">
                  Limited Edition
                </div>
              </div>
              {/* Gallery */}
              <div className="grid grid-cols-3 gap-sm md:gap-gutter">
                {['Detail view 1', 'Detail view 2', 'Detail view 3'].map((alt, i) => (
                  <div key={i} className="aspect-square bg-surface-container-low border border-on-surface/10 rounded overflow-hidden cursor-pointer hover:border-primary transition-colors flex items-center justify-center group relative">
                    <span className="material-symbols-outlined text-on-surface-variant/20 text-4xl">checkroom</span>
                    {i === 2 && (
                      <div className="absolute inset-0 bg-surface/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="material-symbols-outlined text-primary text-3xl">open_in_full</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Product Info (4 cols) */}
            <div className="md:col-span-4 flex flex-col gap-gutter">
              {/* Header Info */}
              <div className="bg-surface-container-lowest border border-on-surface/10 p-md rounded-lg">
                <div className="flex justify-between items-start mb-sm">
                  <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">SKU: DR-SLK-EMR-001</p>
                  <span className="material-symbols-outlined text-primary-container cursor-pointer hover:text-primary transition-colors" style={{ fontSize: '20px' }}>bookmark_border</span>
                </div>
                <h2 className="font-headline-md text-headline-md font-medium text-on-surface mb-2">Silk Charmeuse Slip Dress</h2>
                <p className="font-headline-md text-headline-md font-semibold text-primary mb-md">$1,250.00</p>
                <div className="h-px w-full bg-on-surface/10 mb-md"></div>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Crafted from heavyweight mulberry silk charmeuse, this bias-cut slip dress epitomizes minimalist evening wear. Featuring delicate rouleau straps and a softly cowled neckline.
                </p>
              </div>

              {/* Inventory Status */}
              <div className="bg-surface-container-lowest border border-on-surface/10 p-md rounded-lg">
                <h3 className="font-title-sm text-title-sm font-semibold text-on-surface mb-md flex items-center gap-xs">
                  <span className="material-symbols-outlined text-primary">inventory</span>
                  Inventory Status
                </h3>
                <div className="space-y-sm">
                  {sizeVariants.map((v) => (
                    <div key={v.size} className="flex items-center justify-between py-xs border-b border-on-surface/5 last:border-0">
                      <div className="flex items-center gap-sm">
                        <span className={`w-8 h-8 flex items-center justify-center border border-on-surface/20 rounded font-body-sm text-body-sm font-medium ${v.dim ? 'text-on-surface/50 bg-surface-container' : ''}`}>{v.size}</span>
                        <span className={`font-body-sm text-body-sm ${v.dim ? 'text-error' : 'text-on-surface-variant'}`}>{v.status}</span>
                      </div>
                      <div className="flex items-center gap-xs">
                        <div className={`w-2 h-2 rounded-full ${v.dotColor}`}></div>
                        <span className={`font-body-sm text-body-sm font-medium ${v.dim ? 'text-on-surface-variant/50' : 'text-on-surface'}`}>{v.units}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-sm">
                <button className="bg-surface-container border border-on-surface/10 py-sm rounded font-button text-button text-on-surface hover:bg-surface-container-high transition-colors flex items-center justify-center gap-xs">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>local_shipping</span>
                  Request Transfer
                </button>
                <button className="bg-surface-container border border-on-surface/10 py-sm rounded font-button text-button text-on-surface hover:bg-surface-container-high transition-colors flex items-center justify-center gap-xs">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>qr_code_scanner</span>
                  Print Tags
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
