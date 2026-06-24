import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

export default function CustomerFormPage() {
  const { id } = useParams();
  const isEdit = !!id;

  return (
    <div className="max-w-[1440px] mx-auto w-full">
      <div className="flex justify-between items-end mb-lg">
        <div>
          <h2 className="font-headline-md text-headline-md text-on-background">
            {isEdit ? 'Sửa thông tin khách hàng' : 'Thêm khách hàng mới'}
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
            Quản lý hồ sơ và thông tin chi tiết của khách hàng.
          </p>
        </div>
        <div className="flex gap-sm">
          <Link to="/customers">
            <Button variant="outline">Hủy</Button>
          </Link>
          <Button>{isEdit ? 'Lưu thay đổi' : 'Tạo khách hàng'}</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        <div className="lg:col-span-2 space-y-md">
          <div className="bg-surface-container-lowest rounded-lg p-md border border-outline/10">
            <h3 className="font-title-sm text-title-sm text-on-background mb-md">Thông tin cá nhân</h3>
            <div className="space-y-sm">
              <Input
                id="cname"
                label="Họ và tên"
                defaultValue={isEdit ? 'Madeleine Croft' : ''}
                placeholder="Nhập họ và tên..."
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
                <Input
                  id="cphone"
                  label="Số điện thoại"
                  type="tel"
                  defaultValue={isEdit ? '+1 (555) 019-2834' : ''}
                  placeholder="+84 ..."
                  leftIcon={<span className="material-symbols-outlined text-[18px]">call</span>}
                />
                <Input
                  id="cemail"
                  label="Địa chỉ Email"
                  type="email"
                  defaultValue={isEdit ? 'm.croft@press.com' : ''}
                  placeholder="email@example.com"
                  leftIcon={<span className="material-symbols-outlined text-[18px]">mail</span>}
                />
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-lg p-md border border-outline/10">
            <h3 className="font-title-sm text-title-sm text-on-background mb-md">Phân loại & Ghi chú</h3>
            <div className="space-y-sm">
              <Select
                id="cgroup"
                label="Nhóm khách hàng"
                options={[
                  { value: 'vip', label: 'VIP' },
                  { value: 'general', label: 'Phổ thông' },
                  { value: 'press', label: 'Báo chí / KOL' },
                ]}
                defaultValue={isEdit ? 'press' : 'general'}
                helperText="Quyết định đặc quyền truy cập và thư mời tham gia sự kiện."
              />
              <div className="flex flex-col gap-xs pt-sm">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase" htmlFor="cnotes">
                  Ghi chú nội bộ
                </label>
                <textarea
                  className="w-full p-sm bg-transparent border border-outline-variant/50 focus:border-primary focus:border-2 rounded font-body-md text-body-md text-on-surface transition-all outline-none resize-none"
                  id="cnotes"
                  rows={4}
                  defaultValue={isEdit ? 'Thích liên hệ qua email. Đã tham dự sự kiện ra mắt Bộ sưu tập Mùa xuân.' : ''}
                  placeholder="Ghi chú nội bộ về khách hàng này..."
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-md">
          <div className="bg-surface-container-lowest rounded-lg p-md border border-outline/10">
            <h3 className="font-title-sm text-title-sm text-on-background mb-md">Ảnh đại diện</h3>
            <div className="flex flex-col items-center gap-md">
              <div className="w-32 h-32 rounded-full bg-surface-variant overflow-hidden border border-outline-variant/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '48px' }}>
                  person
                </span>
              </div>
              <div className="text-center">
                <Button variant="outline" size="sm" className="mb-xs">
                  Thay đổi ảnh
                </Button>
                <p className="font-body-sm text-body-sm text-on-surface-variant">JPG, GIF hoặc PNG. Tối đa 800KB</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
