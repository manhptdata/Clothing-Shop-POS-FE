import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

export default function CustomerFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const [showDrawer, setShowDrawer] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-surface antialiased">
      {/* SideNavBar */}
      <aside className="h-full w-64 fixed left-0 top-0 border-r border-outline-variant/15 flex flex-col py-lg px-md h-screen bg-surface-container-low z-20">
        <div className="mb-xl flex items-center gap-sm">
          <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center overflow-hidden">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>storefront</span>
          </div>
          <div>
            <h1 className="font-headline-md text-headline-md text-primary">LuxeCRM</h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Flagship Store</p>
          </div>
        </div>
        <nav className="flex-1 flex flex-col gap-base">
          <Link to="/dashboard" className="flex items-center gap-md py-sm px-base text-on-surface-variant border-l-4 border-transparent hover:text-primary transition-colors">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-body-md text-body-md">Dashboard</span>
          </Link>
          <Link to="/customers" className="flex items-center gap-md py-sm px-base text-primary font-bold border-l-4 border-primary">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
            <span className="font-body-md text-body-md">Clientele</span>
          </Link>
          <Link to="/products" className="flex items-center gap-md py-sm px-base text-on-surface-variant border-l-4 border-transparent hover:text-primary transition-colors">
            <span className="material-symbols-outlined">diamond</span>
            <span className="font-body-md text-body-md">Inventory</span>
          </Link>
          <Link to="/orders" className="flex items-center gap-md py-sm px-base text-on-surface-variant border-l-4 border-transparent hover:text-primary transition-colors">
            <span className="material-symbols-outlined">receipt_long</span>
            <span className="font-body-md text-body-md">Sales</span>
          </Link>
        </nav>
        <button className="mt-xl w-full py-sm px-md bg-primary text-on-primary font-button text-button hover:opacity-90 transition-opacity flex items-center justify-center gap-sm">
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Appointment
        </button>
      </aside>

      {/* Main Content */}
      <main className="ml-64 w-full h-full flex flex-col relative">
        {/* TopAppBar */}
        <header className="fixed top-0 right-0 w-[calc(100%-16rem)] h-20 border-b border-outline-variant/15 flex justify-between items-center px-margin-desktop bg-surface z-10">
          <div className="font-title-sm text-title-sm text-primary">Luxury Client Management</div>
          <div className="flex items-center gap-md">
            <button className="text-on-surface-variant hover:opacity-80"><span className="material-symbols-outlined">notifications</span></button>
            <button className="text-on-surface-variant hover:opacity-80"><span className="material-symbols-outlined">help_outline</span></button>
          </div>
        </header>

        {/* Background (Clientele Directory blurred) */}
        <div className="mt-20 px-margin-desktop py-lg flex-1 overflow-y-auto opacity-40 pointer-events-none select-none">
          <div className="flex justify-between items-end mb-lg">
            <div>
              <h2 className="font-display-lg text-display-lg text-primary tracking-tight" style={{ fontSize: '32px', lineHeight: '40px' }}>Clientele Directory</h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-sm">Manage your exclusive client portfolio.</p>
            </div>
          </div>
          {/* Faded table background */}
          <div className="border border-outline-variant/15 rounded bg-surface-container-lowest">
            {[['Eleanor Vance', 'VIP', 'Oct 12, 2023', '$24,500'],
              ['Alistair Sterling', 'VIP', 'Sep 28, 2023', '$18,200'],
              ['Madeleine Croft', 'Press', 'Nov 01, 2023', '$0'],
              ['Julian Thorne', 'General', 'Aug 15, 2023', '$3,450'],
            ].map(([name, status, date, spend]) => (
              <div key={name} className="flex items-center px-md py-md border-b border-outline-variant/15">
                <div className="flex-[2] font-title-sm text-title-sm text-on-surface">{name}</div>
                <div className="flex-1 font-label-caps text-label-caps text-on-surface-variant uppercase">{status}</div>
                <div className="flex-1 font-body-sm text-body-sm text-on-surface-variant">{date}</div>
                <div className="flex-1 font-body-sm text-body-sm text-on-surface text-right">{spend}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Overlay */}
        <div className="fixed inset-0 bg-on-background/10 backdrop-blur-[1px] z-30"></div>

        {/* Right Side Drawer */}
        {showDrawer && (
          <aside className="fixed top-0 right-0 h-full w-[480px] bg-surface z-40 border-l border-outline-variant/15 flex flex-col shadow-2xl">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-lg py-md border-b border-outline-variant/15 bg-surface">
              <h2 className="font-headline-md text-headline-md text-primary tracking-tight">
                {isEdit ? 'Edit Customer Details' : 'New Customer'}
              </h2>
              <Link to="/customers">
                <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant">
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </Link>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto px-lg py-lg space-y-md bg-surface-container-lowest">
              {/* Avatar */}
              <div className="flex items-center gap-md mb-lg">
                <div className="w-20 h-20 rounded-full bg-surface-variant overflow-hidden border border-outline-variant/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '36px' }}>person</span>
                </div>
                <div>
                  <button className="font-button text-button text-primary hover:text-primary-container transition-colors mb-xs">Change Photo</button>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">JPG, GIF or PNG. Max size of 800K</p>
                </div>
              </div>

              {/* Full Name */}
              <div className="flex flex-col gap-xs">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase" htmlFor="cname">Full Name</label>
                <input className="w-full h-12 px-sm bg-transparent border border-outline-variant/50 focus:border-primary-container focus:border-2 focus:ring-0 font-body-md text-body-md text-on-surface transition-all outline-none" id="cname" type="text" defaultValue={isEdit ? 'Madeleine Croft' : ''} placeholder="Full name..." />
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-xs">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase" htmlFor="cphone">Phone Number</label>
                <div className="relative">
                  <span className="absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant material-symbols-outlined text-[18px]">call</span>
                  <input className="w-full h-12 pl-10 pr-sm bg-transparent border border-outline-variant/50 focus:border-primary-container focus:border-2 focus:ring-0 font-body-md text-body-md text-on-surface transition-all outline-none" id="cphone" type="tel" defaultValue={isEdit ? '+1 (555) 019-2834' : ''} placeholder="+84 ..." />
                </div>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-xs">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase" htmlFor="cemail">Email Address</label>
                <div className="relative">
                  <span className="absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant material-symbols-outlined text-[18px]">mail</span>
                  <input className="w-full h-12 pl-10 pr-sm bg-transparent border border-outline-variant/50 focus:border-primary-container focus:border-2 focus:ring-0 font-body-md text-body-md text-on-surface transition-all outline-none" id="cemail" type="email" defaultValue={isEdit ? 'm.croft@press.com' : ''} placeholder="email@example.com" />
                </div>
              </div>

              <hr className="border-t border-outline-variant/15 my-md" />

              {/* Customer Group */}
              <div className="flex flex-col gap-xs">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase" htmlFor="cgroup">Customer Group</label>
                <div className="relative">
                  <select className="w-full h-12 px-sm bg-transparent border border-outline-variant/50 focus:border-primary-container focus:border-2 focus:ring-0 font-body-md text-body-md text-on-surface appearance-none transition-all outline-none cursor-pointer" id="cgroup">
                    <option value="vip">VIP</option>
                    <option value="general">General</option>
                    <option value="press" selected>Press</option>
                  </select>
                  <span className="absolute right-sm top-1/2 -translate-y-1/2 text-on-surface-variant material-symbols-outlined text-[20px] pointer-events-none">expand_more</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">Determines access to exclusive previews and event invitations.</p>
              </div>

              {/* Notes */}
              <div className="flex flex-col gap-xs pt-sm">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase" htmlFor="cnotes">Private Notes</label>
                <textarea className="w-full p-sm bg-transparent border border-outline-variant/50 focus:border-primary-container focus:border-2 focus:ring-0 font-body-md text-body-md text-on-surface transition-all outline-none resize-none" id="cnotes" rows={4} defaultValue={isEdit ? 'Prefers contact via email. Attended the Spring Collection preview event.' : ''} placeholder="Internal notes about this client..."></textarea>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="px-lg py-md border-t border-outline-variant/15 bg-surface flex justify-end gap-md">
              <Link to="/customers">
                <button className="h-12 px-xl bg-transparent border border-primary-container text-primary-container font-button text-button hover:bg-primary/5 transition-colors">Cancel</button>
              </Link>
              <button className="h-12 px-xl bg-primary-container text-on-primary font-button text-button hover:bg-primary transition-colors">
                {isEdit ? 'Save Changes' : 'Create Client'}
              </button>
            </div>
          </aside>
        )}
      </main>
    </div>
  );
}
