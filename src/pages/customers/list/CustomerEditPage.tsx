import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useGetCustomerByIdQuery,
  useUpdateCustomerMutation,
} from "@/redux/api/customerApi";
import type { CustomerUpdateRequest } from "@/types/customer.types";
import { Button } from "@/components/ui/Button";

export default function CustomerEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // API Hooks
  const { data: customerData, isLoading: isFetching } = useGetCustomerByIdQuery(
    Number(id),
    { skip: !id },
  );
  const [updateCustomer, { isLoading: isUpdating }] =
    useUpdateCustomerMutation();

  // Form State
  const [formData, setFormData] = useState<CustomerUpdateRequest>({
    fullName: "",
    phone: "",
    dateOfBirth: "",
    gender: "MALE",
    address: "",
    note: "",
    status: "ACTIVE",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Fill data when fetched
  useEffect(() => {
    if (customerData?.data) {
      const customer = customerData.data;
      setFormData({
        fullName: customer.fullName || "",
        phone: customer.phone || "",
        dateOfBirth: customer.dateOfBirth || "",
        gender: customer.gender || "MALE",
        address: customer.address || "",
        note: customer.note || "",
        status: customer.status || "ACTIVE",
      });
    }
  }, [customerData]);

  // Handle Input Change
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim())
      newErrors.fullName = "Họ tên không được để trống";

    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    if (!formData.phone.trim())
      newErrors.phone = "Số điện thoại không được để trống";
    else if (!phoneRegex.test(formData.phone))
      newErrors.phone = "Số điện thoại không đúng định dạng VN";

    if (formData.dateOfBirth) {
      const selectedDate = new Date(formData.dateOfBirth);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate > today)
        newErrors.dateOfBirth = "Ngày sinh không được ở tương lai";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    try {
      await updateCustomer({ id: Number(id), data: formData }).unwrap();
      setShowSuccessToast(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      // Đợi 1 giây để người dùng thấy thông báo thành công rồi tự động chuyển trang
      setTimeout(() => {
        navigate(`/customers/${id}`);
      }, 1000);
    } catch (error) {
      console.error("Cập nhật thất bại", error);
    }
  };

  // Keyboard shortcut F4
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F4") {
        e.preventDefault();
        handleSubmit();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [formData]); // Re-bind on formData change

  if (isFetching) {
    return (
      <div className="p-6 flex justify-center">
        <i className="fa-solid fa-spinner fa-spin text-3xl text-blue-600"></i>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 max-w-4xl mx-auto w-full">
      {/* HEADER */}
      <header className="mb-6 flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200/60 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium mb-1">
            <button
              onClick={() => navigate("/customers/list")}
              className="hover:text-blue-600 transition"
            >
              Quản lý khách hàng
            </button>
            <i className="fa-solid fa-chevron-right text-[10px]"></i>
            <button
              onClick={() => navigate(`/customers/${id}`)}
              className="hover:text-blue-600 transition"
            >
              Hồ sơ chi tiết
            </button>
            <i className="fa-solid fa-chevron-right text-[10px]"></i>
            <span className="text-gray-900 font-semibold">
              Cập nhật thông tin
            </span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <i className="fa-solid fa-user-gear text-amber-600"></i> Chỉnh sửa
            khách hàng: {formData.fullName}
          </h1>
        </div>
      </header>

      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
        {/* TOAST SUCCESS */}
        {showSuccessToast && (
          <div className="bg-emerald-50 border-b border-emerald-100 p-4 text-emerald-800 text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-circle-check text-base text-emerald-500"></i>
              <span>Cập nhật thông tin khách hàng thành công!</span>
            </div>
            <button
              onClick={() => setShowSuccessToast(false)}
              className="text-emerald-400 hover:text-emerald-600"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        )}

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-5 text-sm"
          noValidate
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                Họ và tên (fullName) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <i className="fa-solid fa-user absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-semibold text-gray-900 transition shadow-sm"
                />
              </div>
              {errors.fullName && (
                <p className="text-rose-500 text-[11px] mt-1 font-semibold">
                  {errors.fullName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                Số điện thoại (phone) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <i className="fa-solid fa-phone absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-semibold font-mono text-gray-900 transition shadow-sm"
                />
              </div>
              {errors.phone && (
                <p className="text-rose-500 text-[11px] mt-1 font-semibold">
                  {errors.phone}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Ngày sinh
              </label>
              <div className="relative">
                <i className="fa-solid fa-calendar-days absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth || ""}
                  onChange={handleChange}
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium text-gray-800 transition shadow-sm"
                />
              </div>
              {errors.dateOfBirth && (
                <p className="text-rose-500 text-[11px] mt-1 font-semibold">
                  {errors.dateOfBirth}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Giới tính <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {["MALE", "FEMALE", "OTHER"].map((g) => (
                  <label
                    key={g}
                    className={`flex items-center justify-center gap-2 p-2.5 border rounded-xl cursor-pointer font-semibold text-xs transition-colors ${formData.gender === g ? "border-blue-200 bg-blue-50/20 text-blue-600" : "border-gray-200 hover:bg-gray-50 text-gray-500"}`}
                  >
                    <input
                      type="radio"
                      name="gender"
                      value={g}
                      checked={formData.gender === g}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 hidden"
                    />
                    <span>
                      <i
                        className={`fa-solid ${g === "MALE" ? "fa-mars" : g === "FEMALE" ? "fa-venus" : "fa-genderless"}`}
                      ></i>{" "}
                      {g}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Trạng thái hoạt động <span className="text-rose-500">*</span>
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-bold text-emerald-600 cursor-pointer shadow-sm"
            >
              <option value="ACTIVE">ACTIVE (Đang hoạt động)</option>
              <option value="INACTIVE">
                INACTIVE (Tạm khóa / Ngừng hoạt động)
              </option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Địa chỉ cư trú
            </label>
            <div className="relative">
              <i className="fa-solid fa-location-dot absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
              <input
                type="text"
                name="address"
                value={formData.address || ""}
                onChange={handleChange}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium text-gray-800 transition shadow-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Ghi chú nội bộ
            </label>
            <textarea
              name="note"
              rows={3}
              value={formData.note || ""}
              onChange={handleChange as any}
              className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium text-gray-800 transition shadow-sm"
            ></textarea>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-xs">
            <span className="text-gray-400 font-medium font-mono hidden sm:inline">
              Mẹo POS: Ấn phím{" "}
              <kbd className="bg-gray-100 px-1 py-0.5 rounded border border-gray-200 font-bold">
                F4
              </kbd>{" "}
              để Cập nhật nhanh
            </span>
            <div className="flex space-x-3 ml-auto w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Hủy thay đổi
              </Button>
              <Button
                type="submit"
                isLoading={isUpdating}
                className="bg-amber-500 hover:bg-amber-600 text-white"
                leftIcon={<i className="fa-solid fa-floppy-disk"></i>}
              >
                Cập nhật thông tin (F4)
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
