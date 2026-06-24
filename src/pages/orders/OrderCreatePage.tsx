import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useDebounce } from '@/hooks/useDebounce';
import { useGetProductsQuery } from '@/redux/api/productApi';
import { 
  useGetCustomersQuery, 
  useCreateCustomerMutation, 
  useGetCustomerGroupsQuery 
} from '@/redux/api/customerApi';
import { useCreateOrderMutation } from '@/redux/api/orderApi';
import type { Product, ProductVariant } from '@/types/product.types';
import type { Customer } from '@/types/customer.types';

interface CartItem {
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

export default function OrderCreatePage() {
  const navigate = useNavigate();

  // --- API Hooks ---
  const { data: productData, isLoading: isProductsLoading } = useGetProductsQuery();
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();
  const [createCustomer] = useCreateCustomerMutation();
  const { data: groupData } = useGetCustomerGroupsQuery();

  // --- State ---
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerType, setCustomerType] = useState<'GUEST' | 'MEMBER'>('GUEST');
  const [searchCustomerQuery, setSearchCustomerQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [note, setNote] = useState('');
  const [customerPaid, setCustomerPaid] = useState<number | ''>('');
  
  // Category Filtering
  const [activeCategory, setActiveCategory] = useState('Tất cả');

  // Modals state
  const [variantSelectorProduct, setVariantSelectorProduct] = useState<Product | null>(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  // New Customer Form State
  const [newCustomerForm, setNewCustomerForm] = useState({
    fullName: '',
    phone: '',
    gender: 'MALE' as 'MALE' | 'FEMALE' | 'OTHER',
    groupId: 0,
  });

  // Debounced search for existing customers
  const debouncedSearch = useDebounce(searchCustomerQuery, 300);
  const { data: customerSearchData } = useGetCustomersQuery(
    { search: debouncedSearch, page: 0, size: 5 },
    { skip: !debouncedSearch }
  );

  // Query for default walk-in "Khách lẻ" on mount
  const { data: defaultCustomerSearch } = useGetCustomersQuery(
    { search: 'Khách lẻ', page: 0, size: 1 }
  );
  const defaultCustomer = defaultCustomerSearch?.data?.content?.[0] || null;

  // Auto-fill default group when groups are loaded
  const groups = groupData?.data || [];
  useEffect(() => {
    if (groups.length > 0 && newCustomerForm.groupId === 0) {
      setNewCustomerForm(prev => ({ ...prev, groupId: groups[0].id }));
    }
  }, [groups]);

  // Set default guest customer if GUEST option is active
  useEffect(() => {
    if (customerType === 'GUEST' && defaultCustomer) {
      setSelectedCustomer(defaultCustomer);
    }
  }, [customerType, defaultCustomer]);

  // --- Computed values ---
  const products = productData?.data?.content || [];
  
  // Extract unique categories from products
  const categories = ['Tất cả', ...new Set(products.map(p => p.category?.name).filter(Boolean))];

  // Filter products by category
  const filteredProducts = activeCategory === 'Tất cả' 
    ? products 
    : products.filter(p => p.category?.name === activeCategory);

  const subtotal = cart.reduce((sum, item) => sum + item.variant.salePrice * item.quantity, 0);
  const tax = Math.round(subtotal * 0.08); // 8% VAT
  const total = subtotal + tax;
  const changeAmount = customerPaid !== '' ? Math.max(0, customerPaid - total) : 0;

  // --- Handlers ---
  const handleAddToCart = (product: Product, variant: ProductVariant) => {
    if (variant.quantity <= 0) return; // Hết hàng
    
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(item => item.variant.id === variant.id);
      if (existingIndex > -1) {
        const newCart = [...prevCart];
        const newQty = newCart[existingIndex].quantity + 1;
        if (newQty <= variant.quantity) {
          newCart[existingIndex].quantity = newQty;
        }
        return newCart;
      }
      return [...prevCart, { product, variant, quantity: 1 }];
    });
    setVariantSelectorProduct(null);
  };

  const handleProductClick = (product: Product) => {
    if (!product.variants || product.variants.length === 0) return;
    
    if (product.variants.length === 1) {
      handleAddToCart(product, product.variants[0]);
    } else {
      setVariantSelectorProduct(product);
    }
  };

  const handleUpdateQuantity = (variantId: number, amount: number) => {
    setCart((prevCart) => {
      return prevCart.map(item => {
        if (item.variant.id === variantId) {
          const newQty = item.quantity + amount;
          if (newQty <= 0) return null;
          if (newQty > (item.variant.quantity || 0)) return item; // limit to stock
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveFromCart = (variantId: number) => {
    setCart(prev => prev.filter(item => item.variant.id !== variantId));
  };

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerType('MEMBER');
    setIsSearchFocused(false);
    setSearchCustomerQuery('');
  };

  const handleCreateCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await createCustomer(newCustomerForm).unwrap();
      if (response.data) {
        setSelectedCustomer(response.data);
        setCustomerType('MEMBER');
        setIsCustomerModalOpen(false);
        setNewCustomerForm({
          fullName: '',
          phone: '',
          gender: 'MALE',
          groupId: groups[0]?.id || 1,
        });
      }
    } catch (err) {
      alert('Không thể tạo khách hàng. Vui lòng kiểm tra lại số điện thoại.');
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán.');
      return;
    }
    if (customerType === 'MEMBER' && !selectedCustomer) {
      alert('Vui lòng chọn khách hàng thành viên để thanh toán.');
      return;
    }
    if (customerPaid === '' || customerPaid < total) {
      alert('Số tiền khách thanh toán không hợp lệ hoặc thiếu.');
      return;
    }

    try {
      const orderPayload = {
        customerId: customerType === 'GUEST' ? 1 : (selectedCustomer?.id || 1),
        warehouseId: 1, // Default warehouse
        totalAmount: total,
        customerPaid: Number(customerPaid),
        changeAmount: changeAmount,
        note: note || undefined,
        items: cart.map(item => ({
          productId: item.variant.id as number, // variant id mapping to productId in database/orderItem
          quantity: item.quantity,
          price: item.variant.salePrice,
        })),
      };

      const response = await createOrder(orderPayload).unwrap();
      if (response.data) {
        alert(`Thanh toán thành công! Mã hóa đơn: ${response.data.code}`);
        navigate('/orders');
      }
    } catch (error: any) {
      alert(error?.data?.message || 'Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.');
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto w-full">
      {/* POS Split Layout */}
      <div className="flex flex-col lg:flex-row gap-gutter h-[calc(100vh-8.5rem)]">
        
        {/* Left: Catalog (65%) */}
        <section className="w-full lg:w-[65%] flex flex-col h-full overflow-hidden">
          {/* Filters */}
          <div className="flex gap-sm overflow-x-auto pb-2 mb-md scrollbar-none flex-shrink-0">
            {categories.map((cat) => (
              <button 
                key={cat} 
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-lg font-button text-button whitespace-nowrap transition-all duration-300 ${activeCategory === cat ? 'bg-primary text-on-primary shadow-sm scale-102' : 'border border-outline/10 text-on-surface-variant hover:border-primary/50 hover:text-primary bg-surface/50'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 gap-md content-start">
            {isProductsLoading ? (
              <div className="col-span-full py-16 text-center text-on-surface-variant/75">
                <span className="material-symbols-outlined animate-spin text-3xl mb-2">sync</span>
                <p className="text-body-md font-medium">Đang tải danh sách sản phẩm...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="col-span-full py-16 text-center text-on-surface-variant/75">
                <span className="material-symbols-outlined text-4xl mb-2 text-outline/50">inventory_2</span>
                <p className="text-body-md">Không tìm thấy sản phẩm nào trong danh mục này.</p>
              </div>
            ) : (
              filteredProducts.map((p) => {
                // Get display price from first variant
                const firstVar = p.variants?.[0];
                const displayPrice = firstVar ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(firstVar.salePrice) : 'Liên hệ';
                const totalStock = p.variants?.reduce((sum, v) => sum + (v.quantity || 0), 0) || 0;
                const isOutOfStock = totalStock === 0;

                // Check if any variant is currently in the cart
                const cartQty = cart.filter(item => item.product.id === p.id).reduce((sum, item) => sum + item.quantity, 0);

                return (
                  <div 
                    key={p.id} 
                    onClick={() => !isOutOfStock && handleProductClick(p)}
                    className={`group border rounded-xl overflow-hidden bg-surface-container-lowest cursor-pointer flex flex-col relative transition-all duration-300 ${cartQty > 0 ? 'border-primary shadow-[0_4px_12px_rgba(27,138,84,0.08)]' : 'border-outline/10 hover:border-primary/50 hover:shadow-sm'} ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="aspect-[4/5] bg-surface-container-low relative overflow-hidden flex items-center justify-center">
                      {p.imageUrls && p.imageUrls.length > 0 ? (
                        <img src={p.imageUrls[0]} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <span className="material-symbols-outlined text-5xl text-on-surface-variant/20">checkroom</span>
                      )}
                      
                      {cartQty > 0 && (
                        <div className="absolute top-2 left-2 bg-primary text-on-primary px-2.5 py-1 rounded-full flex items-center gap-1 z-10 shadow-sm">
                          <span className="material-symbols-outlined text-[12px] font-bold">check</span>
                          <span className="text-[10px] font-semibold">{cartQty} trong giỏ</span>
                        </div>
                      )}

                      <div className={`absolute top-2 right-2 bg-surface-container-lowest/90 px-2 py-0.5 rounded text-[10px] font-semibold border ${isOutOfStock ? 'text-error border-error/20 bg-error-container' : 'text-on-surface-variant border-outline/10'}`}>
                        {isOutOfStock ? 'Hết hàng' : `Kho: ${totalStock}`}
                      </div>
                    </div>

                    <div className="p-sm flex flex-col flex-1 justify-between gap-xs">
                      <div>
                        <h3 className="font-body-sm text-body-sm font-semibold text-on-background line-clamp-2 min-h-[2.5rem]">{p.name}</h3>
                        <p className="font-label-caps text-label-caps text-on-surface-variant/75 mt-0.5">{p.category?.name || 'Phân loại chung'}</p>
                      </div>
                      <div className="flex justify-between items-center mt-2 pt-xs border-t border-outline/5">
                        <span className="font-title-sm text-title-sm text-primary font-bold">{displayPrice}</span>
                        <button 
                          disabled={isOutOfStock}
                          className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all duration-300 disabled:cursor-not-allowed"
                        >
                          <span className="material-symbols-outlined text-sm font-bold">add</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Right: Cart & Checkout (35%) */}
        <section className="w-full lg:w-[35%] bg-inverse-surface border-l border-outline/10 flex flex-col rounded-xl overflow-hidden h-full">
          
          {/* Header */}
          <div className="px-md py-md border-b border-outline/20 bg-inverse-surface sticky top-0 z-10 flex-shrink-0">
            <h2 className="font-headline-md text-headline-md text-on-tertiary">Đơn hàng hiện tại</h2>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-md flex flex-col gap-md">
            
            {/* Customer CRM section */}
            <div className="bg-[#2a2f35] border border-outline/20 rounded-xl p-md flex flex-col gap-sm">
              <div className="flex items-center justify-between">
                <span className="font-label-caps text-label-caps text-outline uppercase">Khách hàng</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setCustomerType('GUEST');
                      setSelectedCustomer(defaultCustomer);
                    }}
                    className={`px-3 py-1 rounded text-xs font-semibold transition-all ${customerType === 'GUEST' ? 'bg-primary text-on-primary' : 'bg-transparent text-outline hover:text-on-tertiary border border-outline/20'}`}
                  >
                    Khách lẻ
                  </button>
                  <button 
                    onClick={() => {
                      setCustomerType('MEMBER');
                      if (selectedCustomer?.fullName === 'Khách lẻ') {
                        setSelectedCustomer(null);
                      }
                    }}
                    className={`px-3 py-1 rounded text-xs font-semibold transition-all ${customerType === 'MEMBER' ? 'bg-primary text-on-primary' : 'bg-transparent text-outline hover:text-on-tertiary border border-outline/20'}`}
                  >
                    Thành viên
                  </button>
                </div>
              </div>

              {customerType === 'MEMBER' ? (
                <div className="space-y-sm">
                  {selectedCustomer && selectedCustomer.fullName !== 'Khách lẻ' ? (
                    // Customer Profile Card
                    <div className="flex items-start justify-between bg-inverse-surface/40 p-sm rounded-lg border border-outline/10">
                      <div className="flex gap-sm items-center">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                          {selectedCustomer.fullName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-title-sm text-title-sm text-on-tertiary font-bold">{selectedCustomer.fullName}</h3>
                          <p className="font-body-sm text-body-sm text-outline mt-0.5">{selectedCustomer.phone}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setSelectedCustomer(null)}
                        className="text-outline hover:text-error p-1"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  ) : (
                    // Search & Suggestion box
                    <div className="relative">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[18px] text-outline">search</span>
                          <input 
                            type="text"
                            placeholder="Tìm kiếm bằng tên hoặc SĐT..."
                            value={searchCustomerQuery}
                            onChange={(e) => setSearchCustomerQuery(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            className="w-full bg-inverse-surface border border-outline/20 rounded-lg py-2 pl-9 pr-3 text-sm text-on-tertiary placeholder:text-outline/70 focus:outline-none focus:border-primary transition-all"
                          />
                        </div>
                        <Button 
                          onClick={() => setIsCustomerModalOpen(true)}
                          className="bg-primary/20 text-primary border border-primary/30 text-xs px-3"
                          leftIcon={<span className="material-symbols-outlined text-xs">add</span>}
                        >
                          Tạo khách
                        </Button>
                      </div>

                      {/* Search Dropdown list */}
                      {isSearchFocused && debouncedSearch && (
                        <div className="absolute left-0 right-0 mt-1 bg-[#1f2327] border border-outline/20 rounded-lg shadow-xl z-20 max-h-[220px] overflow-y-auto divide-y divide-outline/10">
                          {customerSearchData?.data?.content && customerSearchData.data.content.length > 0 ? (
                            customerSearchData.data.content
                              .filter(c => c.fullName !== 'Khách lẻ')
                              .map(c => (
                                <div 
                                  key={c.id} 
                                  onClick={() => handleSelectCustomer(c)}
                                  className="p-sm hover:bg-[#2e343a] cursor-pointer flex justify-between items-center transition-colors"
                                >
                                  <div>
                                    <h4 className="text-sm font-semibold text-on-tertiary">{c.fullName}</h4>
                                    <p className="text-xs text-outline mt-0.5">{c.phone}</p>
                                  </div>
                                  <span className="material-symbols-outlined text-xs text-primary">chevron_right</span>
                                </div>
                              ))
                          ) : (
                            <div className="p-md text-center text-xs text-outline">
                              Không tìm thấy khách hàng. <br/>
                              <button 
                                onClick={() => {
                                  setIsCustomerModalOpen(true);
                                  setIsSearchFocused(false);
                                }}
                                className="text-primary font-semibold hover:underline mt-1 inline-block"
                              >
                                + Thêm khách hàng mới
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                // Guest Profile
                <div className="bg-inverse-surface/30 p-sm rounded-lg border border-outline/10 flex items-center gap-sm">
                  <div className="w-10 h-10 rounded-full bg-outline/20 flex items-center justify-center text-outline font-bold">
                    KL
                  </div>
                  <div>
                    <h3 className="font-title-sm text-title-sm text-on-tertiary font-bold">Khách lẻ vãng lai</h3>
                    <p className="font-body-sm text-body-sm text-outline mt-0.5">Không tích lũy điểm thưởng</p>
                  </div>
                </div>
              )}
            </div>

            {/* Line Items List */}
            <div className="flex-1 flex flex-col gap-sm">
              <h4 className="font-label-caps text-label-caps text-outline uppercase mb-1">
                Sản phẩm đã chọn ({cart.reduce((sum, item) => sum + item.quantity, 0)})
              </h4>
              
              {cart.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-12 text-outline/50 border-2 border-dashed border-outline/10 rounded-xl">
                  <span className="material-symbols-outlined text-3xl mb-1">shopping_cart</span>
                  <p className="text-xs font-semibold">Giỏ hàng đang trống</p>
                </div>
              ) : (
                <div className="space-y-sm max-h-[300px] overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div key={item.variant.id} className="flex gap-sm bg-inverse-surface border border-outline/10 rounded-lg p-sm relative group/item">
                      
                      <div className="w-12 h-16 rounded bg-surface-container-low flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {item.product.imageUrls && item.product.imageUrls.length > 0 ? (
                          <img src={item.product.imageUrls[0]} alt={item.product.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="material-symbols-outlined text-on-surface-variant/30 text-xl">checkroom</span>
                        )}
                      </div>

                      <div className="flex-1 flex flex-col justify-between py-0.5">
                        <div className="flex justify-between items-start gap-sm">
                          <div>
                            <h5 className="font-body-sm text-body-sm text-on-tertiary font-bold line-clamp-1">{item.product.name}</h5>
                            <p className="text-[10px] text-outline mt-0.5 uppercase tracking-wide">
                              SKU: {item.variant.sku} 
                              {item.variant.option1Value ? ` | ${item.variant.option1Value.value}` : ''}
                              {item.variant.option2Value ? ` - ${item.variant.option2Value.value}` : ''}
                            </p>
                          </div>
                          <span className="font-title-sm text-title-sm text-on-tertiary font-bold whitespace-nowrap">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.variant.salePrice * item.quantity)}
                          </span>
                        </div>

                        <div className="flex justify-between items-center mt-2">
                          {/* Quantity control */}
                          <div className="flex items-center gap-3 bg-[#3d4247] rounded-lg px-2.5 py-0.5">
                            <button 
                              onClick={() => handleUpdateQuantity(item.variant.id as number, -1)}
                              className="text-outline hover:text-on-tertiary flex items-center"
                            >
                              <span className="material-symbols-outlined text-[14px] font-bold">remove</span>
                            </button>
                            <span className="font-body-sm text-on-tertiary w-4 text-center text-xs font-semibold">{item.quantity}</span>
                            <button 
                              onClick={() => handleUpdateQuantity(item.variant.id as number, 1)}
                              className="text-outline hover:text-on-tertiary flex items-center"
                            >
                              <span className="material-symbols-outlined text-[14px] font-bold">add</span>
                            </button>
                          </div>
                          
                          {/* Delete item */}
                          <button 
                            onClick={() => handleRemoveFromCart(item.variant.id as number)}
                            className="text-outline hover:text-error transition-colors p-1"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Checkout Footer Section */}
          <div className="p-md border-t border-outline/20 bg-[#1f2327] flex-shrink-0">
            
            {/* Payment Fields */}
            <div className="space-y-sm mb-4">
              <div className="grid grid-cols-2 gap-sm">
                <div>
                  <label className="text-[10px] font-bold text-outline uppercase block mb-1">Khách trả tiền</label>
                  <input 
                    type="number" 
                    placeholder="0"
                    value={customerPaid}
                    onChange={(e) => setCustomerPaid(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-[#2a2f35] border border-outline/20 rounded-lg px-3 py-1.5 text-sm text-on-tertiary focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-outline uppercase block mb-1">Tiền trả lại</label>
                  <div className="w-full bg-[#2a2f35]/50 border border-outline/20 rounded-lg px-3 py-1.5 text-sm text-outline font-bold">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(changeAmount)}
                  </div>
                </div>
              </div>
              <div>
                <input 
                  type="text"
                  placeholder="Ghi chú đơn hàng..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-[#2a2f35] border border-outline/20 rounded-lg px-3 py-1.5 text-xs text-on-tertiary focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Financial Details */}
            <div className="flex flex-col gap-2 mb-4">
              <div className="flex justify-between items-center text-outline text-xs font-medium">
                <span>Tạm tính</span>
                <span className="text-on-tertiary">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-outline text-xs font-medium">
                <span>Thuế (VAT 8%)</span>
                <span className="text-on-tertiary">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tax)}</span>
              </div>
              <div className="h-px bg-outline/20 w-full my-0.5"></div>
              <div className="flex justify-between items-end">
                <span className="font-body-md text-body-md text-on-tertiary font-bold">Tổng cộng</span>
                <span className="font-headline-md text-headline-md text-primary font-black" style={{ fontSize: '24px' }}>
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}
                </span>
              </div>
            </div>

            {/* Pay Button */}
            <Button 
              onClick={handleCheckout}
              disabled={isCreatingOrder || cart.length === 0}
              className="w-full py-4 bg-primary hover:bg-primary/95 text-on-primary rounded-xl font-bold transition-all" 
              size="lg" 
              leftIcon={isCreatingOrder ? (
                <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
              ) : (
                <span className="material-symbols-outlined text-[20px]">credit_card</span>
              )}
            >
              {isCreatingOrder ? 'Đang xử lý thanh toán...' : 'Thanh toán & Xuất hóa đơn'}
            </Button>
          </div>
        </section>
      </div>

      {/* MODAL 1: SELECT VARIANT (If product has multiple variants) */}
      {variantSelectorProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface-container-lowest border border-outline/10 rounded-2xl w-full max-w-[500px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-md border-b border-outline/10 flex justify-between items-center bg-surface-container-low">
              <div>
                <h3 className="font-headline-md text-headline-md text-on-surface font-bold">Chọn phân loại</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">{variantSelectorProduct.name}</p>
              </div>
              <button 
                onClick={() => setVariantSelectorProduct(null)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-container-high"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-md space-y-sm">
              {variantSelectorProduct.variants?.map((v) => {
                const isVarOutOfStock = (v.quantity || 0) <= 0;
                const priceStr = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v.salePrice);
                
                // Construct variant options string (e.g. Size M - Màu Đỏ)
                const optionsStr = [
                  v.option1Value?.value,
                  v.option2Value?.value,
                  v.option3Value?.value
                ].filter(Boolean).join(' - ');

                return (
                  <div 
                    key={v.id}
                    onClick={() => !isVarOutOfStock && handleAddToCart(variantSelectorProduct, v)}
                    className={`flex justify-between items-center p-md border rounded-xl transition-all duration-300 cursor-pointer ${isVarOutOfStock ? 'bg-surface-container-low opacity-40 cursor-not-allowed border-outline/5' : 'bg-surface hover:border-primary/50 hover:bg-surface-container-lowest border-outline/10'}`}
                  >
                    <div>
                      <h4 className="text-sm font-semibold text-on-surface">{optionsStr || 'Mặc định'}</h4>
                      <p className="text-xs text-on-surface-variant/75 mt-0.5">SKU: {v.sku} • Kho: {v.quantity}</p>
                    </div>
                    <div className="flex items-center gap-sm">
                      <span className="text-sm font-bold text-primary">{priceStr}</span>
                      <button 
                        disabled={isVarOutOfStock}
                        className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-on-primary transition-colors disabled:cursor-not-allowed"
                      >
                        <span className="material-symbols-outlined text-[16px] font-bold">add</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: QUICK REGISTER CUSTOMER */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form 
            onSubmit={handleCreateCustomerSubmit}
            className="bg-surface-container-lowest border border-outline/10 rounded-2xl w-full max-w-[450px] shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="p-md border-b border-outline/10 flex justify-between items-center bg-surface-container-low">
              <h3 className="font-headline-md text-headline-md text-on-surface font-bold">Thêm khách hàng mới</h3>
              <button 
                type="button"
                onClick={() => setIsCustomerModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-full"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-md space-y-md">
              <Input 
                id="modal-fullName"
                label="Họ tên khách hàng"
                required
                value={newCustomerForm.fullName}
                onChange={(e) => setNewCustomerForm(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder="Ví dụ: Nguyễn Thị Hương"
              />

              <Input 
                id="modal-phone"
                label="Số điện thoại"
                required
                pattern="[0-9]{10,11}"
                value={newCustomerForm.phone}
                onChange={(e) => setNewCustomerForm(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Ví dụ: 0987654321"
              />

              <div className="flex flex-col gap-1">
                <label className="font-label-caps text-label-caps text-on-surface-variant">Giới tính</label>
                <div className="flex gap-md mt-1">
                  {[
                    { label: 'Nam', value: 'MALE' },
                    { label: 'Nữ', value: 'FEMALE' },
                    { label: 'Khác', value: 'OTHER' }
                  ].map((g) => (
                    <label key={g.value} className="flex items-center gap-xs cursor-pointer text-sm text-on-surface">
                      <input 
                        type="radio" 
                        name="modal-gender"
                        checked={newCustomerForm.gender === g.value}
                        onChange={() => setNewCustomerForm(prev => ({ ...prev, gender: g.value as any }))}
                        className="form-radio text-primary"
                      />
                      <span>{g.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {groups.length > 1 && (
                <div className="flex flex-col gap-1">
                  <label className="font-label-caps text-label-caps text-on-surface-variant" htmlFor="modal-groupId">Nhóm khách hàng</label>
                  <select 
                    id="modal-groupId"
                    value={newCustomerForm.groupId}
                    onChange={(e) => setNewCustomerForm(prev => ({ ...prev, groupId: Number(e.target.value) }))}
                    className="w-full bg-surface border border-outline/20 rounded-lg p-2 text-sm focus:outline-none focus:border-primary"
                  >
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>{group.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="p-md border-t border-outline/10 bg-surface-container-low flex justify-end gap-sm">
              <Button 
                type="button"
                variant="outline" 
                onClick={() => setIsCustomerModalOpen(false)}
              >
                Hủy bỏ
              </Button>
              <Button 
                type="submit"
                variant="primary"
              >
                Đăng ký & Chọn
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
