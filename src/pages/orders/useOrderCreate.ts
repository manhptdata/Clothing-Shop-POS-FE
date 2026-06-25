import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '@/hooks/useDebounce';
import { useGetProductsQuery } from '@/redux/api/productApi';
import {
  useGetCustomersQuery,
  useCreateCustomerMutation,
  useGetCustomerGroupsQuery,
  useGetCustomerByIdQuery
} from '@/redux/api/customerApi';
import { useCreateOrderMutation } from '@/redux/api/orderApi';
import type { Product, ProductVariant } from '@/types/product.types';
import type { Customer } from '@/types/customer.types';

export interface CartItem {
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

export function useOrderCreate() {
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

  // Query full customer profile (points and vouchers) when selected
  const { data: fullCustomerData } = useGetCustomerByIdQuery(
    selectedCustomer?.id as number,
    { skip: !selectedCustomer || selectedCustomer.id === 1 }
  );

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [note, setNote] = useState('');
  const [customerPaid, setCustomerPaid] = useState<number | ''>('');
  const [isPaidModified, setIsPaidModified] = useState(false);

  const [pointsToUse, setPointsToUse] = useState<number>(0);
  const [voucherCode, setVoucherCode] = useState('');

  // Reset points and voucher when customer changes
  useEffect(() => {
    setPointsToUse(0);
    setVoucherCode('');
    setIsPaidModified(false);
  }, [selectedCustomer, customerType]);

  // Category Filtering
  const [activeCategory, setActiveCategory] = useState('Tất cả');

  // Modals state
  const [variantSelectorProduct, setVariantSelectorProduct] = useState<Product | null>(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'QR_PAYOS'>('CASH');
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

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
  const groups = groupData?.data?.content || [];
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
  const categories = ['Tất cả', ...new Set(products.map(p => p.category?.name).filter(Boolean) as string[])];

  // Filter products by category
  const filteredProducts = activeCategory === 'Tất cả'
    ? products
    : products.filter(p => p.category?.name === activeCategory);

  const subtotal = cart.reduce((sum, item) => sum + item.variant.salePrice * item.quantity, 0);
  const tax = Math.round(subtotal * 0.08); // 8% VAT
  const rawTotal = subtotal + tax;

  // Vouchers calculation (Loyalty Program)
  const activeCustomer = fullCustomerData?.data || selectedCustomer;
  const vouchersList = fullCustomerData?.data?.vouchers || [];
  const activeVoucher = customerType === 'MEMBER'
    ? vouchersList.find((v: any) => v.voucherCode.toLowerCase() === voucherCode.trim().toLowerCase() && v.status === 'UNUSED')
    : null;

  const isVoucherValid = Boolean(activeVoucher && (rawTotal >= activeVoucher.minOrderValue));
  const voucherDiscount = isVoucherValid && activeVoucher ? Math.min(rawTotal, activeVoucher.discountAmount) : 0;
  const remainingAfterVoucher = Math.max(0, rawTotal - voucherDiscount);

  // Points calculation (1 point = 1,000 VND discount)
  const availablePoints = customerType === 'MEMBER' ? (activeCustomer?.rewardPoints || 0) : 0;
  const maxPointsAbleToUse = Math.min(availablePoints, Math.ceil(remainingAfterVoucher / 1000));
  const pointsDiscount = customerType === 'MEMBER'
    ? Math.min(remainingAfterVoucher, pointsToUse * 1000)
    : 0;

  const total = Math.max(0, remainingAfterVoucher - pointsDiscount);

  // Auto-sync customerPaid with total unless overridden by cashier
  useEffect(() => {
    if (!isPaidModified) {
      setCustomerPaid(total === 0 ? '' : total);
    }
  }, [total, isPaidModified]);

  const changeAmount = customerPaid !== '' ? Math.max(0, customerPaid - total) : 0;

  const voucherError = customerType === 'MEMBER' && voucherCode && !activeVoucher
    ? 'Mã không hợp lệ hoặc đã sử dụng'
    : activeVoucher && rawTotal < activeVoucher.minOrderValue
      ? `Chưa đạt đơn tối thiểu: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(activeVoucher.minOrderValue)}`
      : null;

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
      const payload = {
        fullName: newCustomerForm.fullName,
        phone: newCustomerForm.phone,
        gender: newCustomerForm.gender,
      };

      const response = await createCustomer(payload as any).unwrap();

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
      alert('Không thể tạo khách hàng. Vui lòng kiểm tra lại số điện thoại hoặc định dạng dữ liệu.');
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

    if (paymentMethod === 'CASH') {
      if (customerPaid === '' || customerPaid < total) {
        alert('Số tiền khách thanh toán không hợp lệ hoặc thiếu.');
        return;
      }
      await confirmCheckout();
    } else {
      setIsQRModalOpen(true);
    }
  };

  const confirmCheckout = async () => {
    try {
      const orderPayload = {
        customerId: customerType === 'GUEST' ? 1 : (selectedCustomer?.id || 1),
        paidAmount: paymentMethod === 'QR_PAYOS' ? total : Number(customerPaid),
        paymentMethod,
        note: note || undefined,
        pointsToUse: customerType === 'MEMBER' ? pointsToUse : 0,
        voucherCode: (customerType === 'MEMBER' && isVoucherValid && voucherCode) ? voucherCode.trim() : undefined,
        items: cart.map(item => ({
          variantId: item.variant.id as number,
          quantity: item.quantity,
        })),
      };

      const response = await createOrder(orderPayload).unwrap();
      if (response.data) {
        alert(`Thanh toán thành công! Mã hóa đơn: ${response.data.orderNumber}`);
        setIsQRModalOpen(false);
        navigate('/orders');
      }
    } catch (error: any) {
      alert(error?.data?.message || 'Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.');
    }
  };

  return {
    state: {
      isProductsLoading,
      categories,
      activeCategory,
      filteredProducts,
      cart,
      variantSelectorProduct,
      isCustomerModalOpen,
      newCustomerForm,
      customerType,
      selectedCustomer,
      defaultCustomer,
      searchCustomerQuery,
      isSearchFocused,
      debouncedSearch,
      customerSearchData,
      groups,
      vouchersList,
      voucherCode,
      voucherError,
      isVoucherValid,
      activeVoucher,
      voucherDiscount,
      availablePoints,
      pointsToUse,
      maxPointsAbleToUse,
      pointsDiscount,
      customerPaid,
      total,
      changeAmount,
      subtotal,
      tax,
      note,
      isCreatingOrder,
      paymentMethod,
      isQRModalOpen
    },
    actions: {
      setActiveCategory,
      handleProductClick,
      handleAddToCart,
      setVariantSelectorProduct,
      handleUpdateQuantity,
      handleRemoveFromCart,
      setCustomerType,
      setSelectedCustomer,
      setSearchCustomerQuery,
      setIsSearchFocused,
      handleSelectCustomer,
      setIsCustomerModalOpen,
      setNewCustomerForm,
      handleCreateCustomerSubmit,
      setVoucherCode,
      setPointsToUse,
      setCustomerPaid,
      setIsPaidModified,
      setNote,
      handleCheckout,
      setPaymentMethod,
      setIsQRModalOpen,
      confirmCheckout
    }
  };
}
