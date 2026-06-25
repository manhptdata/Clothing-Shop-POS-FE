import React from 'react';
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
  return (
    <div className="bg-[#1e2227] border border-[#2d3238] rounded-xl p-md flex flex-col gap-sm">
      <div className="flex items-center justify-between">
        <span className="font-label-caps text-label-caps text-slate-400 font-bold uppercase tracking-wider text-[10px]">Khách hàng</span>

        {/* Segmented pill control */}
        <div className="bg-[#16191c] p-0.5 rounded-lg border border-[#2d3238] flex gap-0.5">
          <button
            onClick={() => {
              setCustomerType('GUEST');
              setSelectedCustomer(defaultCustomer);
            }}
            className={`px-3 py-1 rounded-md text-xs font-bold transition-all duration-300 ${customerType === 'GUEST' ? 'bg-primary text-on-primary shadow-sm' : 'bg-transparent text-slate-400 hover:text-white'}`}
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
            className={`px-3 py-1 rounded-md text-xs font-bold transition-all duration-300 ${customerType === 'MEMBER' ? 'bg-primary text-on-primary shadow-sm' : 'bg-transparent text-slate-400 hover:text-white'}`}
          >
            Thành viên
          </button>
        </div>
      </div>

      {customerType === 'MEMBER' ? (
        <div className="space-y-sm">
          {selectedCustomer && selectedCustomer.fullName !== 'Khách lẻ' ? (
            // Customer Profile Card
            <div className="flex items-center justify-between bg-primary/5 p-3 rounded-xl border border-primary/25 w-full transition-all hover:bg-primary/10">
              <div className="flex gap-3 items-center">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                  {selectedCustomer.fullName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-100">{selectedCustomer.fullName}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">phone</span>
                    {selectedCustomer.phone}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-slate-400 hover:text-error hover:bg-error/15 p-1 rounded-full transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          ) : (
            // Search & Suggestion box
            <div className="relative">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Tìm kiếm bằng tên hoặc SĐT..."
                  value={searchCustomerQuery}
                  onChange={(e) => setSearchCustomerQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  leftIcon={<span className="material-symbols-outlined text-[18px]">search</span>}
                  className="bg-[#16191c] border-[#2d3238] text-white placeholder:text-slate-500"
                />
                <Button
                  onClick={() => setIsCustomerModalOpen(true)}
                  variant="outline"
                  className="bg-[#2ecc71]/15 text-[#4ade80] border border-[#2ecc71] hover:bg-[#2ecc71] hover:text-white active:scale-95 transition-all text-xs px-3.5 font-semibold rounded-lg flex-shrink-0 h-[36px] flex items-center justify-center gap-1"
                  leftIcon={<span className="material-symbols-outlined text-sm">add</span>}
                >
                  Tạo khách
                </Button>
              </div>

              {/* Search Dropdown list */}
              {isSearchFocused && debouncedSearch && (
                <div className="absolute left-0 right-0 mt-1 bg-[#1a1d21] border border-[#2d3238] rounded-lg shadow-xl z-20 max-h-[220px] overflow-y-auto divide-y divide-[#2d3238]">
                  {customerSearchData?.data?.content && customerSearchData.data.content.length > 0 ? (
                    customerSearchData.data.content
                      .filter((c: any) => c.fullName !== 'Khách lẻ')
                      .map((c: any) => (
                        <div
                          key={c.id}
                          onClick={() => handleSelectCustomer(c)}
                          className="p-sm hover:bg-[#23272d] cursor-pointer flex justify-between items-center transition-colors"
                        >
                          <div>
                            <h4 className="text-sm font-semibold text-white">{c.fullName}</h4>
                            <p className="text-xs text-slate-400 mt-0.5">{c.phone}</p>
                          </div>
                          <span className="material-symbols-outlined text-xs text-primary">chevron_right</span>
                        </div>
                      ))
                  ) : (
                    <div className="p-md text-center text-xs text-slate-400">
                      Không tìm thấy khách hàng. <br />
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

          {/* Loyalty Points & Vouchers Integration */}
          {selectedCustomer && selectedCustomer.fullName !== 'Khách lẻ' && (
            <div className="mt-sm pt-sm border-t border-[#2d3238] space-y-sm">
              {/* Voucher Select */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Voucher áp dụng</span>
                  {vouchersList.length > 0 && (
                    <span className="text-[10px] text-[#2ecc71] font-semibold">{vouchersList.filter(v => v.status === 'UNUSED').length} khả dụng</span>
                  )}
                </div>
                <div className="space-y-2">
                  <Select
                    value={voucherCode}
                    onChange={(val) => setVoucherCode(val as string)}
                    className="bg-[#16191c] border-[#2d3238] text-slate-200"
                    options={[
                      { label: '-- Chọn voucher từ ví khách --', value: '' },
                      ...vouchersList
                        .filter(v => v.status === 'UNUSED')
                        .map(v => ({
                          label: `${v.voucherCode} (Giảm ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v.discountAmount)})`,
                          value: v.voucherCode,
                        }))
                    ]}
                  />

                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Hoặc nhập mã voucher khác..."
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value)}
                      leftIcon={<span className="material-symbols-outlined text-sm">local_activity</span>}
                      className="bg-[#16191c] border-[#2d3238] text-slate-200 placeholder:text-slate-500"
                    />
                    {voucherCode && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setVoucherCode('')}
                        className="px-2.5 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex-shrink-0"
                      >
                        Xóa
                      </Button>
                    )}
                  </div>
                </div>
                {voucherError && (
                  <p className="text-[10px] text-error mt-1 font-medium">{voucherError}</p>
                )}
                {isVoucherValid && activeVoucher && (
                  <p className="text-[10px] text-[#2ecc71] mt-1 font-medium">Áp dụng thành công: Giảm -{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(voucherDiscount)}</p>
                )}
              </div>

              {/* Loyalty Points Use */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dùng điểm tích lũy</span>
                  <span className="text-[10px] text-slate-400">Có: <strong className="text-white font-bold">{availablePoints}</strong> điểm</span>
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
                    leftIcon={<span className="material-symbols-outlined text-[16px]">monetization_on</span>}
                    className="bg-[#16191c] border-[#2d3238] text-slate-200 placeholder:text-slate-500"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setPointsToUse(maxPointsAbleToUse)}
                    className="bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-bold px-2 py-1 rounded-md border border-primary/20 flex-shrink-0 whitespace-nowrap"
                  >
                    Tối đa ({maxPointsAbleToUse})
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Guest Profile
        <div className="bg-[#1a1d21]/30 p-sm rounded-lg border border-outline/10 flex items-center gap-sm">
          <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold">
            KL
          </div>
          <div>
            <h3 className="font-title-sm text-title-sm text-white font-bold">Khách lẻ vãng lai</h3>
            <p className="font-body-sm text-body-sm text-slate-400 mt-0.5">Không tích lũy điểm thưởng</p>
          </div>
        </div>
      )}
    </div>
  );
};
