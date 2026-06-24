import { Link } from 'react-router-dom';

const tiers = [
  { name: 'Bronze Tier', color: '#CD7F32', threshold: '0', multiplier: '1.0x', discount: '0%' },
  { name: 'Silver Tier', color: '#C0C0C0', threshold: '5,000', multiplier: '1.5x', discount: '5%' },
  { name: 'Gold Tier', color: '#D4AF37', threshold: '15,000', multiplier: '2.0x', discount: '10%', isGold: true },
];

export default function CustomerGroupListPage() {
  return (
    <div className="bg-surface-container-low text-on-surface font-body-md antialiased min-h-screen">
      {/* SideNavBar */}
      <aside className="bg-surface-container-low h-full w-64 fixed left-0 top-0 border-r border-outline-variant/15 flex flex-col py-lg px-md h-screen z-40 hidden md:flex">
        <div className="mb-xl flex flex-col items-start">
          <div className="flex items-center gap-sm mb-xs">
            <div className="w-8 h-8 rounded-full bg-surface-variant overflow-hidden flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>storefront</span>
            </div>
            <h1 className="font-headline-md text-headline-md text-primary">LuxeCRM</h1>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Flagship Store</p>
        </div>
        <nav className="flex-1 space-y-2">
          <Link to="/dashboard" className="flex items-center gap-sm px-sm py-3 text-on-surface-variant border-l-4 border-transparent hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-[20px]">dashboard</span><span className="font-button text-button">Dashboard</span>
          </Link>
          <Link to="/customers" className="flex items-center gap-sm px-sm py-3 text-on-surface-variant border-l-4 border-transparent hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-[20px]">group</span><span className="font-button text-button">Clientele</span>
          </Link>
          <Link to="/products" className="flex items-center gap-sm px-sm py-3 text-on-surface-variant border-l-4 border-transparent hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-[20px]">diamond</span><span className="font-button text-button">Inventory</span>
          </Link>
          <Link to="/orders" className="flex items-center gap-sm px-sm py-3 text-on-surface-variant border-l-4 border-transparent hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-[20px]">receipt_long</span><span className="font-button text-button">Sales</span>
          </Link>
          <Link to="/customers/groups" className="flex items-center gap-sm px-sm py-3 text-primary font-bold border-l-4 border-primary">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>settings</span><span className="font-button text-button">Settings</span>
          </Link>
        </nav>
        <div className="mt-auto pt-lg">
          <button className="w-full bg-primary-container text-on-primary font-button text-button py-3 px-4 rounded hover:bg-primary transition-colors flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Appointment
          </button>
        </div>
      </aside>

      {/* TopAppBar */}
      <header className="bg-surface fixed top-0 right-0 w-[calc(100%-16rem)] h-20 border-b border-outline-variant/15 flex justify-between items-center px-margin-desktop z-30 hidden md:flex">
        <div className="flex items-center gap-xl">
          <h2 className="font-title-sm text-title-sm text-primary tracking-tight">Luxury Client Management</h2>
          <div className="relative w-64 hidden lg:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
            <input className="w-full bg-surface-container-low border border-outline-variant/30 text-body-sm font-body-sm rounded-full pl-10 pr-4 py-2 focus:outline-none focus:border-primary-container transition-all" placeholder="Search..." type="text" />
          </div>
        </div>
        <div className="flex items-center gap-md">
          <button className="text-on-surface-variant hover:opacity-80"><span className="material-symbols-outlined">notifications</span></button>
          <button className="text-on-surface-variant hover:opacity-80"><span className="material-symbols-outlined">help_outline</span></button>
        </div>
      </header>

      {/* Main Content */}
      <main className="md:ml-64 pt-20 min-h-screen">
        <div className="max-w-[1440px] mx-auto px-margin-desktop py-xl">
          {/* Page Header */}
          <div className="mb-lg">
            <h1 className="font-display-lg text-display-lg text-primary mb-xs" style={{ fontSize: '32px', lineHeight: '40px' }}>Tier Configuration</h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
              Define spending thresholds and reward rates for your loyalty program. Changes applied here will affect all future transactions.
            </p>
          </div>

          {/* Tier Table */}
          <div className="bg-surface border border-outline-variant/15 rounded-lg overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-12 gap-gutter bg-surface-container-low border-b border-outline-variant/15 px-lg py-4">
              <div className="col-span-3 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Rank Name</div>
              <div className="col-span-3 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Spending Threshold (€)</div>
              <div className="col-span-3 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Point Multiplier</div>
              <div className="col-span-3 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Benefits / Discount %</div>
            </div>

            {tiers.map((tier, i) => (
              <div key={tier.name} className={`grid grid-cols-12 gap-gutter items-center border-b border-outline-variant/15 px-lg py-6 group hover:bg-surface-bright transition-colors last:border-0 ${tier.isGold ? 'bg-secondary-container/5' : ''}`}>
                <div className="col-span-3 flex items-center gap-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tier.color }}></div>
                  <span className="font-title-sm text-title-sm text-on-surface flex items-center gap-2">
                    {tier.name}
                    {tier.isGold && <span className="material-symbols-outlined text-[16px] text-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>}
                  </span>
                </div>
                <div className="col-span-3">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-body-md">€</span>
                    <input className="w-full bg-transparent border border-outline-variant/50 text-body-md font-body-md rounded pl-8 pr-4 py-2 focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all" type="text" defaultValue={tier.threshold} />
                  </div>
                </div>
                <div className="col-span-3">
                  <div className="relative w-32">
                    <input className="w-full bg-transparent border border-outline-variant/50 text-body-md font-body-md rounded px-4 py-2 focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all text-right" type="text" defaultValue={tier.multiplier} />
                  </div>
                </div>
                <div className="col-span-3">
                  <div className="relative w-32">
                    <input className="w-full bg-transparent border border-outline-variant/50 text-body-md font-body-md rounded px-4 py-2 focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all text-right" type="text" defaultValue={tier.discount} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Area */}
          <div className="mt-xl flex justify-end gap-sm border-t border-outline-variant/15 pt-md">
            <button className="px-6 py-3 font-button text-button text-primary border border-primary rounded hover:bg-primary/5 transition-colors">Discard Changes</button>
            <button className="px-6 py-3 font-button text-button text-on-primary bg-primary-container rounded hover:bg-primary transition-colors shadow-sm">Save Configuration</button>
          </div>
        </div>
      </main>
    </div>
  );
}
