import { useState } from 'react';
import toast from 'react-hot-toast';
import { useGetOrdersQuery, useCancelOrderMutation } from '@/redux/api/orderApi';

export function usePendingOrders() {
  const [pendingOrderId, setPendingOrderId] = useState<number | null>(null);
  const [pendingOrderNumber, setPendingOrderNumber] = useState<string | null>(null);
  const [isPendingOrdersModalOpen, setIsPendingOrdersModalOpen] = useState(false);
  const [orderIdToCancel, setOrderIdToCancel] = useState<number | null>(null);

  const { data: pendingOrdersData, refetch: refetchPendingOrders } = useGetOrdersQuery({
    page: 0,
    size: 100,
    status: 'PENDING'
  });

  const pendingOrders = (pendingOrdersData?.data as any)?.result || pendingOrdersData?.data?.content || [];
  const pendingOrdersCount = (pendingOrdersData?.data as any)?.meta?.total || (pendingOrdersData?.data as any)?.total || pendingOrdersData?.data?.content?.length || 0;

  const [cancelOrder, { isLoading: isCancellingOrder }] = useCancelOrderMutation();

  const handleCancelPendingOrder = async (id: number) => {
    try {
      await cancelOrder({ id, data: { reason: 'Hủy đơn hàng lưu tạm' } }).unwrap();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Có lỗi xảy ra khi hủy đơn hàng.');
    }
  };

  const clearPendingState = () => {
    setPendingOrderId(null);
    setPendingOrderNumber(null);
  };

  return {
    pendingOrderId,
    setPendingOrderId,
    pendingOrderNumber,
    setPendingOrderNumber,
    isPendingOrdersModalOpen,
    setIsPendingOrdersModalOpen,
    orderIdToCancel,
    setOrderIdToCancel,
    pendingOrders,
    pendingOrdersCount,
    isCancellingOrder,
    handleCancelPendingOrder,
    clearPendingState,
    refetchPendingOrders
  };
}
