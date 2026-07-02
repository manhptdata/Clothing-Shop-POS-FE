import React, { useState, useRef, useEffect } from "react";
import toast from 'react-hot-toast';
import { useNavigate } from "react-router-dom";
import { useCreateCustomerMutation } from "@/redux/api/customerApi";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { CustomerRequest, CustomerRequestWithEmail } from "@/types/customer.types";

export default function CustomerFormPage() {
  const navigate = useNavigate();
  const [createCustomer, { isLoading }] = useCreateCustomerMutation();
  const formRef = useRef<HTMLFormElement>(null);

  const [formData, setFormData] = useState<CustomerRequestWithEmail>({
    fullName: "",
    phone: "",
    email: "",
    dateOfBirth: "",
    gender: "MALE",
    address: "",
    note: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Xử lý phím tắt F4
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F4") {
        e.preventDefault();
        formRef.current?.requestSubmit();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleGenderChange = (value: "MALE" | "FEMALE" | "OTHER") => {
    setFormData((prev) => ({ ...prev, gender: value }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Họ tên khách hàng không được để trống";
      isValid = false;
    } else if (formData.fullName.trim().length > 200) {
      newErrors.fullName = "Họ tên không được vượt quá 200 ký tự";
      isValid = false;
    }

    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    const phone = formData.phone.trim();
    if (!phone) {
      newErrors.phone = "Số điện thoại không được để trống";
      isValid = false;
    } else if (phone.length > 15) {
      newErrors.phone = "Số điện thoại không được vượt quá 15 ký tự";
      isValid = false;
    } else if (!phoneRegex.test(phone)) {
      newErrors.phone = "Số điện thoại không đúng định dạng Việt Nam";
      isValid = false;
    }

    if (formData.dateOfBirth) {
      const selectedDate = new Date(formData.dateOfBirth);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate > today) {
        newErrors.dateOfBirth = "Ngày sinh không được là một ngày trong tương lai";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const payload = {
        ...formData,
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        address: formData.address?.trim() || undefined,
        note: formData.note?.trim() || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
      };

      const res = await createCustomer(payload).unwrap();

      toast.success("Tạo mới tài khoản khách hàng thành công!");
      navigate("/customers/list");

    } catch (error: any) {
      console.error(error);
      const errorMsg = error?.data?.message || error?.error || "Lỗi không xác định";
      toast.error(`Tạo mới thất bại! Lỗi Server: ${errorMsg}`);
    }
  };

  return (
    <div className="flex-1 p-6 max-w-4xl mx-auto w-full">
      <header className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-gray-200/60 shadow-sm">
        <div className="w-full sm:w-auto text-center sm:text-left">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center justify-center sm:justify-start gap-2">
            <i className="fa-solid fa-user-plus text-blue-600"></i> Thêm mới khách hàng tại quầy
          </h1>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="ghost"
            leftIcon={<i className="fa-solid fa-arrow-left"></i>}
            onClick={() => navigate(-1)}
          >
            Quay lại
          </Button>
        </div>
      </header>

      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">

        {/* FORM */}
        <form ref={formRef} onSubmit={handleSubmit} className="p-6 space-y-5 text-sm" noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-label-caps text-label-caps text-on-surface mb-1">
                Họ và tên <span className="text-error">*</span>
              </label>
              <Input
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                error={errors.fullName}
                placeholder="Nhập họ tên khách hàng..."
                leftIcon={<i className="fa-solid fa-user"></i>}
                autoFocus
              />
            </div>
            <div>
              <label className="block font-label-caps text-label-caps text-on-surface mb-1">
                Số điện thoại <span className="text-error">*</span>
              </label>
              <Input
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                placeholder="Ví dụ: 0912345678..."
                leftIcon={<i className="fa-solid fa-phone"></i>}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="Ngày sinh"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
                error={errors.dateOfBirth}
                leftIcon={<i className="fa-solid fa-calendar-days"></i>}
              />
            </div>

            <div>
              <label className="block font-label-caps text-label-caps text-on-surface mb-1">
                Giới tính <span className="text-error">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3 h-[42px]">
                <label className={`flex items-center justify-center gap-2 p-2 border rounded transition-colors font-semibold text-xs cursor-pointer ${formData.gender === "MALE" ? "border-blue-500 bg-blue-50 text-blue-600" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                  <input type="radio" name="gender" value="MALE" checked={formData.gender === "MALE"} onChange={() => handleGenderChange("MALE")} className="hidden" />
                  <i className="fa-solid fa-mars"></i> Nam</label>
                <label className={`flex items-center justify-center gap-2 p-2 border rounded transition-colors font-semibold text-xs cursor-pointer ${formData.gender === "FEMALE" ? "border-pink-500 bg-pink-50 text-pink-600" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                  <input type="radio" name="gender" value="FEMALE" checked={formData.gender === "FEMALE"} onChange={() => handleGenderChange("FEMALE")} className="hidden" />
                  <i className="fa-solid fa-venus"></i> Nữ</label>
                <label className={`flex items-center justify-center gap-2 p-2 border rounded transition-colors font-semibold text-xs cursor-pointer ${formData.gender === "OTHER" ? "border-gray-500 bg-gray-100 text-gray-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                  <input type="radio" name="gender" value="OTHER" checked={formData.gender === "OTHER"} onChange={() => handleGenderChange("OTHER")} className="hidden" />
                  Khác</label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="Địa chỉ cư trú"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Số nhà, tên đường, quận/huyện, tỉnh/thành phố..."
                leftIcon={<i className="fa-solid fa-location-dot"></i>}
              />
            </div>
            <div>
              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email || ""}
                onChange={handleChange}
                placeholder="Ví dụ: abc@gmail.com..."
                leftIcon={<i className="fa-regular fa-envelope"></i>}
              />
            </div>
          </div>

          <div>
            <label className="block font-label-caps text-label-caps text-on-surface mb-1">
              Ghi chú
            </label>
            <textarea
              name="note"
              rows={3}
              value={formData.note}
              onChange={handleChange}
              placeholder="Ví dụ: Khách thích style tối màu, chuộng phong cách chill, mặc áo size L..."
              className="w-full bg-transparent border border-outline/20 font-body-md text-body-md p-2 rounded transition-colors focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            ></textarea>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end items-center text-xs">
            <div className="flex gap-3 w-full sm:w-auto">
              <Button type="button" variant="outline" className="flex-1 sm:flex-none justify-center" onClick={() => navigate("/customers/list")}>
                Hủy / Quay lại
              </Button>
              <Button type="submit" variant="primary" className="flex-1 sm:flex-none justify-center" isLoading={isLoading} leftIcon={<i className="fa-solid fa-floppy-disk"></i>}>
                Lưu khách hàng
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
