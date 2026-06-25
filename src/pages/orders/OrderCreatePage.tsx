import React from 'react';
import { useOrderCreate } from './useOrderCreate';
import { ProductCatalog } from './components/ProductCatalog';
import { CheckoutPanel } from './components/CheckoutPanel';
import { CustomerSelection } from './components/CustomerSelection';
import { VariantSelectorModal } from './components/VariantSelectorModal';
import { CreateCustomerModal } from './components/CreateCustomerModal';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

export default function OrderCreatePage() {
  const { state, actions } = useOrderCreate();

  return (
    <div className="max-w-[1440px] mx-auto w-full">
      {/* POS Split Layout */}
      <div className="flex flex-col lg:flex-row gap-gutter h-[calc(100vh-8.5rem)]">
        
        {/* Left: Catalog (65%) */}
        <ProductCatalog
          isProductsLoading={state.isProductsLoading}
          categories={state.categories}
          activeCategory={state.activeCategory}
          setActiveCategory={actions.setActiveCategory}
          filteredProducts={state.filteredProducts}
          cart={state.cart}
          handleProductClick={actions.handleProductClick}
        />

        {/* Right: Cart & Checkout (35%) */}
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

      {/* MODAL: QR PAYMENT */}
      {state.isQRModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => actions.setIsQRModalOpen(false)}
          />
          <div className="relative w-full max-w-[360px] bg-[#1a1d21] rounded-3xl shadow-2xl border border-white/8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <div>
                <h2 className="text-white text-base font-semibold">Chuyển khoản QR</h2>
                <p className="text-slate-500 text-xs mt-0.5">Quét bằng App ngân hàng bất kỳ</p>
              </div>
              <button
                onClick={() => actions.setIsQRModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/15 transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            {/* Divider */}
            <div className="mx-6 h-px bg-white/6" />

            {/* QR Code */}
            <div className="flex justify-center py-6">
              <div className="bg-white rounded-2xl p-2 shadow-lg">
                <img
                  src={`https://img.vietqr.io/image/MB-0987654321-compact2.png?amount=${state.total}&addInfo=Thanh toan don POS&accountName=SHOP QUAN AO`}
                  alt="Mã QR"
                  className="w-[200px] h-[220px] object-contain rounded-lg"
                />
              </div>
            </div>

            {/* Bank + Amount */}
            <div className="mx-6 mb-5 bg-[#14171a] rounded-2xl px-4 py-3 border border-white/6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-slate-500 mb-0.5">Đến tài khoản</p>
                  <p className="text-slate-200 text-xs font-medium">MB Bank · 0987654321</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">SHOP QUAN AO</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-slate-500 mb-0.5">Số tiền</p>
                  <p className="text-[#2ecc71] font-bold text-sm">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(state.total)}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 px-6 pb-6">
              <button
                onClick={() => actions.setIsQRModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/8 transition-all"
              >
                Hủy
              </button>
              <button
                onClick={actions.confirmCheckout}
                disabled={state.isCreatingOrder}
                className="flex-1 flex items-center justify-center gap-2 bg-[#2ecc71] hover:bg-[#27ae60] disabled:opacity-60 text-white text-sm font-semibold rounded-xl py-2.5 transition-all shadow-sm"
              >
                {state.isCreatingOrder
                  ? <><span className="material-symbols-outlined animate-spin text-[15px]">sync</span> Đang xử lý...</>
                  : <><span className="material-symbols-outlined text-[15px]">check_circle</span> Xác nhận đã nhận tiền</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

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
        groups={state.groups}
      />
    </div>
  );
}
