import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useDebounce } from '@/hooks/useDebounce';
import {
  useGetCustomersQuery,
  useCreateCustomerMutation,
} from '@/redux/api/customerApi';
import type { Customer } from '@/types/customer.types';

export function useCustomerSelection() {
  const [customerType, setCustomerType] = useState<'GUEST' | 'MEMBER'>('GUEST');
  const [searchCustomerQuery, setSearchCustomerQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  const [newCustomerForm, setNewCustomerForm] = useState({
    fullName: '',
    phone: '',
    gender: 'MALE' as 'MALE' | 'FEMALE' | 'OTHER',
  });

  const [createCustomer] = useCreateCustomerMutation();

  const debouncedSearch = useDebounce(searchCustomerQuery, 300);
  const { data: customerSearchData } = useGetCustomersQuery(
    { search: debouncedSearch, page: 0, size: 5 },
    { skip: !debouncedSearch }
  );

  const { data: defaultCustomerSearch } = useGetCustomersQuery(
    { search: 'Khách lẻ', page: 0, size: 1 }
  );
  const defaultCustomer = defaultCustomerSearch?.data?.content?.[0] || null;



  useEffect(() => {
    if (customerType === 'GUEST' && defaultCustomer) {
      setSelectedCustomer(defaultCustomer);
    }
  }, [customerType, defaultCustomer]);

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerType('MEMBER');
    setIsSearchFocused(false);
    setSearchCustomerQuery('');
  };

  const handleCreateCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        fullName: newCustomerForm.fullName,
        phone: newCustomerForm.phone,
        gender: newCustomerForm.gender,
      };
      const response = await createCustomer(payload as any).unwrap();
      if (response.data) {
        setSelectedCustomer(response.data);
        setCustomerType('MEMBER');
        setIsCustomerModalOpen(false);
        setNewCustomerForm({
          fullName: '',
          phone: '',
          gender: 'MALE',
        });
      }
    } catch (err) {
      toast.error('Không thể tạo khách hàng. Vui lòng kiểm tra lại số điện thoại hoặc định dạng dữ liệu.');
      throw err;
    }
  };

  const clearCustomerState = () => {
    setCustomerType('GUEST');
    setSelectedCustomer(defaultCustomer);
    setSearchCustomerQuery('');
    setIsSearchFocused(false);
  };

  return {
    customerType,
    setCustomerType,
    searchCustomerQuery,
    setSearchCustomerQuery,
    selectedCustomer,
    setSelectedCustomer,
    isSearchFocused,
    setIsSearchFocused,
    isCustomerModalOpen,
    setIsCustomerModalOpen,
    newCustomerForm,
    setNewCustomerForm,
    debouncedSearch,
    customerSearchData,
    defaultCustomer,
    handleSelectCustomer,
    handleCreateCustomerSubmit,
    clearCustomerState
  };
}
