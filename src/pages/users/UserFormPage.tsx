import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';

const mockStaffMembers: Record<string, {
  id: number;
  name: string;
  email: string;
  role: string;
  active: boolean;
  initials: string;
}> = {
  '1': { id: 1, name: 'Julian Vance', email: 'j.vance@atelier.com', role: 'Sales Associate', active: true, initials: 'JV' },
  '2': { id: 2, name: 'Clara Moreau', email: 'c.moreau@atelier.com', role: 'Store Manager', active: true, initials: 'CM' },
  '3': { id: 3, name: 'Thomas Lin', email: 't.lin@atelier.com', role: 'Sales Associate', active: false, initials: 'TL' },
  '4': { id: 4, name: 'Elena Rossi', email: 'e.rossi@atelier.com', role: 'Sales Associate', active: true, initials: 'ER' },
};

export default function UserFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const employee = isEdit ? mockStaffMembers[id || '1'] : null;

  const [active, setActive] = useState(employee ? employee.active : true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Redirect back to User List page after saving
    navigate('/users');
  };

  return (
    <div className="font-body-md text-on-background flex h-screen overflow-hidden bg-background">
      {/* SideNavBar */}
      <aside className="hidden md:flex flex-col bg-background border-r border-outline/10 w-64 h-full py-lg fixed left-0 top-0">
        <div className="px-5 mb-lg">
          <h1 className="font-display-lg text-display-lg text-primary tracking-tighter" style={{ fontSize: '32px', lineHeight: '40px' }}>Atelier</h1>
          <p className="font-label-caps text-label-caps text-on-surface-variant mt-xs">Luxury Retail Management</p>
        </div>
        <nav className="flex-1 flex flex-col gap-sm">
          <Link to="/dashboard" className="flex items-center gap-sm text-on-surface-variant pl-5 hover:text-primary transition-colors py-2">
            <span className="material-symbols-outlined">dashboard</span><span className="font-button text-button">Dashboard</span>
          </Link>
          <Link to="/orders" className="flex items-center gap-sm text-on-surface-variant pl-5 hover:text-primary transition-colors py-2">
            <span className="material-symbols-outlined">shopping_bag</span><span className="font-button text-button">Orders</span>
          </Link>
          <Link to="/products" className="flex items-center gap-sm text-on-surface-variant pl-5 hover:text-primary transition-colors py-2">
            <span className="material-symbols-outlined">inventory_2</span><span className="font-button text-button">Products</span>
          </Link>
          <Link to="/customers" className="flex items-center gap-sm text-on-surface-variant pl-5 hover:text-primary transition-colors py-2">
            <span className="material-symbols-outlined">group</span><span className="font-button text-button">Customers</span>
          </Link>
          <Link to="/users" className="flex items-center gap-sm text-primary font-semibold border-l-4 border-primary pl-4 py-2 bg-surface-container-low">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>badge</span><span className="font-button text-button">Employees</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 flex flex-col h-screen overflow-y-auto">
        <header className="bg-background/80 backdrop-blur-md flex justify-between items-center h-20 px-margin-desktop border-b border-outline/10 sticky top-0 z-10">
          <div className="flex items-center gap-md">
            <Link to="/users" className="flex items-center gap-xs text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              <span className="font-body-sm text-body-sm">Back to Staff Directory</span>
            </Link>
          </div>
          <div className="flex items-center gap-md">
            <button className="text-on-surface-variant hover:opacity-80">
              <span className="material-symbols-outlined">notifications</span>
            </button>
          </div>
        </header>

        <div className="px-margin-desktop py-lg max-w-[960px] mx-auto w-full">
          {/* Page Header */}
          <div className="mb-lg border-b border-outline/10 pb-sm">
            <h2 className="font-display-lg text-display-lg text-on-surface tracking-tighter" style={{ fontSize: '32px', lineHeight: '40px' }}>
              {isEdit ? 'Edit Employee Details' : 'Onboard New Staff Member'}
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Configure corporate access, roles, and administrative permissions.</p>
          </div>

          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
            {/* Left form inputs (8 columns) */}
            <div className="md:col-span-8 flex flex-col gap-md">
              {/* Profile card section */}
              <div className="bg-surface rounded-xl border border-outline/10 p-md flex flex-col gap-md">
                <h3 className="font-title-sm text-title-sm text-on-surface pb-sm border-b border-outline/10">Personal Credentials</h3>
                
                {/* Full name input */}
                <div className="flex flex-col gap-xs">
                  <label className="font-label-caps text-label-caps text-on-surface-variant uppercase" htmlFor="emp-name">Full Name</label>
                  <input
                    id="emp-name"
                    required
                    defaultValue={employee?.name || ''}
                    placeholder="e.g. Jean Dupont"
                    className="w-full h-12 px-sm bg-transparent border border-outline/30 focus:border-primary focus:border-2 focus:ring-0 font-body-md text-body-md text-on-surface transition-all outline-none rounded"
                    type="text"
                  />
                </div>

                {/* Email input */}
                <div className="flex flex-col gap-xs">
                  <label className="font-label-caps text-label-caps text-on-surface-variant uppercase" htmlFor="emp-email">Corporate Email Address</label>
                  <input
                    id="emp-email"
                    required
                    defaultValue={employee?.email || ''}
                    placeholder="e.g. j.dupont@atelier.com"
                    className="w-full h-12 px-sm bg-transparent border border-outline/30 focus:border-primary focus:border-2 focus:ring-0 font-body-md text-body-md text-on-surface transition-all outline-none rounded"
                    type="email"
                  />
                </div>

                {/* Role select */}
                <div className="flex flex-col gap-xs">
                  <label className="font-label-caps text-label-caps text-on-surface-variant uppercase" htmlFor="emp-role">Assigned Role</label>
                  <div className="relative">
                    <select
                      id="emp-role"
                      defaultValue={employee?.role || 'Sales Associate'}
                      className="w-full h-12 px-sm bg-transparent border border-outline/30 focus:border-primary focus:border-2 focus:ring-0 font-body-md text-body-md text-on-surface transition-all outline-none rounded appearance-none cursor-pointer"
                    >
                      <option value="Sales Associate">Sales Associate</option>
                      <option value="Store Manager">Store Manager</option>
                      <option value="VIP Client Advisor">VIP Client Advisor</option>
                      <option value="Inventory Specialist">Inventory Specialist</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-sm top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
                  </div>
                </div>

                {!isEdit && (
                  <div className="flex flex-col gap-xs">
                    <label className="font-label-caps text-label-caps text-on-surface-variant uppercase" htmlFor="emp-pass">Temporary Password</label>
                    <input
                      id="emp-pass"
                      required
                      placeholder="••••••••"
                      className="w-full h-12 px-sm bg-transparent border border-outline/30 focus:border-primary focus:border-2 focus:ring-0 font-body-md text-body-md text-on-surface transition-all outline-none rounded"
                      type="password"
                    />
                  </div>
                )}
              </div>

              {/* Permissions card section */}
              <div className="bg-surface rounded-xl border border-outline/10 p-md flex flex-col gap-md">
                <h3 className="font-title-sm text-title-sm text-on-surface pb-sm border-b border-outline/10">Access & Control Permissions</h3>
                <div className="space-y-sm">
                  {[
                    { title: 'Access Point-of-Sale (POS)', desc: 'Allows the user to log in and process sales checkouts and returns.' },
                    { title: 'Manage Product Catalog', desc: 'Grants access to add, edit, and archive inventory products and variants.' },
                    { title: 'View Store Financial Reports', desc: 'Allows viewing daily dashboard sales summaries, margins, and trends.' },
                    { title: 'Edit Loyalty Tiers', desc: 'Grants administrative permission to change customer loyalty rewards rates.' }
                  ].map((p, i) => (
                    <label key={i} className="flex items-start gap-sm cursor-pointer group">
                      <input type="checkbox" defaultChecked={i < 2} className="mt-1 h-4 w-4 rounded border-outline/30 text-primary focus:ring-primary" />
                      <div>
                        <h4 className="font-title-sm text-title-sm text-on-surface group-hover:text-primary transition-colors">{p.title}</h4>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">{p.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Right form info/actions (4 columns) */}
            <div className="md:col-span-4 flex flex-col gap-md">
              {/* Account Status management */}
              <div className="bg-surface rounded-xl border border-outline/10 p-md flex flex-col gap-sm">
                <h3 className="font-title-sm text-title-sm text-on-surface pb-xs border-b border-outline/10">Account Status</h3>
                
                <div className="flex items-center justify-between py-sm">
                  <span className="font-body-md text-body-md text-on-surface-variant">Active Status</span>
                  <button
                    type="button"
                    onClick={() => setActive(!active)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${active ? 'bg-primary' : 'bg-outline-variant/30'}`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${active ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  Suspended accounts are locked out of the POS system immediately. Their profile data is preserved for audit trails.
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-sm">
                <button
                  type="submit"
                  className="w-full h-12 bg-primary text-on-primary rounded font-button text-button hover:opacity-90 transition-opacity flex items-center justify-center gap-xs"
                >
                  <span className="material-symbols-outlined text-[18px]">done</span>
                  Save Staff Details
                </button>
                <Link
                  to="/users"
                  className="w-full h-12 border border-outline/30 text-on-surface rounded font-button text-button hover:bg-surface-container flex items-center justify-center transition-colors"
                >
                  Cancel
                </Link>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
