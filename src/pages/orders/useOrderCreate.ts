import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useGetProductsQuery, useLazyGetProductByIdQuery } from '@/redux/api/productApi';
import { useGetRecommendationsQuery } from '@/redux/api/recommendationApi';
import { useCreateOrderMutation, useUpdateOrderMutation, useCompleteOrderPaymentMutation } from '@/redux/api/orderApi';
import type { CartItem } from './hooks/useCart';
import type { Order, OrderRequest } from '@/types/order.types';

import { useCart } from './hooks/useCart';
import { useCustomerSelection } from './hooks/useCustomerSelection';
import { useDiscounts } from './hooks/useDiscounts';
import { useCheckout } from './hooks/useCheckout';
import { usePendingOrders } from './hooks/usePendingOrders';

export { type CartItem };

export function useOrderCreate() {
  const navigate = useNavigate();

  const { data: productData, isLoading: isProductsLoading } = useGetProductsQuery();
  const [getProductById] = useLazyGetProductByIdQuery();
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();
  const [updateOrder, { isLoading: isUpdatingOrder }] = useUpdateOrderMutation();
  const [completeOrderPayment, { isLoading: isCompletingPayment }] = useCompleteOrderPaymentMutation();

  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [searchProductQuery, setSearchProductQuery] = useState('');
  const [lastCreatedOrder, setLastCreatedOrder] = useState<Order | null>(null);
  const [pendingOrderForQR, setPendingOrderForQR] = useState<Order | null>(null);

  // Initialize Hooks
  const cart = useCart();
  const customer = useCustomerSelection();
  const discounts = useDiscounts(customer.selectedCustomer, customer.customerType, cart.rawTotal);
  const checkout = useCheckout(discounts.total);
  const pendingOrders = usePendingOrders();

  // Fetch Recommendations
  const cartProductIds = cart.cart.map(item => item.product.id).filter(id => id > 0);
  const { data: recommendationsData, isLoading: isRecommendationsLoading } = useGetRecommendationsQuery(
    { productIds: cartProductIds, limit: 5 },
    { skip: cartProductIds.length === 0 }
  );
  const recommendations = cartProductIds.length > 0 ? (recommendationsData?.data || []) : [];

  // Reset discounts and checkout when customer changes
  useEffect(() => {
    discounts.clearDiscountsState();
    checkout.setIsPaidModified(false);
  }, [customer.selectedCustomer, customer.customerType]);

  // Computed Products
  const products = productData?.data?.content || [];
  const categories = ['Tất cả', ...new Set(products.map(p => p.category?.name).filter(Boolean) as string[])];

  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === 'Tất cả' || p.category?.name === activeCategory;

    if (!searchProductQuery.trim()) {
      return matchesCategory;
    }

    const query = searchProductQuery.toLowerCase().trim();
    const matchesName = p.name.toLowerCase().includes(query);
    const matchesSku = p.variants?.some(v => v.sku?.toLowerCase().includes(query));

    return matchesName || matchesSku;
  });

  const handleBarcodeScan = (barcode: string): boolean => {
    const query = barcode.trim().toLowerCase();
    if (!query) return false;

    // Search in the ENTIRE product list (not just filtered category)
    for (const p of products) {
      const matchingVariant = p.variants?.find(v => v.sku?.toLowerCase() === query);
      if (matchingVariant) {
        if (matchingVariant.quantity > 0) {
          cart.handleAddToCart(p, matchingVariant);
          setSearchProductQuery('');
        } else {
          toast.error(`Sản phẩm ${p.name} - SKU: ${matchingVariant.sku} đã hết hàng!`);
          return true;
        }
      }
    }
    return false;
  };

  const handleAddRecommendedToCart = async (productId: number) => {
    let fullProduct = products.find(p => p.id === productId);

    if (!fullProduct) {
      try {
        const res = await getProductById(productId).unwrap();
        if (res?.data) {
          fullProduct = res.data;
        }
      } catch (error) {
        console.error("Lỗi khi tải chi tiết sản phẩm gợi ý:", error);
      }
    }

    if (fullProduct) {
      cart.handleProductClick(fullProduct);
    } else {
      toast.error('Không tìm thấy thông tin sản phẩm.');
    }
  };

  // Cross-Cutting Orchestration Actions
  const clearPOSState = () => {
    cart.clearCart();
    customer.clearCustomerState();
    discounts.clearDiscountsState();
    checkout.clearCheckoutState();
    pendingOrders.clearPendingState();
    setSearchProductQuery('');
  };

  const handleSaveTemporary = async () => {
    if (cart.cart.length === 0) {
      toast.error('Vui lòng thêm sản phẩm vào giỏ hàng trước khi lưu tạm.');
      return;
    }
    if (discounts.voucherError) {
      toast.error(discounts.voucherError);
      return;
    }
    try {
      const orderPayload: OrderRequest = {
        customerId: customer.customerType === 'GUEST' ? 1 : (customer.selectedCustomer?.id || 1),
        paidAmount: 0,
        note: checkout.note || undefined,
        status: 'PENDING' as any,
        pointsToUse: customer.customerType === 'MEMBER' ? discounts.pointsToUse : 0,
        voucherCode: (customer.customerType === 'MEMBER' && discounts.isVoucherValid && discounts.voucherCode)
          ? discounts.voucherCode.trim()
          : undefined,
        items: cart.cart.map(item => ({
          variantId: item.variant.id as number,
          quantity: item.quantity,
        })),
      };

      const response = pendingOrders.pendingOrderId
        ? await updateOrder({ id: pendingOrders.pendingOrderId, data: orderPayload }).unwrap()
        : await createOrder(orderPayload).unwrap();

      if (pendingOrders.pendingOrderId) {
        toast.success(`Cập nhật đơn hàng chờ thành công! Mã hóa đơn: ${response.data.orderNumber}`);
      } else {
        toast.success(`Lưu tạm đơn hàng thành công! Mã hóa đơn: ${response.data.orderNumber}`);
      }
      clearPOSState();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Có lỗi xảy ra khi lưu tạm đơn hàng. Vui lòng thử lại.');
    }
  };

  const handleResumePendingOrder = (pendingOrder: any) => {
    pendingOrders.setPendingOrderId(pendingOrder.id);
    pendingOrders.setPendingOrderNumber(pendingOrder.orderNumber);

    if (pendingOrder.customerId === 1) {
      customer.setCustomerType('GUEST');
      customer.setSelectedCustomer(customer.defaultCustomer);
    } else {
      customer.setCustomerType('MEMBER');
      customer.setSelectedCustomer({
        id: pendingOrder.customerId,
        fullName: pendingOrder.customerName,
      } as any);
    }

    checkout.setNote(pendingOrder.note || '');
    discounts.setPointsToUse(pendingOrder.pointsUsed || 0);
    discounts.setVoucherCode(pendingOrder.voucherCode || '');

    const newCart: CartItem[] = [];
    for (const item of pendingOrder.items) {
      const variantId = item.variantId;
      let found = false;
      for (const p of products) {
        const v = p.variants?.find(variant => variant.id === variantId);
        if (v) {
          const adjustedVariant = {
            ...v,
            quantity: v.quantity + item.quantity,
          };
          newCart.push({
            product: p,
            variant: adjustedVariant,
            quantity: item.quantity,
          });
          found = true;
          break;
        }
      }
      if (!found) {
        newCart.push({
          product: { name: item.productName || 'Sản phẩm' } as any,
          variant: { id: variantId, sku: item.productSku || '', salePrice: item.unitPrice, quantity: item.quantity } as any,
          quantity: item.quantity,
        });
      }
    }
    cart.setCart(newCart);
    pendingOrders.setIsPendingOrdersModalOpen(false);
  };

  const confirmCheckout = async () => {
    if (discounts.voucherError) {
      toast.error(discounts.voucherError);
      return;
    }

    // Nếu đang thanh toán QR và có đơn hàng chờ QR, sử dụng API hoàn thành thanh toán tối giản
    if (checkout.paymentMethod === 'QR_SEPAY' && pendingOrderForQR) {
      try {
        const response = await completeOrderPayment({
          id: pendingOrderForQR.id,
          paymentMethod: 'QR_SEPAY',
          paidAmount: discounts.total
        }).unwrap();

        toast.success(`Thanh toán thành công! Mã hóa đơn: ${response.data.orderNumber}`);
        checkout.setIsQRModalOpen(false);
        setPendingOrderForQR(null);
        clearPOSState();

        if (checkout.autoPrint) {
          setLastCreatedOrder(response.data);
        } else {
          navigate('/orders');
        }
      } catch (error: any) {
        toast.error(error?.data?.message || 'Có lỗi xảy ra khi hoàn thành thanh toán. Vui lòng thử lại.');
      }
      return;
    }

    try {
      const orderPayload: OrderRequest = {
        customerId: customer.customerType === 'GUEST' ? 1 : (customer.selectedCustomer?.id || 1),
        paidAmount: checkout.paymentMethod === 'QR_SEPAY' ? discounts.total : Number(checkout.customerPaid),
        note: checkout.note || undefined,
        status: 'COMPLETED' as any,
        pointsToUse: customer.customerType === 'MEMBER' ? discounts.pointsToUse : 0,
        voucherCode: (customer.customerType === 'MEMBER' && discounts.isVoucherValid && discounts.voucherCode)
          ? discounts.voucherCode.trim()
          : undefined,
        items: cart.cart.map(item => ({
          variantId: item.variant.id as number,
          quantity: item.quantity,
        })),
      };

      const response = pendingOrders.pendingOrderId
        ? await updateOrder({ id: pendingOrders.pendingOrderId, data: orderPayload }).unwrap()
        : await createOrder(orderPayload).unwrap();

      if (pendingOrders.pendingOrderId) {
        toast.success(`Thanh toán thành công đơn hàng chờ! Mã hóa đơn: ${response.data.orderNumber}`);
      } else {
        toast.success(`Thanh toán thành công! Mã hóa đơn: ${response.data.orderNumber}`);
      }
      checkout.setIsQRModalOpen(false);
      clearPOSState();

      if (checkout.autoPrint) {
        // Lưu đơn hàng lại để in trực tiếp trên trang POS, không chuyển trang
        setLastCreatedOrder(response.data);
        clearPOSState();
      } else {
        clearPOSState();
        navigate('/orders');
      }
    } catch (error: any) {
      toast.error(error?.data?.message || 'Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.');
    }
  };

  const handleCheckout = async () => {
    if (cart.cart.length === 0) {
      toast.error('Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán.');
      return;
    }
    if (customer.customerType === 'MEMBER' && !customer.selectedCustomer) {
      toast.error('Vui lòng chọn khách hàng thành viên để thanh toán.');
      return;
    }
    if (discounts.voucherError) {
      toast.error(discounts.voucherError);
      return;
    }

    if (checkout.paymentMethod === 'CASH') {
      if (checkout.customerPaid === '' || checkout.customerPaid < discounts.total) {
        toast.error('Số tiền khách thanh toán không hợp lệ hoặc thiếu.');
        return;
      }
      await confirmCheckout();
    } else {
      try {
        const orderPayload: OrderRequest = {
          customerId: customer.customerType === 'GUEST' ? 1 : (customer.selectedCustomer?.id || 1),
          paidAmount: 0,
          note: checkout.note || undefined,
          status: 'PENDING' as any,
          paymentMethod: 'QR_SEPAY',
          pointsToUse: customer.customerType === 'MEMBER' ? discounts.pointsToUse : 0,
          voucherCode: (customer.customerType === 'MEMBER' && discounts.isVoucherValid && discounts.voucherCode)
            ? discounts.voucherCode.trim()
            : undefined,
          items: cart.cart.map(item => ({
            variantId: item.variant.id as number,
            quantity: item.quantity,
          })),
        };

        const response = pendingOrders.pendingOrderId
          ? await updateOrder({ id: pendingOrders.pendingOrderId, data: orderPayload }).unwrap()
          : await createOrder(orderPayload).unwrap();

        setPendingOrderForQR(response.data);
        checkout.setIsQRModalOpen(true);
      } catch (error: any) {
        toast.error(error?.data?.message || 'Có lỗi xảy ra khi tạo mã thanh toán.');
      }
    }
  };

  const handlePaymentSuccess = (orderData: any) => {
    toast.success(`Khách đã thanh toán thành công! Mã đơn: ${orderData.orderNumber || ''}`);
    checkout.setIsQRModalOpen(false);

    if (checkout.autoPrint) {
      setLastCreatedOrder(orderData);
    } else {
      navigate('/orders');
    }
    clearPOSState();
    setPendingOrderForQR(null);
  };

  return {
    state: {
      isProductsLoading,
      categories,
      activeCategory,
      filteredProducts,
      searchProductQuery,
      cart: cart.cart,
      variantSelectorProduct: cart.variantSelectorProduct,
      isCustomerModalOpen: customer.isCustomerModalOpen,
      newCustomerForm: customer.newCustomerForm,
      customerType: customer.customerType,
      selectedCustomer: customer.selectedCustomer,
      defaultCustomer: customer.defaultCustomer,
      searchCustomerQuery: customer.searchCustomerQuery,
      isSearchFocused: customer.isSearchFocused,
      debouncedSearch: customer.debouncedSearch,
      customerSearchData: customer.customerSearchData,
      vouchersList: discounts.vouchersList,
      eligiblePrivateVouchers: discounts.eligiblePrivateVouchers,
      voucherCode: discounts.voucherCode,
      voucherError: discounts.voucherError,
      isVoucherValid: discounts.isVoucherValid,
      activeVoucher: discounts.activeVoucher,
      voucherDiscount: discounts.voucherDiscount,
      availablePoints: discounts.availablePoints,
      pointsToUse: discounts.pointsToUse,
      maxPointsAbleToUse: discounts.maxPointsAbleToUse,
      pointsDiscount: discounts.pointsDiscount,
      customerPaid: checkout.customerPaid,
      total: discounts.total,
      changeAmount: checkout.changeAmount,
      subtotal: cart.subtotal,
      tax: cart.tax,
      note: checkout.note,
      isCreatingOrder: isCreatingOrder || isUpdatingOrder || isCompletingPayment,
      paymentMethod: checkout.paymentMethod,
      isQRModalOpen: checkout.isQRModalOpen,
      pendingOrderId: pendingOrders.pendingOrderId,
      pendingOrderNumber: pendingOrders.pendingOrderNumber,
      isPendingOrdersModalOpen: pendingOrders.isPendingOrdersModalOpen,
      pendingOrders: pendingOrders.pendingOrders,
      pendingOrdersCount: pendingOrders.pendingOrdersCount,
      isSavingTemporary: isCreatingOrder || isUpdatingOrder,
      isCancellingOrder: pendingOrders.isCancellingOrder,
      orderIdToCancel: pendingOrders.orderIdToCancel,
      autoPrint: checkout.autoPrint,
      lastCreatedOrder,
      pendingOrderForQR,
      recommendations,
      isRecommendationsLoading
    },
    actions: {
      setActiveCategory,
      setSearchProductQuery,
      handleBarcodeScan,
      handleProductClick: cart.handleProductClick,
      handleAddToCart: cart.handleAddToCart,
      setVariantSelectorProduct: cart.setVariantSelectorProduct,
      handleUpdateQuantity: cart.handleUpdateQuantity,
      handleRemoveFromCart: cart.handleRemoveFromCart,
      setCustomerType: customer.setCustomerType,
      setSelectedCustomer: customer.setSelectedCustomer,
      setSearchCustomerQuery: customer.setSearchCustomerQuery,
      setIsSearchFocused: customer.setIsSearchFocused,
      handleSelectCustomer: customer.handleSelectCustomer,
      setIsCustomerModalOpen: customer.setIsCustomerModalOpen,
      setNewCustomerForm: customer.setNewCustomerForm,
      handleCreateCustomerSubmit: customer.handleCreateCustomerSubmit,
      setVoucherCode: discounts.setVoucherCode,
      setPointsToUse: discounts.setPointsToUse,
      setCustomerPaid: checkout.setCustomerPaid,
      setIsPaidModified: checkout.setIsPaidModified,
      setNote: checkout.setNote,
      handleCheckout,
      setPaymentMethod: checkout.setPaymentMethod,
      setIsQRModalOpen: checkout.setIsQRModalOpen,
      setAutoPrint: checkout.setAutoPrint,
      confirmCheckout,
      setIsPendingOrdersModalOpen: pendingOrders.setIsPendingOrdersModalOpen,
      handleSaveTemporary,
      handleResumePendingOrder,
      handleCancelPendingOrder: pendingOrders.handleCancelPendingOrder,
      setOrderIdToCancel: pendingOrders.setOrderIdToCancel,
      clearPOSState,
      handleAddRecommendedToCart,
      setLastCreatedOrder,
      setPendingOrderForQR,
      handlePaymentSuccess
    }
  };
}
