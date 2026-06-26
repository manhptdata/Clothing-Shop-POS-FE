import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetProductsQuery } from '@/redux/api/productApi';
import { useCreateOrderMutation, useUpdateOrderMutation } from '@/redux/api/orderApi';
import type { CartItem } from './hooks/useCart';

import { useCart } from './hooks/useCart';
import { useCustomerSelection } from './hooks/useCustomerSelection';
import { useDiscounts } from './hooks/useDiscounts';
import { useCheckout } from './hooks/useCheckout';
import { usePendingOrders } from './hooks/usePendingOrders';

export { type CartItem };

export function useOrderCreate() {
  const navigate = useNavigate();

  const { data: productData, isLoading: isProductsLoading } = useGetProductsQuery();
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();
  const [updateOrder, { isLoading: isUpdatingOrder }] = useUpdateOrderMutation();

  const [activeCategory, setActiveCategory] = useState('Tất cả');

  // --- Initialize Hooks ---
  const cart = useCart();
  const customer = useCustomerSelection();
  const discounts = useDiscounts(customer.selectedCustomer, customer.customerType, cart.rawTotal);
  const checkout = useCheckout(discounts.total);
  const pendingOrders = usePendingOrders();

  // --- Reset discounts and checkout when customer changes ---
  useEffect(() => {
    discounts.clearDiscountsState();
    checkout.setIsPaidModified(false);
  }, [customer.selectedCustomer, customer.customerType]);

  // --- Computed Products ---
  const products = productData?.data?.content || [];
  const categories = ['Tất cả', ...new Set(products.map(p => p.category?.name).filter(Boolean) as string[])];
  const filteredProducts = activeCategory === 'Tất cả'
    ? products
    : products.filter(p => p.category?.name === activeCategory);

  // --- Cross-Cutting Orchestration Actions ---
  const clearPOSState = () => {
    cart.clearCart();
    customer.clearCustomerState();
    discounts.clearDiscountsState();
    checkout.clearCheckoutState();
    pendingOrders.clearPendingState();
  };

  const handleSaveTemporary = async () => {
    if (cart.cart.length === 0) {
      alert('Vui lòng thêm sản phẩm vào giỏ hàng trước khi lưu tạm.');
      return;
    }

    try {
      const orderPayload = {
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

      let response;
      if (pendingOrders.pendingOrderId) {
        response = await updateOrder({ id: pendingOrders.pendingOrderId, data: orderPayload }).unwrap();
        alert(`Cập nhật đơn hàng chờ thành công! Mã hóa đơn: ${response.data.orderNumber}`);
      } else {
        response = await createOrder(orderPayload).unwrap();
        alert(`Lưu tạm đơn hàng thành công! Mã hóa đơn: ${response.data.orderNumber}`);
      }
      clearPOSState();
    } catch (error: any) {
      alert(error?.data?.message || 'Có lỗi xảy ra khi lưu tạm đơn hàng. Vui lòng thử lại.');
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
    try {
      const orderPayload = {
        customerId: customer.customerType === 'GUEST' ? 1 : (customer.selectedCustomer?.id || 1),
        paidAmount: checkout.paymentMethod === 'QR_PAYOS' ? discounts.total : Number(checkout.customerPaid),
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

      let response;
      if (pendingOrders.pendingOrderId) {
        response = await updateOrder({ id: pendingOrders.pendingOrderId, data: orderPayload }).unwrap();
        alert(`Thanh toán thành công đơn hàng chờ! Mã hóa đơn: ${response.data.orderNumber}`);
      } else {
        response = await createOrder(orderPayload).unwrap();
        alert(`Thanh toán thành công! Mã hóa đơn: ${response.data.orderNumber}`);
      }
      checkout.setIsQRModalOpen(false);
      clearPOSState();
      navigate('/orders');
    } catch (error: any) {
      alert(error?.data?.message || 'Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.');
    }
  };

  const handleCheckout = async () => {
    if (cart.cart.length === 0) {
      alert('Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán.');
      return;
    }
    if (customer.customerType === 'MEMBER' && !customer.selectedCustomer) {
      alert('Vui lòng chọn khách hàng thành viên để thanh toán.');
      return;
    }

    if (checkout.paymentMethod === 'CASH') {
      if (checkout.customerPaid === '' || checkout.customerPaid < discounts.total) {
        alert('Số tiền khách thanh toán không hợp lệ hoặc thiếu.');
        return;
      }
      await confirmCheckout();
    } else {
      checkout.setIsQRModalOpen(true);
    }
  };

  return {
    state: {
      isProductsLoading,
      categories,
      activeCategory,
      filteredProducts,
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
      groups: customer.groups,
      vouchersList: discounts.vouchersList,
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
      isCreatingOrder: isCreatingOrder || isUpdatingOrder,
      paymentMethod: checkout.paymentMethod,
      isQRModalOpen: checkout.isQRModalOpen,
      pendingOrderId: pendingOrders.pendingOrderId,
      pendingOrderNumber: pendingOrders.pendingOrderNumber,
      isPendingOrdersModalOpen: pendingOrders.isPendingOrdersModalOpen,
      pendingOrders: pendingOrders.pendingOrders,
      pendingOrdersCount: pendingOrders.pendingOrdersCount,
      isSavingTemporary: isCreatingOrder || isUpdatingOrder,
      isCancellingOrder: pendingOrders.isCancellingOrder,
      orderIdToCancel: pendingOrders.orderIdToCancel
    },
    actions: {
      setActiveCategory,
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
      confirmCheckout,
      setIsPendingOrdersModalOpen: pendingOrders.setIsPendingOrdersModalOpen,
      handleSaveTemporary,
      handleResumePendingOrder,
      handleCancelPendingOrder: pendingOrders.handleCancelPendingOrder,
      setOrderIdToCancel: pendingOrders.setOrderIdToCancel,
      clearPOSState
    }
  };
}
