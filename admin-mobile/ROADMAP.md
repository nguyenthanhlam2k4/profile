# 🚀 LỘ TRÌNH PHÁT TRIỂN NTL ADMIN MOBILE APP

Tài liệu này lưu trữ danh sách các tính năng xịn xò được đề xuất nâng cấp cho ứng dụng quản trị di động **NTL Admin App**. Các tính năng được xếp theo thứ tự ưu tiên từ dễ đến khó, từ thiết thực nhất đến nâng cao.

---

## 🔥 Nhóm 1: Ưu tiên cao (Dễ làm, Giá trị cực cao)
*Các tính năng giúp nâng cao trực tiếp hiệu quả quản trị và hiển thị số liệu.*

- [ ] **1.1. Biểu đồ Analytics trực quan (Charts)**
  - Tích hợp biểu đồ hình cột hoặc hình đường (`react-native-chart-kit`) trong Dashboard.
  - Hiển thị trực quan lượt xem theo ngày/tuần/tháng thay vì chỉ hiển thị một con số thô.
- [ ] **1.2. Trả lời Email trực tiếp từ App**
  - Bấm vào một tin nhắn liên hệ từ khách hàng.
  - Nhập nội dung phản hồi trực tiếp trên App và nhấn gửi. Hệ thống sẽ tự động kích hoạt API gửi email phản hồi tới khách hàng.
- [ ] **1.3. Kéo thả sắp xếp thứ tự dự án (Draggable List)**
  - Sử dụng danh sách kéo thả (`react-native-draggable-flatlist`) để thay đổi thứ tự sắp xếp của các Dự án (Projects) và Kỹ năng (Skills).
  - Thứ tự kéo thả trên điện thoại sẽ cập nhật ngay lập tức lên giao diện Website của bạn.
- [ ] **1.4. Xem trước Website (In-app WebView)**
  - Thêm một nút "Xem Website" ngay tại trang Dashboard.
  - Khi bấm vào sẽ mở một trang trình duyệt nhúng mượt mà ngay trong App để kiểm tra giao diện website thực tế mà không cần thoát App.
- [ ] **1.5. Chế độ Sáng/Tối (Light/Dark Mode)**
  - Cho phép tùy chọn chuyển đổi giao diện sáng tối với hiệu ứng transition nhẹ nhàng.

---

## 💎 Nhóm 2: Ưu tiên trung bình (Trải nghiệm Premium)
*Các tính năng tập trung vào tối ưu hóa trải nghiệm người dùng, giúp App mượt mà, "đã" tay như các app chuyên nghiệp.*

- [ ] **2.1. Phản hồi xúc giác (Haptic Feedback)**
  - Tạo các rung động siêu nhẹ (haptic vibration) của iPhone khi người dùng chạm vào các nút bấm, khi lưu dữ liệu hoặc khi xóa thành công.
- [ ] **2.2. Tìm kiếm thông minh toàn cục (Global Search)**
  - Tích hợp ô tìm kiếm ngay trên thanh điều hướng đầu App.
  - Cho phép gõ tìm nhanh mọi thứ: tên dự án, tag dự án, tên khách hàng gửi tin nhắn, nội dung tin nhắn.
- [ ] **2.3. Vuốt để xóa (Swipe to Delete)**
  - Thay vì bấm nút xóa truyền thống, người dùng có thể vuốt nhẹ một tin nhắn hoặc một bức ảnh sang trái để hiện nút xóa nhanh (tương tự như iMessage hoặc Zalo).
- [ ] **2.4. Công cụ cắt ảnh trước khi tải lên (Image Crop)**
  - Tích hợp thư viện cắt ảnh trước khi upload lên Cloudinary.
  - Đảm bảo các ảnh dự án luôn đúng tỷ lệ chuẩn, không bị méo hay quá khổ.
- [ ] **2.5. Xóa hàng loạt (Bulk Delete)**
  - Tính năng chọn nhiều ảnh trong Gallery hoặc nhiều Tin nhắn cùng lúc để xóa nhanh chỉ bằng một lần bấm.

---

## 🛸 Nhóm 3: Nâng cao (Công nghệ hiện đại & Khác biệt)
*Các tính năng khai thác sâu phần cứng của thiết bị và hệ điều hành iOS.*

- [ ] **3.1. Đăng nhập bằng vân tay/khuôn mặt (FaceID / TouchID)**
  - Tích hợp `expo-local-authentication`.
  - Chỉ cần quét FaceID để mở khóa truy cập nhanh vào App Quản trị mà không cần nhập mật khẩu.
- [ ] **3.2. Widget ngoài màn hình chính (iOS Home Screen Widget)**
  - Tạo một ô Widget nhỏ xinh hiển thị số lượt xem Website trực tiếp ngay trên màn hình chính của iPhone. (Yêu cầu build app dạng EAS Build gốc).
- [ ] **3.3. Đặt lịch đăng ảnh tự động (Scheduled Post)**
  - Cho phép chọn trước ảnh Locket và cài đặt ngày giờ hiển thị. Đúng giờ hẹn, ảnh mới tự động xuất hiện trên website.
- [ ] **3.4. Xuất báo cáo PDF chuyên nghiệp**
  - Tạo và xuất file PDF báo cáo thống kê lượt tương tác, lượt xem và tin nhắn theo định kỳ tháng để lưu trữ.

---

*💡 **Mẹo:** Bạn có thể đánh dấu `[x]` vào các ô trống phía trên mỗi khi hoàn thành xong một tính năng để theo dõi tiến độ phát triển dự án.*
