import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useOrderCreate } from './useOrderCreate';
import { CheckoutPanel } from './components/CheckoutPanel';
import { CustomerSelection } from './components/CustomerSelection';
import { VariantSelectorModal } from './components/VariantSelectorModal';
import { CreateCustomerModal } from './components/CreateCustomerModal';
import { ProductSearchAutocomplete } from './components/ProductSearchAutocomplete';
import { QRTransferModal } from './components/QRTransferModal';
import { PendingOrdersModal } from './components/PendingOrdersModal';
import { CartItemsList } from './components/CartItemsList';
import { CustomProductModal } from './components/CustomProductModal';
import { AIRecommendations } from './components/AIRecommendations';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAppSelector } from '@/redux/hooks';
import { printReceipt } from '@/utils/printReceipt';

export default function OrderCreatePage() {
  const { state, actions } = useOrderCreate();
  const user = useAppSelector((state) => state.auth.user);

  // Custom product adding modal state
  const [isCustomProductOpen, setIsCustomProductOpen] = useState(false);

  // Global F2 keyboard shortcut for custom product adding
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        setIsCustomProductOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Khi có đơn hàng vừa tạo (autoPrint=true), in qua popup window riêng biệt
  useEffect(() => {
    if (!state.lastCreatedOrder) return;
    const allProducts = state.filteredProducts.length > 0 ? state.filteredProducts : [];
    printReceipt(state.lastCreatedOrder, allProducts);
    actions.setLastCreatedOrder(null);
  }, [state.lastCreatedOrder]);

  const handleAddCustomProduct = useCallback((name: string, price: number, qty: number) => {
    const fakeProduct = {
      id: 0,
      name: name,
      imageUrls: [],
      category: { id: 0, name: 'Tùy chỉnh' }
    } as any;

    const fakeVariant = {
      id: Date.now(), // Generate unique temp id
      sku: 'SPTC-' + Date.now().toString().slice(-4),
      salePrice: price,
      quantity: 999,
      lowStockThreshold: 0
    } as any;

    // Add multiple quantities by loop or single add
    for (let i = 0; i < qty; i++) {
      actions.handleAddToCart(fakeProduct, fakeVariant);
    }
  }, [actions]);

  return (
    <div className="h-screen flex flex-col bg-[#f0f2f5] overflow-hidden font-sans antialiased text-gray-800">

      {/* WHITE POS HEADER */}
      <header className="h-[56px] bg-white border-b border-gray-200 flex items-center justify-between px-2 sm:px-4 flex-shrink-0 z-30 gap-2">
        <div className="flex-1 min-w-0 flex items-center">
          {/* Autocomplete Product Search */}
          <ProductSearchAutocomplete
            products={state.filteredProducts}
            searchQuery={state.searchProductQuery}
            setSearchQuery={actions.setSearchProductQuery}
            handleAddToCart={actions.handleAddToCart}
            handleProductClick={actions.handleProductClick}
            handleBarcodeScan={actions.handleBarcodeScan}
          />
        </div>


        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          {/* Pending Orders Button */}
          <button
            onClick={() => actions.setIsPendingOrdersModalOpen(true)}
            className="h-9 px-3 bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all text-gray-700 rounded-lg text-xs font-bold flex items-center gap-1.5 relative border border-gray-200"
          >
            <span className="material-symbols-outlined text-[18px]">receipt_long</span>
            <span className="hidden sm:inline">Đơn chờ</span>
            {state.pendingOrdersCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                {state.pendingOrdersCount}
              </span>
            )}
          </button>

          {/* Resumed Pending Order Indicator */}
          {state.pendingOrderId && (
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-amber-100 border border-amber-200 rounded-full text-amber-700 text-[10px] font-bold uppercase tracking-wider select-none">
              <span className="material-symbols-outlined text-[12px]">edit</span>
              Đơn chờ: {state.pendingOrderNumber}
              <button
                onClick={actions.clearPOSState}
                className="text-amber-500 hover:text-amber-800 ml-1 font-black transition-colors"
                title="Hủy sửa"
              >
                ×
              </button>
            </div>
          )}

          {/* User profile */}
          <div className="flex items-center gap-2 pl-2 sm:pl-4 border-l border-gray-200 select-none">
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-xs text-primary uppercase flex-shrink-0">
              {user?.fullName?.substring(0, 2) || 'NV'}
            </div>
            <div className="hidden xl:block text-left">
              <p className="text-gray-800 text-xs font-bold leading-tight">{user?.fullName || 'Nhân viên'}</p>
              <p className="text-gray-500 text-[10px] leading-none mt-0.5">Bán hàng</p>
            </div>
          </div>
        </div>
      </header>

      {/* POS WORKSPACE BODY */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">

        {/* LEFT WORKSPACE (Cart items list and bottom control bar) */}
        <main className="flex-1 flex flex-col p-4 gap-3 lg:overflow-hidden h-auto min-h-[500px] lg:min-h-0 lg:h-full">

          {/* Grid column header row */}
          <div className="hidden md:flex bg-white rounded-xl border border-gray-200/80 p-3.5 justify-between items-center text-xs text-gray-400 font-bold flex-shrink-0 shadow-sm">
            <div className="flex-1 min-w-0 flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">shopping_cart</span>
              Sản phẩm ({state.cart.reduce((sum, item) => sum + item.quantity, 0)})
            </div>
            <div className="w-28 text-right">Đơn giá</div>
            <div className="w-32 text-center">Số lượng</div>
            <div className="w-28 text-right">Thành tiền</div>
            <div className="w-12 text-center"></div>
          </div>

          {/* Cart Scrolling Container */}
          <div className="bg-white rounded-xl border border-gray-200/80 overflow-y-auto flex-1 shadow-sm flex flex-col relative min-h-[250px]">
            <CartItemsList
              cart={state.cart}
              handleUpdateQuantity={actions.handleUpdateQuantity}
              handleRemoveFromCart={actions.handleRemoveFromCart}
            />
          </div>

          {/* AI RECOMMENDATIONS SECTION */}
          <AIRecommendations
            recommendations={state.recommendations}
            onAddRecommended={actions.handleAddRecommendedToCart}
          />

          {/* BOTTOM CONTROLS BAR */}
          <div className="bg-white p-3 rounded-xl border border-gray-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between text-xs flex-shrink-0 shadow-sm gap-3">
            <div className="flex gap-2">
              <Button
                onClick={() => setIsCustomProductOpen(true)}
                variant="outline"
                className="!bg-blue-50 !text-blue-600 !border-blue-200 hover:!bg-blue-100 text-xs px-3 font-semibold rounded-lg h-[30px] flex items-center justify-center gap-1 w-full sm:w-auto"
              >
                <span className="material-symbols-outlined text-[16px]">add_box</span>
                Sản phẩm tùy chỉnh [F2]
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex flex-1 sm:flex-none items-center justify-center gap-1.5 bg-gray-50 px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 font-bold select-none cursor-default truncate">
                <span className="material-symbols-outlined text-[16px] text-gray-400">badge</span>
                <span className="truncate">Nhân viên: {user?.fullName || 'Nhân viên'}</span>
              </div>
            </div>
          </div>
        </main>

        {/* RIGHT SIDEBAR (Checkout Panel) */}
        <CheckoutPanel
          cart={state.cart}
          handleUpdateQuantity={actions.handleUpdateQuantity}
          handleRemoveFromCart={actions.handleRemoveFromCart}
          customerPaid={state.customerPaid}
          setIsPaidModified={actions.setIsPaidModified}
          setCustomerPaid={actions.setCustomerPaid}
          total={state.total}
          changeAmount={state.changeAmount}
          note={state.note}
          setNote={actions.setNote}
          subtotal={state.subtotal}
          tax={state.tax}
          customerType={state.customerType}
          pointsDiscount={state.pointsDiscount}
          pointsToUse={state.pointsToUse}
          voucherDiscount={state.voucherDiscount}
          voucherCode={state.voucherCode}
          handleCheckout={actions.handleCheckout}
          isCreatingOrder={state.isCreatingOrder}
          paymentMethod={state.paymentMethod}
          setPaymentMethod={actions.setPaymentMethod}
          handleSaveTemporary={actions.handleSaveTemporary}
          isSavingTemporary={state.isSavingTemporary}
          pendingOrderId={state.pendingOrderId}
          autoPrint={state.autoPrint}
          setAutoPrint={actions.setAutoPrint}
          customerSelectionNode={
            <CustomerSelection
              customerType={state.customerType}
              setCustomerType={actions.setCustomerType}
              selectedCustomer={state.selectedCustomer}
              setSelectedCustomer={actions.setSelectedCustomer}
              defaultCustomer={state.defaultCustomer}
              searchCustomerQuery={state.searchCustomerQuery}
              setSearchCustomerQuery={actions.setSearchCustomerQuery}
              isSearchFocused={state.isSearchFocused}
              setIsSearchFocused={actions.setIsSearchFocused}
              debouncedSearch={state.debouncedSearch}
              customerSearchData={state.customerSearchData}
              handleSelectCustomer={actions.handleSelectCustomer}
              setIsCustomerModalOpen={actions.setIsCustomerModalOpen}
              vouchersList={state.vouchersList}
              voucherCode={state.voucherCode}
              setVoucherCode={actions.setVoucherCode}
              voucherError={state.voucherError}
              isVoucherValid={state.isVoucherValid}
              activeVoucher={state.activeVoucher}
              voucherDiscount={state.voucherDiscount}
              availablePoints={state.availablePoints}
              pointsToUse={state.pointsToUse}
              setPointsToUse={actions.setPointsToUse}
              maxPointsAbleToUse={state.maxPointsAbleToUse}
            />
          }
        />
      </div>

      {/* LIGHT-THEMED QR MODAL */}
      <QRTransferModal
        isOpen={state.isQRModalOpen}
        onClose={() => {
          actions.setIsQRModalOpen(false);
          actions.setPendingOrderForQR(null);
        }}
        total={state.total}
        isCreatingOrder={state.isCreatingOrder}
        confirmCheckout={actions.confirmCheckout}
        pendingOrder={state.pendingOrderForQR}
        onPaymentSuccess={actions.handlePaymentSuccess}
      />

      {/* MOCK CUSTOM PRODUCT DIALOG (F2) */}
      <CustomProductModal
        isOpen={isCustomProductOpen}
        onClose={() => setIsCustomProductOpen(false)}
        onAddCustomProduct={handleAddCustomProduct}
      />

      {/* MODAL 1: SELECT VARIANT */}
      <VariantSelectorModal
        product={state.variantSelectorProduct}
        onClose={() => actions.setVariantSelectorProduct(null)}
        onAddToCart={actions.handleAddToCart}
      />

      {/* MODAL 2: QUICK REGISTER CUSTOMER */}
      <CreateCustomerModal
        isOpen={state.isCustomerModalOpen}
        onClose={() => actions.setIsCustomerModalOpen(false)}
        onSubmit={actions.handleCreateCustomerSubmit}
        newCustomerForm={state.newCustomerForm}
        setNewCustomerForm={actions.setNewCustomerForm}
      />

      {/* MODAL 3 & 4: PENDING ORDERS LIST & CANCEL CONFIRMATION */}
      <PendingOrdersModal
        isOpen={state.isPendingOrdersModalOpen}
        onClose={() => actions.setIsPendingOrdersModalOpen(false)}
        pendingOrders={state.pendingOrders}
        isCancellingOrder={state.isCancellingOrder}
        orderIdToCancel={state.orderIdToCancel}
        setOrderIdToCancel={actions.setOrderIdToCancel}
        handleResumePendingOrder={actions.handleResumePendingOrder}
        handleCancelPendingOrder={actions.handleCancelPendingOrder}
      />
    </div>
  );
}
