import React from "react";

export const scriptAfter7Days = (
  <div className="space-y-4 text-sm text-gray-700 pb-4">
    <h3 className="text-lg font-bold text-gray-900 uppercase">
      Kịch bản gọi điện chăm sóc khách hàng sau mua hàng (Sau 7 ngày)
    </h3>

    <div>
      <h4 className="font-bold text-gray-900">Mục tiêu:</h4>
      <ul className="list-disc pl-5 mt-1 space-y-1">
        <li>Kiểm tra mức độ hài lòng của khách hàng về sản phẩm và dịch vụ.</li>
        <li>Hỗ trợ đổi size hoặc đổi trả nếu khách hàng gặp vấn đề.</li>
        <li>Tăng trải nghiệm khách hàng và khuyến khích mua hàng quay lại.</li>
      </ul>
    </div>

    <div>
      <h4 className="font-bold text-gray-900">Đối tượng gọi:</h4>
      <p>
        Khách hàng đã mua hàng thành công cách đây đúng <strong>07 ngày</strong>.
      </p>
    </div>

    <hr className="my-4 border-gray-200" />

    <div>
      <h4 className="text-md font-bold text-blue-700">1. Lời mở đầu (Chào hỏi & Xin phép)</h4>
      <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mt-2 rounded-r">
        <p>
          "Dạ em chào anh/chị <strong>[Tên_Khách_Hàng]</strong>, em là <strong>[Tên_Nhân_Viên]</strong> gọi đến từ thương hiệu thời trang <strong>Sapo Clothing</strong> ạ."
        </p>
        <p className="mt-2">
          "Không biết hiện tại anh/chị có tiện dành cho em khoảng <strong>1 phút</strong> để em hỏi thăm nhanh về sản phẩm mình đã mua được không ạ?"
        </p>
      </div>

      <h5 className="font-semibold text-gray-800 mt-4 mb-2">Nếu khách hàng bận</h5>
      <div className="bg-gray-50 border-l-4 border-gray-400 p-3 rounded-r">
        <p>
          "Dạ em hiểu rồi ạ. Em xin phép liên hệ lại với anh/chị vào <strong>[Thời_Gian_Hẹn]</strong> để không làm ảnh hưởng đến công việc của mình nhé."
        </p>
        <p className="mt-2">
          "Em cảm ơn anh/chị và chúc anh/chị một ngày thật nhiều niềm vui ạ."
        </p>
      </div>

      <div className="bg-amber-50 p-3 mt-3 rounded border border-amber-200 text-sm">
        <p className="font-semibold text-amber-800">Nhân viên cập nhật lịch sử chăm sóc:</p>
        <ul className="list-disc pl-5 mt-1 text-amber-900">
          <li>Kết quả: <strong>GỌI_LẠI</strong></li>
          <li>Ghi chú: Thời gian khách hẹn gọi lại.</li>
        </ul>
      </div>
    </div>

    <hr className="my-4 border-gray-200" />

    <div>
      <h4 className="text-md font-bold text-blue-700">2. Nội dung chính (Khảo sát mức độ hài lòng)</h4>
      <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mt-2 rounded-r">
        <p>
          "Dạ anh/chị <strong>[Tên_Khách_Hàng]</strong> ơi, khoảng một tuần trước mình có mua sản phẩm <strong>[Tên_Sản_Phẩm]</strong> tại Sapo Clothing."
        </p>
        <p className="mt-2">
          "Hôm nay em gọi để hỏi thăm xem mình sử dụng sản phẩm có vừa vặn, thoải mái và hài lòng về chất liệu cũng như kiểu dáng không ạ?"
        </p>
        <p className="mt-2">
          "Trong quá trình sử dụng, nếu sản phẩm cần đổi size hoặc gặp bất kỳ vấn đề nào thì bên em luôn sẵn sàng hỗ trợ mình."
        </p>
      </div>
    </div>

    <hr className="my-4 border-gray-200" />

    <div>
      <h4 className="text-md font-bold text-blue-700">3. Xử lý theo phản hồi của khách hàng</h4>

      <h5 className="font-semibold text-green-700 mt-4 mb-2">Trường hợp 1: Khách hàng hài lòng</h5>
      <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded-r">
        <p>
          "Dạ em rất vui khi biết anh/chị hài lòng với sản phẩm và dịch vụ của Sapo Clothing ạ."
        </p>
        <p className="mt-2">
          "Những chia sẻ tích cực của anh/chị là động lực để bên em tiếp tục nâng cao chất lượng sản phẩm và phục vụ khách hàng ngày càng tốt hơn."
        </p>
      </div>

      <div className="pl-4 border-l-2 border-gray-200 mt-3 ml-2">
        <h6 className="font-semibold text-gray-800 mb-2">Nếu khách hàng được cấp voucher:</h6>
        <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r">
          <p>
            "Để tri ân sự đồng hành của anh/chị, bên em xin gửi tặng riêng anh/chị mã giảm giá <strong>[Mã_Voucher]</strong> trị giá <strong>[Số_Tiền]%</strong> cho đơn hàng tiếp theo."
          </p>
          <p className="mt-2">
            "Mã ưu đãi có hiệu lực trong vòng <strong>30 ngày</strong> kể từ hôm nay và em sẽ gửi ngay cho mình qua <strong>SMS/Zalo</strong> sau cuộc gọi này ạ."
          </p>
        </div>

        <h6 className="font-semibold text-gray-800 mt-4 mb-2">Nếu khách hàng không được cấp voucher:</h6>
        <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r">
          <p>
            "Một lần nữa em xin cảm ơn anh/chị đã tin tưởng và ủng hộ Sapo Clothing. Hy vọng sẽ sớm được phục vụ anh/chị trong những lần mua sắm tiếp theo ạ."
          </p>
        </div>
      </div>

      <h5 className="font-semibold text-amber-700 mt-6 mb-2">Trường hợp 2: Khách hàng cần đổi size</h5>
      <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded-r">
        <p>
          "Dạ em rất tiếc vì sản phẩm hiện tại chưa phù hợp với mình ạ."
        </p>
        <p className="mt-2">
          "Anh/chị yên tâm, bên em sẽ hỗ trợ đổi size theo chính sách của cửa hàng."
        </p>
        <p className="mt-2">
          "Em xin phép kết bạn Zalo với số điện thoại này để hướng dẫn anh/chị các bước đổi hàng nhanh nhất và hoàn toàn miễn phí nếu đủ điều kiện nhé ạ."
        </p>
      </div>

      <h5 className="font-semibold text-rose-700 mt-6 mb-2">Trường hợp 3: Khách hàng phản ánh lỗi sản phẩm</h5>
      <div className="mb-2 text-gray-600 text-sm">
        <p>Ví dụ: Chất liệu không như mong đợi, đường may bị lỗi, sản phẩm bị rách, bẩn hoặc lỗi kỹ thuật.</p>
      </div>
      <div className="bg-rose-50 border-l-4 border-rose-500 p-3 rounded-r">
        <p>
          "Dạ em rất xin lỗi anh/chị vì trải nghiệm chưa được trọn vẹn này."
        </p>
        <p className="mt-2">
          "Bên em sẽ tiếp nhận phản hồi và chịu trách nhiệm xử lý theo chính sách của cửa hàng."
        </p>
        <p className="mt-2">
          "Em xin phép kết bạn Zalo với số điện thoại này để anh/chị gửi giúp em hình ảnh sản phẩm. Sau khi tiếp nhận, bên em sẽ hỗ trợ đổi sản phẩm mới hoặc hướng dẫn đổi trả trong thời gian sớm nhất."
        </p>
      </div>
    </div>

    <hr className="my-4 border-gray-200" />

    <div>
      <h4 className="text-md font-bold text-blue-700">4. Kết thúc cuộc gọi</h4>

      <h5 className="font-semibold text-gray-800 mt-4 mb-2">Nếu khách hàng hài lòng</h5>
      <div className="bg-gray-50 border-l-4 border-gray-400 p-3 rounded-r">
        <p>
          "Em cảm ơn anh/chị đã dành thời gian chia sẻ với Sapo Clothing."
        </p>
        <p className="mt-2">
          "Chúc anh/chị thật nhiều sức khỏe và mong sớm được phục vụ mình trong những lần mua sắm tiếp theo ạ."
        </p>
      </div>

      <h5 className="font-semibold text-gray-800 mt-4 mb-2">Nếu khách hàng đang được hỗ trợ đổi size/trả</h5>
      <div className="bg-gray-50 border-l-4 border-gray-400 p-3 rounded-r">
        <p>
          "Em cảm ơn anh/chị đã thông tin để bên em có cơ hội cải thiện dịch vụ."
        </p>
        <p className="mt-2">
          "Bên em sẽ theo sát và hỗ trợ anh/chị đến khi việc đổi hàng hoàn tất."
        </p>
        <p className="mt-2">
          "Chúc anh/chị một ngày thật nhiều niềm vui. Em xin phép kết thúc cuộc gọi ạ."
        </p>
      </div>
    </div>
  </div>
);

export const scriptAfter30Days = (
  <div className="space-y-4 text-sm text-gray-700 pb-4">
    <h3 className="text-lg font-bold text-amber-600 uppercase">
      📞 Kịch bản gọi điện tái kích hoạt khách hàng (Quá 30 ngày)
    </h3>

    <div>
      <h4 className="font-bold text-gray-900">Mục tiêu:</h4>
      <ul className="list-disc pl-5 mt-1 space-y-1">
        <li>Giới thiệu chương trình ưu đãi dành cho khách hàng lâu chưa quay lại mua sắm.</li>
        <li>Khuyến khích khách hàng phát sinh đơn hàng mới.</li>
        <li>Ghi nhận phản hồi để nâng cao chất lượng sản phẩm và dịch vụ.</li>
      </ul>
    </div>

    <div>
      <h4 className="font-bold text-gray-900">Đối tượng gọi:</h4>
      <p>
        Khách hàng đã hơn <strong>30 ngày</strong> chưa phát sinh thêm bất kỳ đơn hàng kể từ lần mua gần nhất.
      </p>
    </div>

    <hr className="my-4 border-gray-200" />

    <div>
      <h4 className="text-md font-bold text-amber-700">1. Lời mở đầu</h4>
      <div className="bg-amber-50 border-l-4 border-amber-500 p-3 mt-2 rounded-r">
        <p>
          "Dạ em chào anh/chị <strong>[Tên_Khách_Hàng]</strong>, em là <strong>[Tên_Nhân_Viên]</strong> gọi đến từ <strong>Sapo Clothing</strong> ạ."
        </p>
        <p className="mt-2">
          "Bên em thấy đã một thời gian anh/chị chưa quay lại mua sắm tại Sapo Clothing nên hôm nay em liên hệ để giới thiệu đến anh/chị chương trình ưu đãi tri áp dành riêng cho khách hàng thân thiết. Không biết hiện tại anh/chị có thể dành cho em khoảng 1 phút được không ạ?"
        </p>
      </div>

      <h5 className="font-semibold text-gray-800 mt-4 mb-2">Nếu khách hàng bận hoặc không có thời gian</h5>
      <div className="bg-gray-50 border-l-4 border-gray-400 p-3 rounded-r">
        <p>
          "Dạ em hiểu rồi ạ. Em xin phép gửi thông tin chương trình ưu đãi qua SMS/Zalo để khi nào thuận tiện anh/chị có thể tham khảo nhé."
        </p>
        <p className="mt-2">
          "Em cảm ơn anh/chị và chúc anh/chị một ngày thật nhiều niềm vui."
        </p>
      </div>
    </div>

    <hr className="my-4 border-gray-200" />

    <div>
      <h4 className="text-md font-bold text-amber-700">2. Giới thiệu chương trình và thăm dò nhu cầu</h4>
      <div className="bg-amber-50 border-l-4 border-amber-500 p-3 mt-2 rounded-r">
        <p>
          "Hiện tại Sapo Clothing đang có nhiều mẫu thời trang mới cùng các chương trình ưu đãi hấp dẫn dành cho khách hàng quay lại mua sắm."
        </p>
        <p className="mt-2">
          "Nhân tiện, em cũng muốn hỏi anh/chị một chút là thời gian vừa rồi mình chưa quay lại mua sắm là vì chưa có nhu cầu, chưa tìm được sản phẩm phù hợp hay bên em còn điều gì cần cải thiện không ạ?"
        </p>
      </div>

      <h5 className="font-semibold text-gray-800 mt-4 mb-2">Trường hợp 1: Khách hàng chia sẻ do bận hoặc chưa có nhu cầu</h5>
      <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r">
        <p>
          "Dạ em hiểu rồi ạ. Khi nào anh/chị có nhu cầu mua sắm, rất mong anh/chị sẽ tiếp tục ghé Sapo Clothing. Hiện bên em cũng thường xuyên cập nhật các mẫu mới và nhiều chương trình ưu đãi dành cho khách hàng."
        </p>
      </div>

      <h5 className="font-semibold text-gray-800 mt-4 mb-2">Trường hợp 2: Khách hàng góp ý về sản phẩm hoặc dịch vụ</h5>
      <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r">
        <p>
          "Dạ em cảm ơn anh/chị đã chia sẻ. Em xin ghi nhận toàn bộ ý kiến của mình để bên em xem xét và cải thiện chất lượng sản phẩm cũng như dịch vụ trong thời gian tới."
        </p>
      </div>

      <div className="bg-yellow-50 p-3 mt-3 rounded border border-yellow-200 text-sm">
        <p className="font-semibold text-yellow-800">
          Nhân viên ghi nhận nội dung phản hồi vào hệ thống để theo dõi và xử lý nếu cần.
        </p>
      </div>
    </div>

    <hr className="my-4 border-gray-200" />

    <div>
      <h4 className="text-md font-bold text-amber-700">3. Giới thiệu ưu đãi (Chỉ áp dụng với khách hàng được cấp voucher)</h4>
      <div className="bg-green-50 border-l-4 border-green-500 p-3 mt-2 rounded-r">
        <p>
          "Để tri ân sự đồng hành của anh/chị, Sapo Clothing xin gửi tặng anh/chị mã ưu đãi <strong>[Mã_Voucher]</strong> trị giá <strong>[Số_Tiền_Giảm]</strong> (hoặc <strong>[Phần_Trăm_Giảm]%</strong>) cho đơn hàng tiếp theo."
        </p>
        <p className="mt-2">
          "Mã ưu đãi có hiệu lực trong vòng <strong>07 ngày</strong> kể từ hôm nay. Em sẽ gửi mã qua SMS/Zalo ngay sau cuộc gọi để anh/chị thuận tiện sử dụng khi mua sắm."
        </p>
      </div>
    </div>

    <hr className="my-4 border-gray-200" />

    <div>
      <h4 className="text-md font-bold text-amber-700">4. Kết thúc cuộc gọi</h4>
      <div className="bg-gray-50 border-l-4 border-gray-400 p-3 mt-2 rounded-r">
        <p>
          "Em cảm ơn anh/chị đã dành thời gian lắng nghe và chia sẻ cùng Sapo Clothing."
        </p>
        <p className="mt-2">
          "Hy vọng sẽ sớm được đón tiếp anh/chị trong những lần mua sắm tiếp theo."
        </p>
        <p className="mt-2">
          "Chúc anh/chị thật nhiều sức khỏe và một ngày thật nhiều niềm vui. Em xin phép kết thúc cuộc gọi ạ."
        </p>
      </div>
    </div>
  </div>
);

export const scriptHappyBirthday = (
  <div className="space-y-4 text-sm text-gray-700 pb-4">
    <h3 className="text-lg font-bold text-purple-600 uppercase">
      📞 Kịch bản gọi điện chúc mừng sinh nhật khách hàng
    </h3>

    <div>
      <h4 className="font-bold text-gray-900">Mục tiêu:</h4>
      <ul className="list-disc pl-5 mt-1 space-y-1">
        <li>Gửi lời chúc mừng sinh nhật đến khách hàng.</li>
        <li>Thông báo ưu đãi sinh nhật dành riêng cho khách hàng.</li>
        <li>Khuyến khích khách hàng đến cửa hàng mua sắm trong tháng sinh nhật.</li>
      </ul>
    </div>

    <div>
      <h4 className="font-bold text-gray-900">Đối tượng gọi:</h4>
      <p>
        Khách hàng có <strong>tháng sinh nhật trùng với tháng hiện tại</strong> và được hệ thống cấp <strong>voucher sinh nhật</strong>.
      </p>
    </div>

    <hr className="my-4 border-gray-200" />

    <div>
      <h4 className="text-md font-bold text-purple-700">1. Lời mở đầu</h4>
      <div className="bg-purple-50 border-l-4 border-purple-500 p-3 mt-2 rounded-r">
        <p>
          "Dạ em chào anh/chị <strong>[Tên_Khách_Hàng]</strong>, em là <strong>[Tên_Nhân_Viên]</strong> gọi đến từ <strong>Sapo Clothing</strong> ạ."
        </p>
        <p className="mt-2">
          "Hệ thống bên em ghi nhận tháng này là tháng sinh nhật của anh/chị. Thay mặt toàn thể đội ngũ Sapo Clothing, em xin gửi đến anh/chị lời chúc mừng sinh nhật. Chúc anh/chị luôn mạnh khỏe, nhiều niềm vui, hạnh phúc và gặp thật nhiều may mắn trong cuộc sống ạ."
        </p>
      </div>

      <div className="bg-gray-50 p-3 mt-3 rounded border border-gray-200 text-sm italic">
        <p>Nếu khách hàng phản hồi và cảm ơn, chuyển sang bước 2.</p>
      </div>
    </div>

    <hr className="my-4 border-gray-200" />

    <div>
      <h4 className="text-md font-bold text-purple-700">2. Thông báo ưu đãi sinh nhật</h4>
      <div className="bg-fuchsia-50 border-l-4 border-fuchsia-500 p-3 mt-2 rounded-r">
        <p>
          "Nhân dịp sinh nhật của anh/chị, Sapo Clothing xin gửi tặng anh/chị một món quà nhỏ như lời cảm ơn vì đã luôn tin tưởng và đồng hành cùng cửa hàng."
        </p>
        <p className="mt-2">
          "Anh/chị được tặng <strong>mã ưu đãi sinh nhật [Mã_Voucher]</strong> với giá trị <strong>[Số_Tiền_Giảm]</strong> (hoặc <strong>[Phần_Trăm_Giảm]%</strong>) áp dụng cho đơn hàng mua sắm tại Sapo Clothing."
        </p>
        <p className="mt-2">
          "Mã ưu đãi có hiệu lực trong suốt <strong>tháng sinh nhật</strong> của anh/chị. Rất mong anh/chị ghé cửa hàng để lựa chọn những sản phẩm mình yêu thích và sử dụng ưu đãi này ạ."
        </p>
      </div>
    </div>

    <hr className="my-4 border-gray-200" />

    <div>
      <h4 className="text-md font-bold text-purple-700">3. Hướng dẫn sử dụng & Kết thúc cuộc gọi</h4>
      <div className="bg-purple-50 border-l-4 border-purple-500 p-3 mt-2 rounded-r">
        <p>
          "Em sẽ gửi thông tin mã ưu đãi qua SMS/Zalo ngay sau cuộc gọi để anh/chị tiện lưu lại."
        </p>
        <p className="mt-2">
          "Khi đến mua sắm tại cửa hàng, anh/chị chỉ cần cung cấp số điện thoại hoặc mã ưu đãi cho nhân viên để được áp dụng chương trình."
        </p>
        <p className="mt-2">
          "Một lần nữa, Sapo Clothing kính chúc anh/chị có một tháng sinh nhật thật nhiều niềm vui, sức khỏe và hạnh phúc."
        </p>
        <p className="mt-2">
          "Em cảm ơn anh/chị đã luôn đồng hành cùng Sapo Clothing. Hy vọng sẽ sớm được đón tiếp anh/chị tại cửa hàng. Em xin phép kết thúc cuộc gọi ạ."
        </p>
      </div>
    </div>
  </div>
);

export const scriptRecallSchedule = (
  <div className="space-y-4 text-sm text-gray-700 pb-4">
    <h3 className="text-lg font-bold text-rose-600 uppercase">
      📞 Kịch bản gọi điện - Khách hàng hẹn gọi lại
    </h3>

    <div>
      <h4 className="text-md font-bold text-rose-700">1. Khi gọi lại theo lịch hẹn</h4>
      <div className="bg-rose-50 border-l-4 border-rose-500 p-3 mt-2 rounded-r">
        <p>
          "Dạ em chào anh/chị <strong>[Tên_Khách_Hàng]</strong>, em là <strong>[Tên_Nhân_Viên]</strong> từ Sapo Clothing đây ạ."
        </p>
        <p className="mt-2">
          "Lúc nãy (hoặc hôm trước) em có gọi cho anh/chị nhưng mình đang bận, nên theo lịch hẹn em xin phép liên hệ lại vào thời điểm này. Không biết bây giờ anh/chị đã tiện nghe máy khoảng 1 phút chưa ạ?"
        </p>
      </div>

      <h5 className="font-semibold text-gray-800 mt-4 mb-2">Nếu khách đồng ý:</h5>
      <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded-r">
        <p>
          "Dạ em cảm ơn anh/chị. Em xin phép chia sẻ nhanh về thông tin/chương trình ưu đãi mà Sapo Clothing dành riêng cho mình ạ..." 
          <br/>
          <span className="text-gray-500 italic mt-1 inline-block">(Tiếp tục câu chuyện dựa theo lịch sử cần tư vấn trước đó)</span>
        </p>
      </div>

      <h5 className="font-semibold text-gray-800 mt-4 mb-2">Nếu khách vẫn bận:</h5>
      <div className="bg-gray-50 border-l-4 border-gray-400 p-3 rounded-r">
        <p>
          "Dạ em hiểu rồi ạ. Em xin phép gửi thông tin qua SMS/Zalo để anh/chị tiện theo dõi."
        </p>
        <p className="mt-2">
          "Khi nào cần hỗ trợ, anh/chị có thể liên hệ với Sapo Clothing bất cứ lúc nào ạ. Em cảm ơn anh/chị và chúc anh/chị một ngày thật nhiều niềm vui."
        </p>
      </div>
    </div>
  </div>
);
