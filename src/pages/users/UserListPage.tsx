import { useState } from 'react';
import { Link } from 'react-router-dom';

const staff = [
  { id: 1, name: 'Julian Vance', email: 'j.vance@atelier.com', role: 'Sales Associate', lastLogin: 'Today, 08:45 AM', active: true, initials: 'JV' },
  { id: 2, name: 'Clara Moreau', email: 'c.moreau@atelier.com', role: 'Store Manager', lastLogin: 'Yesterday, 18:30 PM', active: true, initials: 'CM' },
  { id: 3, name: 'Thomas Lin', email: 't.lin@atelier.com', role: 'Sales Associate', lastLogin: 'Oct 12, 2023', active: false, initials: 'TL' },
  { id: 4, name: 'Elena Rossi', email: 'e.rossi@atelier.com', role: 'Sales Associate', lastLogin: 'Today, 09:15 AM', active: true, initials: 'ER' },
];

export default function UserListPage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="antialiased min-h-screen flex overflow-hidden bg-background text-on-background">
      {/* SideNavBar */}
      <nav className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-64 bg-background border-r border-outline/15 z-40 py-lg">
        <div className="px-md mb-lg">
          <h1 className="font-display-lg text-display-lg text-primary tracking-tighter" style={{ fontSize: '32px', lineHeight: '40px' }}>Atelier</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">Luxury Retail Management</p>
        </div>
        <div className="flex-1 flex flex-col gap-sm">
          <Link to="/dashboard" className="flex items-center gap-sm text-on-surface-variant pl-5 hover:text-primary transition-colors py-2">
            <span className="material-symbols-outlined">dashboard</span><span className="font-body-md text-body-md">Dashboard</span>
          </Link>
          <Link to="/orders" className="flex items-center gap-sm text-on-surface-variant pl-5 hover:text-primary transition-colors py-2">
            <span className="material-symbols-outlined">shopping_bag</span><span className="font-body-md text-body-md">Orders</span>
          </Link>
          <Link to="/products" className="flex items-center gap-sm text-on-surface-variant pl-5 hover:text-primary transition-colors py-2">
            <span className="material-symbols-outlined">inventory_2</span><span className="font-body-md text-body-md">Products</span>
          </Link>
          <Link to="/customers" className="flex items-center gap-sm text-on-surface-variant pl-5 hover:text-primary transition-colors py-2">
            <span className="material-symbols-outlined">group</span><span className="font-body-md text-body-md">Customers</span>
          </Link>
          <Link to="/users" className="flex items-center gap-sm text-primary font-semibold border-l-4 border-primary pl-4 py-2 bg-primary/5">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>badge</span><span className="font-body-md text-body-md">Employees</span>
          </Link>
        </div>
        <div className="mt-auto flex flex-col gap-sm pt-md border-t border-outline/10 px-md">
          <Link to="/orders/new" className="w-full flex items-center justify-center gap-xs px-md py-sm bg-primary text-on-primary rounded font-button text-button hover:opacity-90 transition-opacity">
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Appointment
          </Link>
          <a className="flex items-center gap-sm text-on-surface-variant pl-5 hover:text-primary transition-colors py-2" href="#">
            <span className="material-symbols-outlined">settings</span><span className="font-body-md text-body-md">Settings</span>
          </a>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-64 w-full relative h-screen overflow-hidden">
        <header className="flex justify-between items-center h-20 px-margin-desktop w-full bg-background/80 backdrop-blur-md border-b border-outline/10 z-30 flex-shrink-0">
          <div className="flex-1 max-w-md">
            <div className="relative flex items-center w-full h-10 border border-outline/20 rounded bg-surface focus-within:border-primary transition-colors">
              <span className="material-symbols-outlined absolute left-3 text-on-surface-variant">search</span>
              <input className="w-full h-full pl-10 pr-4 bg-transparent border-none focus:ring-0 font-body-sm text-body-sm" placeholder="Search directory..." type="text" />
            </div>
          </div>
          <div className="flex items-center gap-md">
            <span className="font-label-caps text-label-caps text-on-surface-variant hidden lg:block">Branch: Paris Flagship</span>
            <button className="font-button text-button text-on-surface-variant hover:text-primary border border-outline/20 px-4 py-2 rounded flex items-center gap-xs">
              <span>Logout</span><span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-margin-desktop py-lg bg-background">
          <div className="max-w-[1440px] mx-auto w-full">
            <div className="flex justify-between items-center mb-md">
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface mb-1">Staff Directory</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Manage employee access, roles, and status.</p>
              </div>
              <Link to="/users/new" className="bg-primary-container text-on-primary font-button text-button px-6 py-3 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity">
                <span className="material-symbols-outlined text-[18px]">add</span> Add New Member
              </Link>
            </div>

            <div className="bg-surface-container-lowest border border-outline/10 rounded-xl overflow-hidden mt-sm">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface border-b border-outline/10">
                  <tr>
                    <th className="font-label-caps text-label-caps text-on-surface-variant py-4 px-6 font-semibold w-1/3">Full Name</th>
                    <th className="font-label-caps text-label-caps text-on-surface-variant py-4 px-6 font-semibold hidden md:table-cell">Username</th>
                    <th className="font-label-caps text-label-caps text-on-surface-variant py-4 px-6 font-semibold">Role</th>
                    <th className="font-label-caps text-label-caps text-on-surface-variant py-4 px-6 font-semibold hidden lg:table-cell">Last Login</th>
                    <th className="font-label-caps text-label-caps text-on-surface-variant py-4 px-6 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline/10">
                  {staff.map((s) => (
                    <tr key={s.id} className={`hover:bg-surface-variant/20 transition-colors ${!s.active ? 'opacity-60' : ''}`}>
                      <td className="py-4 px-6">
                        <Link to={`/users/${s.id}/edit`} className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center border border-outline/10 font-title-sm text-title-sm text-on-surface-variant">{s.initials}</div>
                          <span className={`font-body-md text-body-md font-medium text-on-surface hover:text-primary transition-colors ${!s.active ? 'line-through' : ''}`}>{s.name}</span>
                        </Link>
                      </td>
                      <td className="py-4 px-6 font-body-sm text-body-sm text-on-surface-variant hidden md:table-cell">{s.email}</td>
                      <td className="py-4 px-6">
                        <div className="relative inline-block w-full max-w-[160px]">
                          <select disabled={!s.active} className="block w-full appearance-none bg-transparent border border-outline/20 text-on-surface font-body-sm text-body-sm py-2 px-3 pr-8 rounded focus:outline-none">
                            <option>{s.role}</option>
                            <option>{s.role === 'Store Manager' ? 'Sales Associate' : 'Store Manager'}</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-on-surface-variant">
                            <span className="material-symbols-outlined text-[18px]">expand_more</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-body-sm text-body-sm text-on-surface-variant hidden lg:table-cell">{s.lastLogin}</td>
                      <td className="py-4 px-6 text-right">
                        <Link to={`/users/${s.id}/edit`} className={`font-label-caps text-label-caps hover:text-primary transition-colors ${s.active ? 'text-primary-container' : 'text-on-surface-variant'}`}>
                          {s.active ? 'Active' : 'Inactive'}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="bg-surface py-4 px-6 border-t border-outline/10 flex justify-between items-center">
                <span className="font-body-sm text-body-sm text-on-surface-variant">Showing 4 of 24 staff members</span>
                <div className="flex gap-2">
                  <button className="w-8 h-8 rounded flex items-center justify-center border border-outline/20 text-on-surface-variant hover:text-primary hover:border-primary transition-colors">
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                  </button>
                  <button className="w-8 h-8 rounded flex items-center justify-center border border-outline/20 text-on-surface-variant hover:text-primary hover:border-primary transition-colors">
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Add Member Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-background/40 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="bg-surface-container-lowest rounded-xl border border-outline/10 shadow-2xl w-full max-w-md mx-margin-mobile">
            <div className="flex justify-between items-center p-md border-b border-outline/10">
              <h3 className="font-title-sm text-title-sm text-on-surface">Add New Staff Member</h3>
              <button onClick={() => setShowModal(false)} className="text-on-surface-variant hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-md flex flex-col gap-sm">
              {[
                { label: 'Full Name', type: 'text', placeholder: 'e.g. Jane Doe' },
                { label: 'Username', type: 'text', placeholder: 'e.g. j.doe@atelier.com' },
                { label: 'Temporary Password', type: 'password', placeholder: '••••••••' },
              ].map((f) => (
                <div key={f.label} className="flex flex-col gap-1">
                  <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">{f.label}</label>
                  <input className="w-full bg-transparent border border-outline/20 rounded px-3 py-2 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary-container focus:border-2 transition-all" placeholder={f.placeholder} type={f.type} />
                </div>
              ))}
              <div className="flex flex-col gap-1">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Assign Role</label>
                <div className="relative w-full">
                  <select className="block w-full appearance-none bg-transparent border border-outline/20 text-on-surface font-body-md text-body-md py-2 px-3 pr-8 rounded focus:outline-none focus:border-primary-container focus:border-2">
                    <option disabled value="">Select a role...</option>
                    <option>Sales Associate</option>
                    <option>Store Manager</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-on-surface-variant">
                    <span className="material-symbols-outlined">expand_more</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-md border-t border-outline/10 flex justify-end gap-3 bg-surface/50 rounded-b-xl">
              <button onClick={() => setShowModal(false)} className="font-button text-button px-4 py-2 rounded text-on-surface-variant hover:bg-surface-variant/50 transition-colors border border-transparent">Cancel</button>
              <button className="bg-primary-container text-on-primary font-button text-button px-6 py-2 rounded hover:opacity-90 transition-opacity">Create Member</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
