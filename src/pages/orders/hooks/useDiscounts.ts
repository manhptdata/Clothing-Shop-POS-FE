import { useState } from 'react';
import { useGetCustomerByIdQuery } from '@/redux/api/customerApi';
import type { Customer } from '@/types/customer.types';

export function useDiscounts(
  selectedCustomer: Customer | null,
  customerType: 'GUEST' | 'MEMBER',
  rawTotal: number
) {
  const [pointsToUse, setPointsToUse] = useState<number>(0);
  const [voucherCode, setVoucherCode] = useState('');

  const { data: fullCustomerData } = useGetCustomerByIdQuery(
    selectedCustomer?.id as number,
    { skip: !selectedCustomer || selectedCustomer.id === 1 }
  );

  const activeCustomer = fullCustomerData?.data || selectedCustomer;
  const vouchersList = fullCustomerData?.data?.vouchers || [];
  const activeVoucher = customerType === 'MEMBER'
    ? vouchersList.find((v: any) => v.voucherCode.toLowerCase() === voucherCode.trim().toLowerCase() && v.status === 'UNUSED')
    : null;

  const isVoucherValid = Boolean(activeVoucher && (rawTotal >= activeVoucher.minOrderValue));
  let calculatedVoucherDiscount = 0;
  if (isVoucherValid && activeVoucher) {
    if (activeVoucher.discountType === 'PERCENTAGE') {
      calculatedVoucherDiscount = Math.round((rawTotal * activeVoucher.discountAmount) / 100);
      if (activeVoucher.maxDiscountAmount && activeVoucher.maxDiscountAmount > 0) {
        calculatedVoucherDiscount = Math.min(calculatedVoucherDiscount, activeVoucher.maxDiscountAmount);
      }
    } else {
      calculatedVoucherDiscount = activeVoucher.discountAmount;
    }
  }
  const voucherDiscount = isVoucherValid && activeVoucher ? Math.min(rawTotal, calculatedVoucherDiscount) : 0;
  const remainingAfterVoucher = Math.max(0, rawTotal - voucherDiscount);

  const availablePoints = customerType === 'MEMBER' ? (activeCustomer?.rewardPoints || 0) : 0;
  const maxPointsAbleToUse = Math.min(availablePoints, Math.ceil(remainingAfterVoucher / 1000));
  const pointsDiscount = customerType === 'MEMBER'
    ? Math.min(remainingAfterVoucher, pointsToUse * 1000)
    : 0;

  const total = Math.max(0, remainingAfterVoucher - pointsDiscount);

  const voucherError = customerType === 'MEMBER' && voucherCode && !activeVoucher
    ? vouchersList.find((v: any) => v.voucherCode.toLowerCase() === voucherCode.trim().toLowerCase() && v.status === 'RESERVED')
      ? 'Mã đang được giữ cho đơn hàng khác đang chờ thanh toán'
      : 'Mã không hợp lệ hoặc đã sử dụng'
    : activeVoucher && rawTotal < activeVoucher.minOrderValue
      ? `Chưa đạt đơn tối thiểu: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(activeVoucher.minOrderValue)}`
      : null;

  const clearDiscountsState = () => {
    setPointsToUse(0);
    setVoucherCode('');
  };

  return {
    pointsToUse,
    setPointsToUse,
    voucherCode,
    setVoucherCode,
    activeCustomer,
    vouchersList,
    activeVoucher,
    isVoucherValid,
    voucherDiscount,
    availablePoints,
    maxPointsAbleToUse,
    pointsDiscount,
    total,
    voucherError,
    clearDiscountsState
  };
}
