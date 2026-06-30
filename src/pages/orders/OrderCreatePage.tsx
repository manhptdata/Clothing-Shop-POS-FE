import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useOrderCreate } from './useOrderCreate';
import { CheckoutPanel } from './components/CheckoutPanel';
import { CustomerSelection } from './components/CustomerSelection';
import { VariantSelectorModal } from './components/VariantSelectorModal';
import { CreateCustomerModal } from './components/CreateCustomerModal';
import { ProductSearchAutocomplete } from './components/ProductSearchAutocomplete';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAppSelector } from '@/redux/hooks';

export default function OrderCreatePage() {
  const { state, actions } = useOrderCreate();
  const user = useAppSelector((state) => state.auth.user);

  // Custom product adding modal state
  const [isCustomProductOpen, setIsCustomProductOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customPrice, setCustomPrice] = useState<number | ''>('');
  const [customQty, setCustomQty] = useState<number>(1);

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

  const handleAddCustomProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || customPrice === '') {
      toast.error('Vui lòng điền đầy đủ tên và giá sản phẩm.');
      return;
    }

    const fakeProduct = {
      id: 0,
      name: customName.trim(),
      imageUrls: [],
      category: { id: 0, name: 'Tùy chỉnh' }
    } as any;

    const fakeVariant = {
      id: Date.now(), // Generate unique temp id
      sku: 'SPTC-' + Date.now().toString().slice(-4),
      salePrice: Number(customPrice),
      quantity: 999,
      lowStockThreshold: 0
    } as any;

    // Add multiple quantities by loop or single add
    for (let i = 0; i < customQty; i++) {
      actions.handleAddToCart(fakeProduct, fakeVariant);
    }

    // Reset state
    setCustomName('');
    setCustomPrice('');
    setCustomQty(1);
    setIsCustomProductOpen(false);
  };

  return (
    <div className="h-screen flex flex-col bg-[#f0f2f5] overflow-hidden font-sans antialiased text-gray-800">
      
      {/* WHITE POS HEADER */}
      <header className="h-[56px] bg-white border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0 z-30">
        <div className="flex items-center gap-4">
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


        <div className="flex items-center gap-4">
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
          <div className="flex items-center gap-2 pl-4 border-l border-gray-200 select-none">
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-xs text-primary uppercase">
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
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT WORKSPACE (Cart items list and bottom control bar) */}
        <main className="flex-1 flex flex-col p-4 gap-3 overflow-hidden h-full">
          
          {/* Grid column header row */}
          <div className="bg-white rounded-xl border border-gray-200/80 p-3.5 flex justify-between items-center text-xs text-gray-400 font-bold flex-shrink-0 shadow-sm">
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
          <div className="bg-white rounded-xl border border-gray-200/80 overflow-y-auto flex-1 shadow-sm flex flex-col relative">
            {state.cart.length === 0 ? (
              // Sapo-like Empty State
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-300">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100 shadow-inner">
                  <span className="material-symbols-outlined text-4xl text-gray-300">inbox</span>
                </div>
                <h3 className="text-sm font-bold text-gray-700">Giỏ hàng của bạn đang trống</h3>
                <p className="text-xs text-gray-400 mt-1 max-w-[280px]">
                  Vui lòng quét mã barcode hoặc nhấn phím <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-[10px] text-gray-500 font-bold mx-0.5 shadow-sm">F3</kbd> để tìm và chọn sản phẩm đưa vào đơn.
                </p>
              </div>
            ) : (
              // Selected Products List Rows
              <div className="divide-y divide-gray-100 flex flex-col">
                {state.cart.map((item, index) => {
                  const itemTotal = item.variant.salePrice * item.quantity;
                  const priceFmt = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.variant.salePrice);
                  const totalFmt = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(itemTotal);

                  return (
                    <div
                      key={item.variant.id}
                      className="p-3.5 flex justify-between items-center transition-colors hover:bg-gray-50/50"
                    >
                      {/* Product details */}
                      <div className="flex-1 min-w-0 flex gap-3 items-center">
                        {/* Fallback image */}
                        <div className="w-10 h-12 bg-gray-50 border border-gray-100 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                          {item.product.imageUrls && item.product.imageUrls.length > 0 ? (
                            <img
                              src={item.product.imageUrls[0]}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="material-symbols-outlined text-gray-300 text-lg">checkroom</span>
                          )}
                        </div>

                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-gray-900 truncate" title={item.product.name}>
                            {item.product.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] font-mono text-gray-500 bg-gray-100 px-1 py-0.2 rounded font-semibold uppercase">
                              {item.variant.sku}
                            </span>
                            {item.variant.option1Value && (
                              <span className="text-[10px] text-gray-500 font-medium">
                                {item.variant.option1Value.value}
                              </span>
                            )}
                            {item.variant.option2Value && (
                              <span className="text-[10px] text-gray-500 font-medium">
                                - {item.variant.option2Value.value}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Unit Price */}
                      <div className="w-28 text-right text-xs font-bold text-gray-800">
                        {priceFmt}
                      </div>

                      {/* Quantity Selector */}
                      <div className="w-32 flex justify-center items-center gap-1 select-none">
                        <button
                          onClick={() => actions.handleUpdateQuantity(item.variant.id!, -1)}
                          className="w-7 h-7 bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-600 rounded-lg flex items-center justify-center font-bold text-sm transition-all"
                        >
                          -
                        </button>
                        <span className="w-10 text-center font-bold text-xs text-gray-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => actions.handleUpdateQuantity(item.variant.id!, 1)}
                          disabled={item.quantity >= (item.variant.quantity || 999)}
                          className="w-7 h-7 bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-600 rounded-lg flex items-center justify-center font-bold text-sm transition-all disabled:opacity-40 disabled:pointer-events-none"
                        >
                          +
                        </button>
                      </div>

                      {/* Total Line Price */}
                      <div className="w-28 text-right text-xs font-extrabold text-blue-600">
                        {totalFmt}
                      </div>

                      {/* Remove Button */}
                      <div className="w-12 text-center">
                        <button
                          onClick={() => actions.handleRemoveFromCart(item.variant.id!)}
                          className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-all"
                          title="Xóa dòng"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* BOTTOM CONTROLS BAR */}
          <div className="bg-white p-3 rounded-xl border border-gray-200/80 flex items-center justify-between text-xs flex-shrink-0 shadow-sm">
            <div className="flex gap-2">
              <Button
                onClick={() => setIsCustomProductOpen(true)}
                variant="outline"
                className="!bg-blue-50 !text-blue-600 !border-blue-200 hover:!bg-blue-100 text-xs px-3 font-semibold rounded-lg h-[30px] flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">add_box</span>
                Sản phẩm tùy chỉnh [F2]
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 font-bold select-none cursor-default">
                <span className="material-symbols-outlined text-[16px] text-gray-400">badge</span>
                <span>Nhân viên: {user?.fullName || 'Nhân viên'}</span>
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
      {state.isQRModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => actions.setIsQRModalOpen(false)}
          />
          <div className="relative w-full max-w-[360px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <div>
                <h2 className="text-gray-950 text-base font-bold">Chuyển khoản QR</h2>
                <p className="text-gray-500 text-xs mt-0.5">Quét bằng App ngân hàng bất kỳ</p>
              </div>
              <button
                onClick={() => actions.setIsQRModalOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-200 transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            {/* Divider */}
            <div className="mx-6 h-px bg-gray-100" />

            {/* QR Code */}
            <div className="flex justify-center py-6">
              <div className="bg-white rounded-2xl p-2 shadow border border-gray-100">
                <img
                  src={`https://img.vietqr.io/image/MB-0987654321-compact2.png?amount=${state.total}&addInfo=Thanh toan don POS&accountName=SHOP QUAN AO`}
                  alt="Mã QR"
                  className="w-[200px] h-[220px] object-contain rounded-lg"
                />
              </div>
            </div>

            {/* Bank + Amount */}
            <div className="mx-6 mb-5 bg-gray-50 rounded-2xl px-4 py-3 border border-gray-200/80">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">Đến tài khoản</p>
                  <p className="text-gray-800 text-xs font-bold">MB Bank · 0987654321</p>
                  <p className="text-gray-500 text-[10px] font-semibold mt-0.5">SHOP QUAN AO</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">Số tiền</p>
                  <p className="text-blue-600 font-extrabold text-base">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(state.total)}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 px-6 pb-6">
              <button
                onClick={() => actions.setIsQRModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-all border border-gray-200"
              >
                Hủy
              </button>
              <button
                onClick={actions.confirmCheckout}
                disabled={state.isCreatingOrder}
                className="flex-1 flex items-center justify-center gap-2 bg-[#2ecc71] hover:bg-[#27ae60] disabled:opacity-60 text-white text-xs font-bold rounded-xl py-2.5 transition-all shadow"
              >
                {state.isCreatingOrder ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[15px]">sync</span>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[15px]">check_circle</span>
                    Xác nhận đã nhận tiền
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MOCK CUSTOM PRODUCT DIALOG (F2) */}
      {isCustomProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsCustomProductOpen(false)}
          />
          <form
            onSubmit={handleAddCustomProductSubmit}
            className="relative w-full max-w-[400px] bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 animate-in fade-in zoom-in-95 duration-200 flex flex-col gap-4"
          >
            <div>
              <h2 className="text-gray-900 text-base font-bold">Thêm sản phẩm tùy chỉnh</h2>
              <p className="text-gray-500 text-xs mt-0.5">Thêm nhanh hàng hóa chưa được khai báo hệ thống</p>
            </div>

            <div className="h-px bg-gray-100" />

            <div className="flex flex-col gap-3">
              <Input
                label="Tên sản phẩm"
                labelClassName="text-[10px] font-bold text-gray-400 uppercase"
                type="text"
                placeholder="Ví dụ: Áo khoác đặc biệt"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                autoFocus
                className="bg-white border-gray-300 text-gray-900 text-xs"
              />
              
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Giá bán (VND)"
                  labelClassName="text-[10px] font-bold text-gray-400 uppercase"
                  type="number"
                  min={0}
                  placeholder="0"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  className="bg-white border-gray-300 text-gray-900 text-xs"
                />
                <Input
                  label="Số lượng"
                  labelClassName="text-[10px] font-bold text-gray-400 uppercase"
                  type="number"
                  min={1}
                  value={customQty}
                  onChange={(e) => setCustomQty(Number(e.target.value))}
                  className="bg-white border-gray-300 text-gray-900 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCustomProductOpen(false)}
                className="text-xs font-semibold text-gray-500"
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
              >
                Thêm vào giỏ
              </Button>
            </div>
          </form>
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

      {/* MODAL 3: PENDING ORDERS LIST */}
      {state.isPendingOrdersModalOpen && (
        <Modal
          isOpen={state.isPendingOrdersModalOpen}
          onClose={() => actions.setIsPendingOrdersModalOpen(false)}
          title="Đơn hàng chờ thanh toán"
          size="full"
        >
          {state.pendingOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <span className="material-symbols-outlined text-4xl mb-2 text-gray-300">receipt_long</span>
              <p className="text-sm font-semibold">Không có đơn hàng chờ nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto min-h-[300px] bg-white rounded-xl border border-gray-200 shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500 font-bold text-xs uppercase bg-gray-50">
                    <th className="py-3.5 px-4">Mã đơn hàng</th>
                    <th className="py-3.5 px-4">Khách hàng</th>
                    <th className="py-3.5 px-4">Tổng tiền</th>
                    <th className="py-3.5 px-4">Ngày tạo</th>
                    <th className="py-3.5 px-4">Ghi chú</th>
                    <th className="py-3.5 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-800 text-xs">
                  {state.pendingOrders.map((order: any) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-blue-600">{order.orderNumber}</td>
                      <td className="py-3.5 px-4 font-bold">{order.customerName || 'Khách lẻ'}</td>
                      <td className="py-3.5 px-4 font-extrabold text-green-600">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount)}
                      </td>
                      <td className="py-3.5 px-4 text-gray-500">
                        {new Date(order.createdAt).toLocaleString('vi-VN')}
                      </td>
                      <td className="py-3.5 px-4 text-gray-500 max-w-[150px] truncate">{order.note || '-'}</td>
                      <td className="py-3.5 px-4 text-right flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-red-50 hover:bg-red-100 text-red-600 border-red-200 text-xs py-1 px-3 h-8 font-semibold"
                          onClick={() => actions.setOrderIdToCancel(order.id)}
                          disabled={state.isCancellingOrder}
                        >
                          Hủy đơn
                        </Button>
                        <Button
                          size="sm"
                          className="bg-[#2ecc71] hover:bg-[#27ae60] text-white text-xs py-1 px-3 h-8 font-bold"
                          onClick={() => actions.handleResumePendingOrder(order)}
                        >
                          Tiếp tục
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Modal>
      )}

      {/* MODAL 4: CANCEL CONFIRMATION */}
      {state.orderIdToCancel !== null && (
        <Modal
          isOpen={true}
          onClose={() => actions.setOrderIdToCancel(null)}
          title="Xác nhận hủy đơn"
          size="sm"
        >
          <div className="flex flex-col gap-4">
            <p className="text-sm text-gray-600">
              Bạn có chắc chắn muốn hủy đơn hàng chờ này không? Thao tác này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => actions.setOrderIdToCancel(null)}
                className="font-semibold text-gray-500"
              >
                Bỏ qua
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white font-bold border-none"
                onClick={async () => {
                  const id = state.orderIdToCancel;
                  actions.setOrderIdToCancel(null);
                  if (id) {
                    await actions.handleCancelPendingOrder(id);
                  }
                }}
              >
                Hủy đơn hàng
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
