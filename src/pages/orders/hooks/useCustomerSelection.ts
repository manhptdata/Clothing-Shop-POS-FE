import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import {
  useGetCustomersQuery,
  useCreateCustomerMutation,
  useGetCustomerGroupsQuery,
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
    groupId: 0,
  });

  const [createCustomer] = useCreateCustomerMutation();
  const { data: groupData } = useGetCustomerGroupsQuery();
  const groups = groupData?.data?.content || [];

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
    if (groups.length > 0 && newCustomerForm.groupId === 0) {
      setNewCustomerForm(prev => ({ ...prev, groupId: groups[0].id }));
    }
  }, [groups]);

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
          groupId: groups[0]?.id || 1,
        });
      }
    } catch (err) {
      alert('Không thể tạo khách hàng. Vui lòng kiểm tra lại số điện thoại hoặc định dạng dữ liệu.');
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
    groups,
    debouncedSearch,
    customerSearchData,
    defaultCustomer,
    handleSelectCustomer,
    handleCreateCustomerSubmit,
    clearCustomerState
  };
}
