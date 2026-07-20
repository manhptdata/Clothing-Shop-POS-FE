import { useState } from 'react';
import { useGetCustomerByIdQuery, useGetVoucherOptionsQuery } from '@/redux/api/customerApi';
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

  const { data: allVouchersData } = useGetVoucherOptionsQuery();
  const allVouchers = allVouchersData?.data || [];

  const activeCustomer = fullCustomerData?.data || selectedCustomer;
  const vouchersList = fullCustomerData?.data?.vouchers || [];
  
  // 1. Kiểm tra trong ví khách hàng (Private Voucher)
  let activeVoucher: any = customerType === 'MEMBER'
    ? vouchersList.find((v: any) => v.voucherCode.toLowerCase() === voucherCode.trim().toLowerCase() && v.status === 'UNUSED')
    : null;

  // Lọc danh sách Voucher Private theo Nhóm Khách Hàng
  const customerGroupId = activeCustomer?.groupId || activeCustomer?.customerGroup?.id;
  const eligiblePrivateVouchers = allVouchers
    .filter((v: any) => v.status === 'ACTIVE' && !v.isPublic && v.targetCustomerGroupId === customerGroupId)
    .map((v: any) => ({
      voucherCode: v.code,
      voucherName: v.name,
      discountAmount: v.discountAmount || 0,
      discountType: v.discountType || 'FIXED_AMOUNT',
      maxDiscountAmount: v.maxDiscountAmount,
      minOrderValue: v.minOrderValue || 0,
      status: 'UNUSED',
      isGroupVoucher: true,
    }));

  // 2. Nếu không có trong ví, kiểm tra xem có phải Public Voucher hoặc Private Voucher dành riêng cho nhóm này không
  if (!activeVoucher && voucherCode.trim()) {
    const matchedV = allVouchers.find((v: any) => {
      if (v.code.toLowerCase() !== voucherCode.trim().toLowerCase() || v.status !== 'ACTIVE') {
        return false;
      }
      // Public -> Bất kỳ ai cũng dùng được
      if (v.isPublic) return true;

      // Private -> Kiểm tra Nhóm Khách Hàng của khách hiện tại
      const customerGroupId = activeCustomer?.groupId || activeCustomer?.customerGroup?.id;
      if (v.targetCustomerGroupId && customerGroupId && v.targetCustomerGroupId === customerGroupId) {
        return true;
      }
      return false;
    });

    if (matchedV) {
      activeVoucher = {
        id: matchedV.id,
        voucherCode: matchedV.code,
        voucherName: matchedV.name,
        discountAmount: matchedV.discountAmount || 0,
        discountType: matchedV.discountType || 'FIXED_AMOUNT',
        maxDiscountAmount: matchedV.maxDiscountAmount,
        minOrderValue: matchedV.minOrderValue || 0,
        status: 'UNUSED',
      };
    }
  }

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

  const voucherError = voucherCode.trim() && !activeVoucher
    ? vouchersList.find((v: any) => v.voucherCode.toLowerCase() === voucherCode.trim().toLowerCase() && v.status === 'RESERVED')
      ? 'Mã đang được giữ cho đơn hàng khác đang chờ thanh toán'
      : 'Mã không hợp lệ hoặc đã hết lượt dùng'
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
    eligiblePrivateVouchers,
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
