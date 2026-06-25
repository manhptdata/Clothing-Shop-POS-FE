// // ProductFilterSidebar.tsx
// import { Link } from 'react-router-dom';
// import { Button } from '@/components/ui/Button';

// interface ProductFilterSidebarProps {
//     tempProductName: string;
//     setTempProductName: (value: string) => void;
//     tempSku: string;
//     setTempSku: (value: string) => void;
//     tempCategoryID: number | undefined;
//     setTempCategoryID: (value: number | undefined) => void;
//     tempStatus: string;
//     setTempStatus: (value: string) => void;
//     categories: any[];
//     handleApplyFilter: () => void;
//     handleClearFilters: () => void;
// }

// export default function ProductFilterSidebar({
//     tempProductName,
//     setTempProductName,
//     tempSku,
//     setTempSku,
//     tempCategoryID,
//     setTempCategoryID,
//     tempStatus,
//     setTempStatus,
//     categories,
//     handleApplyFilter,
//     handleClearFilters,
// }: ProductFilterSidebarProps) {
//     return (
//         <aside className="w-full lg:w-80 flex-shrink-0 mb-lg lg:mb-0">
//             <div className="space-y-4 sticky top-28">
//                 <div className="bg-primary-container text-on-primary-container p-md rounded-lg shadow-sm">
//                     <div className="flex items-center justify-between mb-md border-b border-on-primary-container/20 pb-sm">
//                         <h2 className="font-headline-md text-headline-md text-on-primary">Bộ lọc</h2>
//                         <span className="material-symbols-outlined text-on-primary">tune</span>
//                     </div>

//                     <div className="space-y-md">
//                         {/* Tìm kiếm theo tên */}
//                         <div>
//                             <h3 className="font-label-caps text-label-caps text-on-primary-container/80 mb-sm uppercase">Tên sản phẩm</h3>
//                             <input
//                                 type="text"
//                                 value={tempProductName}
//                                 onChange={(e) => setTempProductName(e.target.value)}
//                                 placeholder="Nhập tên sản phẩm..."
//                                 className="w-full px-3 py-2 rounded-md bg-white/80 text-black border border-on-primary-container/20 focus:outline-none focus:ring-2 focus:ring-primary/50"
//                             />
//                         </div>

//                         {/* Tìm kiếm theo SKU */}
//                         <div>
//                             <h3 className="font-label-caps text-label-caps text-on-primary-container/80 mb-sm uppercase">Mã SKU</h3>
//                             <input
//                                 type="text"
//                                 value={tempSku}
//                                 onChange={(e) => setTempSku(e.target.value)}
//                                 placeholder="Nhập mã SKU..."
//                                 className="w-full px-3 py-2 rounded-md bg-white/80 text-black border border-on-primary-container/20 focus:outline-none focus:ring-2 focus:ring-primary/50"
//                             />
//                         </div>

//                         {/* Danh mục */}
//                         <div>
//                             <h3 className="font-label-caps text-label-caps text-on-primary-container/80 mb-sm uppercase">Danh mục</h3>
//                             <select
//                                 value={tempCategoryID || ''}
//                                 onChange={(e) => setTempCategoryID(e.target.value ? Number(e.target.value) : undefined)}
//                                 className="w-full px-3 py-2 rounded-md bg-white/80 text-black border border-on-primary-container/20 focus:outline-none focus:ring-2 focus:ring-primary/50"
//                             >
//                                 <option value="" className="text-black">Tất cả danh mục</option>
//                                 {categories.map((cat: any) => (
//                                     <option key={cat.id} value={cat.id} className="text-black">{cat.name}</option>
//                                 ))}
//                             </select>
//                         </div>

//                         {/* Trạng thái */}
//                         <div>
//                             <h3 className="font-label-caps text-label-caps text-on-primary-container/80 mb-sm uppercase pt-sm border-t border-on-primary-container/20">Trạng thái</h3>
//                             <div className="space-y-2">
//                                 {[
//                                     { value: 'Còn hàng', label: 'Còn hàng' },
//                                     { value: 'Sắp hết', label: 'Sắp hết' },
//                                     { value: 'Hết hàng', label: 'Hết hàng' },
//                                     { value: 'Tất cả', label: 'Tất cả' }
//                                 ].map((s) => (
//                                     <label key={s.value} className="flex items-center space-x-2 cursor-pointer group">
//                                         <input
//                                             type="radio"
//                                             name="status"
//                                             checked={tempStatus === s.value}
//                                             onChange={() => setTempStatus(s.value)}
//                                             className="form-radio h-4 w-4 text-primary"
//                                         />
//                                         <span className="font-body-sm text-body-sm text-on-primary">{s.label}</span>
//                                     </label>
//                                 ))}
//                             </div>
//                         </div>

//                         {/* Sản phẩm đã xóa */}
//                         <div>
//                             <h3 className="font-label-caps text-label-caps text-on-primary-container/80 mb-sm uppercase pt-sm border-t border-on-primary-container/20">Hiển thị</h3>
//                             <label className="flex items-center space-x-2 cursor-pointer group">
//                                 <input
//                                     type="checkbox"
//                                     checked={tempStatus === 'Đã xóa'}
//                                     onChange={() => setTempStatus(tempStatus === 'Đã xóa' ? 'Còn hàng' : 'Đã xóa')}
//                                     className="form-checkbox h-4 w-4 rounded-sm text-primary"
//                                 />
//                                 <span className="font-body-sm text-body-sm text-on-primary">Sản phẩm đã xóa</span>
//                             </label>
//                         </div>
//                     </div>

//                     <div className="flex gap-2 mt-md">
//                         <Button onClick={handleApplyFilter} variant="primary" className="flex-1 justify-center">
//                             Áp dụng lọc
//                         </Button>
//                         <Button onClick={handleClearFilters} variant="outline" className="flex-1 justify-center bg-white/80 text-on-primary border-on-primary/20 hover:bg-white">
//                             Xóa
//                         </Button>
//                     </div>
//                 </div>

//                 <Link to="/products/new" className="block w-full">
//                     <Button variant="primary" className="w-full justify-center" leftIcon={<span className="material-symbols-outlined text-[18px]">add</span>}>
//                         Thêm sản phẩm
//                     </Button>
//                 </Link>
//             </div>
//         </aside>
//     );
// }

// ProductFilterSidebar.tsx
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

interface ProductFilterSidebarProps {
    tempProductName: string;
    setTempProductName: (value: string) => void;
    tempSku: string;
    setTempSku: (value: string) => void;
    tempCategoryID: number | undefined;
    setTempCategoryID: (value: number | undefined) => void;
    tempStatus: string;
    setTempStatus: (value: string) => void;
    categories: any[];
    handleApplyFilter: () => void;
    handleClearFilters: () => void;
}

export default function ProductFilterSidebar({
    tempProductName,
    setTempProductName,
    tempSku,
    setTempSku,
    tempCategoryID,
    setTempCategoryID,
    tempStatus,
    setTempStatus,
    categories,
    handleApplyFilter,
    handleClearFilters,
}: ProductFilterSidebarProps) {
    return (
        <aside className="w-full lg:w-80 flex-shrink-0 mb-lg lg:mb-0">
            <div className="space-y-4 sticky top-28">
                <div className="bg-primary-container text-on-primary-container p-md rounded-lg shadow-sm">
                    <div className="flex items-center justify-between mb-md border-b border-on-primary-container/20 pb-sm">
                        <h2 className="font-headline-md text-headline-md text-on-primary">Bộ lọc</h2>
                        <span className="material-symbols-outlined text-on-primary">tune</span>
                    </div>

                    <div className="space-y-md">
                        {/* Tìm kiếm theo tên */}
                        <div>
                            <h3 className="font-label-caps text-label-caps text-on-primary-container/80 mb-sm uppercase">Tên sản phẩm</h3>
                            <input
                                type="text"
                                value={tempProductName}
                                onChange={(e) => setTempProductName(e.target.value)}
                                placeholder="Nhập tên sản phẩm..."
                                className="w-full px-3 py-2 rounded-md bg-white/80 text-black border border-on-primary-container/20 focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>

                        {/* Tìm kiếm theo SKU */}
                        <div>
                            <h3 className="font-label-caps text-label-caps text-on-primary-container/80 mb-sm uppercase">Mã SKU</h3>
                            <input
                                type="text"
                                value={tempSku}
                                onChange={(e) => setTempSku(e.target.value)}
                                placeholder="Nhập mã SKU..."
                                className="w-full px-3 py-2 rounded-md bg-white/80 text-black border border-on-primary-container/20 focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>

                        {/* Danh mục */}
                        <div>
                            <h3 className="font-label-caps text-label-caps text-on-primary-container/80 mb-sm uppercase">Danh mục</h3>
                            <select
                                value={tempCategoryID || ''}
                                onChange={(e) => setTempCategoryID(e.target.value ? Number(e.target.value) : undefined)}
                                className="w-full px-3 py-2 rounded-md bg-white/80 text-black border border-on-primary-container/20 focus:outline-none focus:ring-2 focus:ring-primary/50"
                            >
                                <option value="" className="text-black">Tất cả danh mục</option>
                                {categories.map((cat: any) => (
                                    <option key={cat.id} value={cat.id} className="text-black">{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Trạng thái - GỘP TẤT CẢ VÀO 1 NHÓM */}
                        <div>
                            <h3 className="font-label-caps text-label-caps text-on-primary-container/80 mb-sm uppercase pt-sm border-t border-on-primary-container/20">Trạng thái</h3>
                            <div className="space-y-2">
                                {[
                                    { value: 'Tất cả', label: 'Tất cả' },
                                    { value: 'Còn hàng', label: 'Còn hàng' },
                                    { value: 'Sắp hết', label: 'Sắp hết' },
                                    { value: 'Có ít nhất 1 biến thể hết hàng', label: 'Có ít nhất 1 biến thể hết hàng' },
                                    { value: 'Hết hàng toàn bộ sản phẩm', label: 'Hết hàng toàn bộ sản phẩm' },
                                    { value: 'Đã xóa', label: 'Đã xóa' },
                                ].map((s) => (
                                    <label key={s.value} className="flex items-center space-x-2 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="status"
                                            checked={tempStatus === s.value}
                                            onChange={() => setTempStatus(s.value)}
                                            className="form-radio h-4 w-4 text-primary"
                                        />
                                        <span className="font-body-sm text-body-sm text-on-primary">{s.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2 mt-md">
                        <Button onClick={handleApplyFilter} variant="primary" className="flex-1 justify-center">
                            Áp dụng lọc
                        </Button>
                        <Button onClick={handleClearFilters} variant="outline" className="flex-1 justify-center bg-white/80 text-on-primary border-on-primary/20 hover:bg-white">
                            Xóa
                        </Button>
                    </div>
                </div>

                <Link to="/products/new" className="block w-full">
                    <Button variant="primary" className="w-full justify-center" leftIcon={<span className="material-symbols-outlined text-[18px]">add</span>}>
                        Thêm sản phẩm
                    </Button>
                </Link>
            </div>
        </aside>
    );
}