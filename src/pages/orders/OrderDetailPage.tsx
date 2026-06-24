import { Link, useParams } from 'react-router-dom';

const mockOrdersDetail: Record<string, {
  id: string;
  date: string;
  status: string;
  statusClass: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerInitials: string;
  customerTier: string;
  customerPoints: string;
  handledBy: string;
  items: Array<{ name: string; sku: string; price: string; qty: number; subtotal: string }>;
  subtotal: string;
  discount: string;
  tax: string;
  total: string;
  paymentMethod: string;
  paymentStatus: string;
  timeline: Array<{ time: string; event: string; desc: string }>;
}> = {
  '90': {
    id: '#ORD-0091',
    date: 'Today, 10:22 AM',
    status: 'Completed',
    statusClass: 'bg-primary-fixed/30 text-primary-container',
    customerName: 'Eleanor Vance',
    customerEmail: 'e.vance@example.com',
    customerPhone: '+33 6 12 34 56 78',
    customerInitials: 'EV',
    customerTier: 'GOLD',
    customerPoints: '2,850',
    handledBy: 'Julian Vance (Sales Associate)',
    items: [
      { name: 'Silk Scarf - Emerald', sku: 'ACC-SLK-EMR', price: '€350', qty: 1, subtotal: '€350' }
    ],
    subtotal: '€350',
    discount: '€0',
    tax: '€70',
    total: '€420',
    paymentMethod: 'Visa ending in 4242',
    paymentStatus: 'Paid',
    timeline: [
      { time: '10:22 AM', event: 'Payment Captured', desc: 'Transaction approved via Terminal 2' },
      { time: '10:21 AM', event: 'Order Created', desc: 'Item scanned and checkout sequence initialized' }
    ]
  },
  '91': {
    id: '#ORD-0092',
    date: 'Today, 09:48 AM',
    status: 'Processing',
    statusClass: 'bg-secondary-container/50 text-on-secondary-container',
    customerName: 'Arthur Pendelton',
    customerEmail: 'a.pendelton@example.com',
    customerPhone: '+44 7700 900077',
    customerInitials: 'AP',
    customerTier: 'SILVER',
    customerPoints: '1,200',
    handledBy: 'Clara Moreau (Store Manager)',
    items: [
      { name: 'Leather Briefcase', sku: 'ACC-LTH-BRF', price: '€1,200', qty: 1, subtotal: '€1,200' }
    ],
    subtotal: '€1,200',
    discount: '€0',
    tax: '€240',
    total: '€1,440',
    paymentMethod: 'Bank Transfer',
    paymentStatus: 'Awaiting Settlement',
    timeline: [
      { time: '09:48 AM', event: 'Invoice Generated', desc: 'Sent invoice email to client' },
      { time: '09:45 AM', event: 'Order Booked', desc: 'Customer requested bank transfer payment' }
    ]
  },
  '92': {
    id: '#ORD-0093',
    date: 'Today, 09:15 AM',
    status: 'VIP Pre-Order',
    statusClass: 'bg-[#D4AF37]/20 text-[#574500]',
    customerName: 'Sophia Lauren',
    customerEmail: 's.lauren@example.com',
    customerPhone: '+33 6 98 76 54 32',
    customerInitials: 'SL',
    customerTier: 'GOLD',
    customerPoints: '4,520',
    handledBy: 'Julian Vance (Sales Associate)',
    items: [
      { name: 'Cashmere Coat', sku: 'OUT-CSH-COT', price: '€2,850', qty: 1, subtotal: '€2,850' }
    ],
    subtotal: '€2,850',
    discount: '€285 (10% Gold Member)',
    tax: '€513',
    total: '€3,078',
    paymentMethod: 'Special Account Balance',
    paymentStatus: 'Authorized',
    timeline: [
      { time: '09:15 AM', event: 'Pre-order Approved', desc: 'Fulfillment queue assignment: Priority 1' },
      { time: '09:10 AM', event: 'VIP Request Submitted', desc: 'Sourced from Paris Autumn Preview allocation' }
    ]
  }
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const details = mockOrdersDetail[id || '90'] || mockOrdersDetail['90'];

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
          <Link to="/orders" className="flex items-center gap-sm text-primary font-semibold border-l-4 border-primary pl-4 py-2 bg-surface-container-low">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>shopping_bag</span><span className="font-button text-button">Orders</span>
          </Link>
          <Link to="/products" className="flex items-center gap-sm text-on-surface-variant pl-5 hover:text-primary transition-colors py-2">
            <span className="material-symbols-outlined">inventory_2</span><span className="font-button text-button">Products</span>
          </Link>
          <Link to="/customers" className="flex items-center gap-sm text-on-surface-variant pl-5 hover:text-primary transition-colors py-2">
            <span className="material-symbols-outlined">group</span><span className="font-button text-button">Customers</span>
          </Link>
          <Link to="/users" className="flex items-center gap-sm text-on-surface-variant pl-5 hover:text-primary transition-colors py-2">
            <span className="material-symbols-outlined">badge</span><span className="font-button text-button">Employees</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 flex flex-col h-screen overflow-y-auto">
        <header className="bg-background/80 backdrop-blur-md flex justify-between items-center h-20 px-margin-desktop border-b border-outline/10 sticky top-0 z-10">
          <div className="flex items-center gap-md">
            <Link to="/orders" className="flex items-center gap-xs text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              <span className="font-body-sm text-body-sm">Back to Sales</span>
            </Link>
          </div>
          <div className="flex items-center gap-md">
            <button className="text-on-surface-variant hover:opacity-80">
              <span className="material-symbols-outlined">notifications</span>
            </button>
          </div>
        </header>

        <div className="px-margin-desktop py-lg max-w-[1440px] mx-auto w-full">
          {/* Header Info */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-lg gap-sm border-b border-outline/10 pb-md">
            <div>
              <div className="flex items-center gap-sm mb-xs">
                <h2 className="font-display-lg text-display-lg text-on-surface tracking-tighter" style={{ fontSize: '32px', lineHeight: '40px' }}>
                  {details.id}
                </h2>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${details.statusClass}`}>
                  {details.status}
                </span>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant">Placed on {details.date} • Handled by {details.handledBy}</p>
            </div>
            <div className="flex gap-sm">
              <button className="px-md py-sm border border-outline/30 text-on-surface rounded font-button text-button hover:bg-surface-container flex items-center gap-xs transition-colors">
                <span className="material-symbols-outlined text-[18px]">print</span>
                Print Invoice
              </button>
              <button className="px-md py-sm border border-error text-error rounded font-button text-button hover:bg-error-container/10 flex items-center gap-xs transition-colors">
                <span className="material-symbols-outlined text-[18px]">undo</span>
                Refund / Return
              </button>
            </div>
          </div>

          {/* Details Body Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
            {/* Left: Items list (8 columns) */}
            <div className="lg:col-span-8 flex flex-col gap-gutter">
              <div className="bg-surface rounded-xl border border-outline/10 overflow-hidden">
                <div className="p-md border-b border-outline/10 bg-surface-container-low">
                  <h3 className="font-title-sm text-title-sm text-on-surface">Order Items</h3>
                </div>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-lowest border-b border-outline/10">
                      <th className="py-sm px-md font-label-caps text-label-caps text-on-surface-variant uppercase">Product Details</th>
                      <th className="py-sm px-md font-label-caps text-label-caps text-on-surface-variant uppercase text-right">Price</th>
                      <th className="py-sm px-md font-label-caps text-label-caps text-on-surface-variant uppercase text-center w-20">Qty</th>
                      <th className="py-sm px-md font-label-caps text-label-caps text-on-surface-variant uppercase text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline/5">
                    {details.items.map((item) => (
                      <tr key={item.sku} className="hover:bg-surface-container-lowest/50 transition-colors">
                        <td className="py-md px-md">
                          <div className="flex gap-sm">
                            <div className="w-16 h-20 bg-surface-container-low border border-outline/10 rounded flex items-center justify-center flex-shrink-0">
                              <span className="material-symbols-outlined text-on-surface-variant/30 text-3xl">checkroom</span>
                            </div>
                            <div className="flex flex-col justify-between py-1">
                              <h4 className="font-title-sm text-title-sm text-on-surface">{item.name}</h4>
                              <p className="font-body-sm text-body-sm text-on-surface-variant">SKU: {item.sku}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-md px-md text-on-surface text-right font-medium">{item.price}</td>
                        <td className="py-md px-md text-on-surface-variant text-center">{item.qty}</td>
                        <td className="py-md px-md text-primary text-right font-medium">{item.subtotal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Status Timeline log */}
              <div className="bg-surface rounded-xl border border-outline/10 p-md">
                <h3 className="font-title-sm text-title-sm text-on-surface mb-md">Transaction Timeline</h3>
                <div className="relative border-l-2 border-outline-variant/30 pl-6 ml-2 space-y-md">
                  {details.timeline.map((log, index) => (
                    <div key={index} className="relative">
                      <span className="absolute -left-[31px] top-1 bg-surface border-2 border-primary rounded-full w-4 h-4 flex items-center justify-center"></span>
                      <div className="flex justify-between items-start gap-sm">
                        <div>
                          <h4 className="font-title-sm text-title-sm text-on-surface">{log.event}</h4>
                          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">{log.desc}</p>
                        </div>
                        <span className="font-body-sm text-body-sm text-outline whitespace-nowrap">{log.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Customer & Financial details (4 columns) */}
            <div className="lg:col-span-4 flex flex-col gap-gutter">
              {/* Customer CRM info card */}
              <div className="bg-surface rounded-xl border border-outline/10 p-md flex flex-col gap-sm">
                <div className="flex justify-between items-center pb-sm border-b border-outline/10">
                  <h3 className="font-title-sm text-title-sm text-on-surface">Client CRM Profile</h3>
                  <Link to={`/customers/${details.customerInitials === 'EV' ? '1' : details.customerInitials === 'AP' ? '2' : '3'}/edit`} className="text-primary hover:text-primary-container transition-colors text-xs font-button flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[16px]">edit</span> Edit CRM
                  </Link>
                </div>
                <div className="flex gap-sm items-center py-xs">
                  <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center font-title-sm text-primary">
                    {details.customerInitials}
                  </div>
                  <div>
                    <h4 className="font-title-sm text-title-sm text-on-surface">{details.customerName}</h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">{details.customerEmail}</p>
                  </div>
                </div>
                <div className="h-px bg-outline/10 w-full"></div>
                <div className="grid grid-cols-2 gap-sm pt-xs">
                  <div>
                    <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Loyalty Tier</span>
                    <span className="font-title-sm text-title-sm text-secondary-container block mt-0.5">{details.customerTier}</span>
                  </div>
                  <div>
                    <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Reward Points</span>
                    <span className="font-title-sm text-title-sm text-on-surface block mt-0.5">{details.customerPoints} pts</span>
                  </div>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="bg-surface rounded-xl border border-outline/10 p-md flex flex-col gap-sm">
                <h3 className="font-title-sm text-title-sm text-on-surface pb-sm border-b border-outline/10">Payment Summary</h3>
                <div className="space-y-sm">
                  <div className="flex justify-between items-center text-body-sm font-body-sm text-on-surface-variant">
                    <span>Subtotal</span>
                    <span className="text-on-surface">{details.subtotal}</span>
                  </div>
                  <div className="flex justify-between items-center text-body-sm font-body-sm text-on-surface-variant">
                    <span>Discount</span>
                    <span className="text-error">{details.discount}</span>
                  </div>
                  <div className="flex justify-between items-center text-body-sm font-body-sm text-on-surface-variant">
                    <span>Taxes (VAT 20%)</span>
                    <span className="text-on-surface">{details.tax}</span>
                  </div>
                  <div className="h-px bg-outline/10 w-full my-xs"></div>
                  <div className="flex justify-between items-end">
                    <span className="font-body-md text-body-md text-on-surface font-semibold">Total Paid</span>
                    <span className="font-headline-md text-headline-md text-primary font-bold">{details.total}</span>
                  </div>
                </div>
                <div className="h-px bg-outline/10 w-full my-xs"></div>
                <div className="space-y-xs">
                  <div className="flex justify-between items-center text-body-sm">
                    <span className="text-on-surface-variant">Method:</span>
                    <span className="font-medium text-on-surface">{details.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between items-center text-body-sm">
                    <span className="text-on-surface-variant">Payment Status:</span>
                    <span className="font-medium text-primary-container">{details.paymentStatus}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
