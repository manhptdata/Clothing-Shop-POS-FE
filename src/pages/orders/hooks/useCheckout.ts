import { useState, useEffect } from 'react';

export function useCheckout(total: number) {
  const [note, setNote] = useState('');
  const [customerPaid, setCustomerPaid] = useState<number | ''>('');
  const [isPaidModified, setIsPaidModified] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'QR_PAYOS'>('CASH');
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [autoPrint, setAutoPrint] = useState(true);

  useEffect(() => {
    if (!isPaidModified) {
      setCustomerPaid(total === 0 ? '' : total);
    }
  }, [total, isPaidModified]);

  const changeAmount = customerPaid !== '' ? Math.max(0, customerPaid - total) : 0;

  const clearCheckoutState = () => {
    setNote('');
    setCustomerPaid('');
    setIsPaidModified(false);
  };

  return {
    note,
    setNote,
    customerPaid,
    setCustomerPaid,
    isPaidModified,
    setIsPaidModified,
    paymentMethod,
    setPaymentMethod,
    isQRModalOpen,
    setIsQRModalOpen,
    changeAmount,
    clearCheckoutState,
    autoPrint,
    setAutoPrint
  };
}
