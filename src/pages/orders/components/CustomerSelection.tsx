import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { Customer } from '@/types/customer.types';

interface CustomerSelectionProps {
  customerType: 'GUEST' | 'MEMBER';
  setCustomerType: (type: 'GUEST' | 'MEMBER') => void;
  selectedCustomer: Customer | null;
  setSelectedCustomer: (customer: Customer | null) => void;
  defaultCustomer: Customer | null;
  searchCustomerQuery: string;
  setSearchCustomerQuery: (query: string) => void;
  isSearchFocused: boolean;
  setIsSearchFocused: (focused: boolean) => void;
  debouncedSearch: string;
  customerSearchData: any;
  handleSelectCustomer: (customer: Customer) => void;
  setIsCustomerModalOpen: (open: boolean) => void;
  vouchersList: any[];
  eligiblePrivateVouchers?: any[];
  voucherCode: string;
  setVoucherCode: (code: string) => void;
  voucherError: string | null;
  isVoucherValid: boolean;
  activeVoucher: any;
  voucherDiscount: number;
  availablePoints: number;
  pointsToUse: number;
  setPointsToUse: (points: number) => void;
  maxPointsAbleToUse: number;
}

export const CustomerSelection: React.FC<CustomerSelectionProps> = ({
  customerType,
  setCustomerType,
  selectedCustomer,
  setSelectedCustomer,
  defaultCustomer,
  searchCustomerQuery,
  setSearchCustomerQuery,
  isSearchFocused,
  setIsSearchFocused,
  debouncedSearch,
  customerSearchData,
  handleSelectCustomer,
  setIsCustomerModalOpen,
  vouchersList,
  eligiblePrivateVouchers = [],
  voucherCode,
  setVoucherCode,
  voucherError,
  isVoucherValid,
  activeVoucher,
  voucherDiscount,
  availablePoints,
  pointsToUse,
  setPointsToUse,
  maxPointsAbleToUse,
}) => {
  const [isPromotionOpen, setIsPromotionOpen] = useState(!!voucherCode || pointsToUse > 0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsSearchFocused]);

  // F4 global hotkey for customer search focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F4') {
        e.preventDefault();
        setCustomerType('MEMBER');
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setCustomerType]);

  useEffect(() => {
    if (voucherCode || pointsToUse > 0) {
      setIsPromotionOpen(true);
    }
  }, [voucherCode, pointsToUse]);

  return (
    <div className="bg-white border-b border-gray-100 pb-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Khách hàng</span>

        {/* Segmented pill control */}
        <div className="bg-gray-100 p-0.5 rounded-lg border border-gray-200 flex gap-0.5">
          <button
            onClick={() => {
              setCustomerType('GUEST');
              setSelectedCustomer(defaultCustomer);
            }}
            className={`px-3 py-1 rounded-md text-xs font-bold transition-all duration-200 ${customerType === 'GUEST'
                ? 'bg-white text-gray-800 shadow-sm'
                : 'bg-transparent text-gray-500 hover:text-gray-700'
              }`}
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
            className={`px-3 py-1 rounded-md text-xs font-bold transition-all duration-200 ${customerType === 'MEMBER'
                ? 'bg-white text-gray-800 shadow-sm'
                : 'bg-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            Thành viên
          </button>
        </div>
      </div>

      {customerType === 'MEMBER' ? (
        <div className="space-y-3">
          {selectedCustomer && selectedCustomer.fullName !== 'Khách lẻ' ? (
            // Customer Profile Card
            <div className="flex items-center justify-between bg-blue-50/50 p-3 rounded-xl border border-blue-100 w-full transition-all hover:bg-blue-50">
              <div className="flex gap-3 items-center">
                <div className="w-9 h-9 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-600 font-bold text-xs">
                  {selectedCustomer.fullName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-800">{selectedCustomer.fullName}</h3>
                  <p className="text-[10px] text-gray-500 mt-0.5 font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">phone</span>
                    {selectedCustomer.phone}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 rounded-full transition-all"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            </div>
          ) : (
            // Search & Suggestion box
            <div className="relative" ref={dropdownRef}>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-gray-400 select-none">search</span>
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Tìm kiếm bằng tên hoặc SĐT... [F4]"
                    value={searchCustomerQuery}
                    onChange={(e) => setSearchCustomerQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    className="w-full h-[36px] pl-9 pr-3 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all shadow-sm"
                  />
                </div>
                <Button
                  onClick={() => setIsCustomerModalOpen(true)}
                  variant="outline"
                  className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-gray-900 active:scale-95 transition-all text-xs px-3 font-semibold rounded-lg flex-shrink-0 h-[36px] flex items-center justify-center gap-1 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  Tạo khách
                </Button>
              </div>

              {/* Search Dropdown list */}
              {isSearchFocused && debouncedSearch && (
                <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-[220px] overflow-y-auto divide-y divide-gray-100">
                  {customerSearchData?.data?.content && customerSearchData.data.content.length > 0 ? (
                    customerSearchData.data.content
                      .filter((c: any) => c.fullName !== 'Khách lẻ')
                      .map((c: any) => (
                        <div
                          key={c.id}
                          onClick={() => {
                            handleSelectCustomer(c);
                            setIsSearchFocused(false);
                          }}
                          className="p-3 hover:bg-gray-50 cursor-pointer flex justify-between items-center transition-colors"
                        >
                          <div>
                            <h4 className="text-xs font-semibold text-gray-900">{c.fullName}</h4>
                            <p className="text-[10px] text-gray-500 mt-0.5">{c.phone}</p>
                          </div>
                          <span className="material-symbols-outlined text-xs text-blue-600">chevron_right</span>
                        </div>
                      ))
                  ) : (
                    <div className="p-4 text-center text-xs text-gray-500">
                      Không tìm thấy khách hàng. <br />
                      <button
                        onClick={() => {
                          setIsCustomerModalOpen(true);
                          setIsSearchFocused(false);
                        }}
                        className="text-blue-600 font-semibold hover:underline mt-1 inline-block"
                      >
                        + Thêm khách hàng mới
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Loyalty Points & Vouchers Integration */}
          {selectedCustomer && selectedCustomer.fullName !== 'Khách lẻ' && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsPromotionOpen(!isPromotionOpen)}
                className="w-full flex items-center justify-between text-[10px] font-bold text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-wider py-1"
              >
                <span className="flex items-center gap-1.5 text-gray-700 hover:text-gray-900 transition-colors">
                  <span className="material-symbols-outlined text-[16px]">redeem</span>
                  Voucher & Điểm tích lũy
                </span>
                <span
                  className="material-symbols-outlined text-[16px] text-gray-400 transition-transform duration-200"
                  style={{ transform: isPromotionOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                >
                  keyboard_arrow_down
                </span>
              </button>

              {isPromotionOpen && (
                <div className="mt-2 space-y-3 animate-in fade-in duration-200">
                  {/* Voucher Select */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Voucher áp dụng</span>
                      {(vouchersList.length > 0 || eligiblePrivateVouchers.length > 0) && (
                        <span className="text-[9px] text-green-600 font-semibold">
                          {vouchersList.filter((v) => v.status === 'UNUSED').length + eligiblePrivateVouchers.length} khả dụng
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Select
                        value={(vouchersList.some(v => v.voucherCode === voucherCode) || eligiblePrivateVouchers.some(v => v.voucherCode === voucherCode)) ? voucherCode : ''}
                        onChange={(val) => setVoucherCode(val as string)}
                        className="bg-white border-gray-300 text-gray-700 text-xs"
                        options={[
                          { label: '-- Chọn voucher từ ví khách --', value: '' },
                          ...vouchersList
                            .filter((v) => v.status === 'UNUSED')
                            .map((v) => ({
                              label: `${v.voucherCode} (Ví cá nhân - Giảm ${new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND',
                              }).format(v.discountAmount)})`,
                              value: v.voucherCode,
                            })),
                          ...eligiblePrivateVouchers
                            .map((v) => ({
                              label: `${v.voucherCode} (Ưu đãi hạng - Giảm ${new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND',
                              }).format(v.discountAmount)})`,
                              value: v.voucherCode,
                            })),
                        ]}
                      />

                      <div className="flex gap-2">
                        <Input
                          type="text"
                          placeholder="Hoặc nhập mã voucher khác..."
                          value={voucherCode}
                          onChange={(e) => setVoucherCode(e.target.value)}
                          leftIcon={<span className="material-symbols-outlined text-sm text-gray-400">local_activity</span>}
                          className="bg-white border-gray-300 text-gray-800 placeholder:text-gray-400 text-xs"
                        />
                        {voucherCode && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setVoucherCode('')}
                            className="px-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs flex-shrink-0"
                          >
                            Xóa
                          </Button>
                        )}
                      </div>
                    </div>
                    {voucherError && (
                      <p className="text-[9px] text-red-500 mt-1 font-medium">{voucherError}</p>
                    )}
                    {isVoucherValid && activeVoucher && (
                      <p className="text-[9px] text-green-600 mt-1 font-medium">
                        Áp dụng thành công: Giảm -
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                        }).format(voucherDiscount)}
                      </p>
                    )}
                  </div>

                  {/* Loyalty Points Use */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Dùng điểm tích lũy</span>
                      <span className="text-[9px] text-gray-500">
                        Có: <strong className="text-gray-800 font-bold">{availablePoints}</strong> điểm
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={0}
                        max={maxPointsAbleToUse}
                        value={pointsToUse || ''}
                        onChange={(e) => {
                          const val = e.target.value === '' ? 0 : Number(e.target.value);
                          setPointsToUse(Math.min(val, maxPointsAbleToUse));
                        }}
                        placeholder="Nhập số điểm..."
                        leftIcon={<span className="material-symbols-outlined text-[16px] text-gray-400">monetization_on</span>}
                        className="bg-white border-gray-300 text-gray-800 placeholder:text-gray-400 text-xs"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setPointsToUse(maxPointsAbleToUse)}
                        className="!bg-green-50 !text-green-600 !border-green-100 hover:!bg-green-100 text-[10px] font-bold px-2.5 py-1 rounded-md border flex-shrink-0 whitespace-nowrap transition-colors"
                      >
                        Tối đa ({maxPointsAbleToUse})
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        // Guest Profile
        <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs">
            KL
          </div>
          <div>
            <h3 className="text-xs font-bold text-gray-800">Khách lẻ vãng lai</h3>
            <p className="text-[10px] text-gray-500 mt-0.5">Không tích lũy điểm thưởng</p>
          </div>
        </div>
      )}
    </div>
  );
};
