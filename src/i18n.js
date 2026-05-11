import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "nav": {
        "about": "About",
        "skills": "Skills",
        "projects": "Projects",
        "contact": "Contact",
        "dashboard": "Dashboard",
        "cv": "Download CV"
      },
      "hero": {
        "hi": "Hi, my name is",
        "name": "Nguyen Thanh Lam",
        "build": "I build things for the web.",
        "cta": "Check out my work!"
      },
      "about": {
        "title": "About Me",
        "technologies": "Here are a few technologies I've been working with recently:",
        "hometown": "Hometown",
        "education": "Education",
        "birthday": "Date of Birth",
        "phone": "Phone"
      },
      "gallery": {
        "title": "Gallery",
        "view_all": "View All",
        "back": "Back to Home",
        "sort_newest": "Newest",
        "sort_oldest": "Oldest",
        "filter_date": "Filter by Date",
        "no_images": "No images found."
      },
      "skills": {
        "title": "Technical Skills"
      },
      "projects": {
        "title": "Some Things I've Built",
        "featured": "Featured Project"
      },
      "contact": {
        "next": "What's Next?",
        "title": "Get In Touch",
        "button": "Say Hello"
      },
      "admin": {
        "title": "Admin CMS",
        "dashboard": "Dashboard",
        "projects": "Projects Manager",
        "skills": "Skills Manager",
        "messages": "Messages",
        "profile": "Profile Manager",
        "logout": "Logout",
        "save": "Save Changes",
        "saving": "Saving...",
        "add": "Add New",
        "edit": "Edit",
        "delete": "Delete",
        "cancel": "Cancel",
        "actions": "Actions",
        "status": "Status",
        "image": "Image",
        "upload": "Upload",
        "uploading": "Uploading...",
        "no_image": "No Image",
        "name": "Full Name",
        "pro_title": "Professional Title",
        "about": "About Me",
        "email": "Email Address",
        "phone": "Phone Number",
        "links": "Social Links",
        "cv_url": "CV Link (PDF/Drive)",
        "hometown": "Hometown",
        "education": "Education",
        "total_projects": "Total Projects",
        "total_skills": "Total Skills",
        "profile_views": "Profile Views",
        "recent_activity": "Recent Activity",
        "welcome_back": "Welcome back! Everything looks good.",
        "quick_actions": "Quick Actions",
        "view_live": "View Live Site",
        "refresh_stats": "Refresh Stats",
        "platform": "Platform",
        "url": "URL",
        "order": "Order",
        "project_title": "Project Title",
        "tech_stack": "Tech Stack",
        "description": "Description",
        "demo_link": "Demo Link",
        "github_link": "GitHub Link",
        "status_published": "Published",
        "status_inprogress": "In Progress",
        "category_name": "Category Name",
        "skill_list": "Skill List",
        "birthday": "Date of Birth",
        "no_data": "No data available."
      }
    }
  },
  vi: {
    translation: {
      "nav": {
        "about": "Giới thiệu",
        "skills": "Kỹ năng",
        "projects": "Dự án",
        "contact": "Liên hệ",
        "dashboard": "Bảng điều khiển",
        "cv": "Tải CV"
      },
      "hero": {
        "hi": "Xin chào, tôi là",
        "name": "Nguyễn Thành Lâm",
        "build": "Tôi xây dựng những thứ tuyệt vời cho web.",
        "cta": "Xem các dự án của tôi!"
      },
      "about": {
        "title": "Về tôi",
        "technologies": "Dưới đây là một số công nghệ tôi đã làm việc gần đây:",
        "hometown": "Quê quán",
        "education": "Học vấn",
        "birthday": "Ngày sinh",
        "phone": "Số điện thoại"
      },
      "gallery": {
        "title": "Bộ sưu tập",
        "view_all": "Xem tất cả",
        "back": "Quay lại trang chủ",
        "sort_newest": "Mới nhất",
        "sort_oldest": "Cũ nhất",
        "filter_date": "Lọc theo ngày",
        "no_images": "Không tìm thấy ảnh nào."
      },
      "skills": {
        "title": "Kỹ năng chuyên môn"
      },
      "projects": {
        "title": "Những dự án tiêu biểu",
        "featured": "Dự án tiêu biểu"
      },
      "contact": {
        "next": "Tiếp theo là gì?",
        "title": "Liên hệ với tôi",
        "button": "Gửi lời chào"
      },
      "admin": {
        "title": "Quản trị CMS",
        "dashboard": "Bảng điều khiển",
        "projects": "Quản lý Dự án",
        "skills": "Quản lý Kỹ năng",
        "messages": "Tin nhắn",
        "profile": "Quản lý Hồ sơ",
        "logout": "Đăng xuất",
        "save": "Lưu thay đổi",
        "saving": "Đang lưu...",
        "add": "Thêm mới",
        "edit": "Chỉnh sửa",
        "delete": "Xóa",
        "cancel": "Hủy",
        "actions": "Thao tác",
        "status": "Trạng thái",
        "image": "Hình ảnh",
        "upload": "Tải ảnh lên",
        "uploading": "Đang tải...",
        "no_image": "Chưa có ảnh",
        "name": "Họ và tên",
        "pro_title": "Tiêu đề chuyên môn",
        "about": "Giới thiệu bản thân",
        "email": "Địa chỉ Email",
        "phone": "Số điện thoại",
        "links": "Liên kết mạng xã hội",
        "cv_url": "Đường dẫn CV (PDF/Drive)",
        "hometown": "Quê quán",
        "education": "Học vấn",
        "total_projects": "Tổng dự án",
        "total_skills": "Tổng kỹ năng",
        "profile_views": "Lượt xem hồ sơ",
        "recent_activity": "Hoạt động gần đây",
        "welcome_back": "Chào mừng trở lại! Mọi thứ đều ổn với danh mục đầu tư của bạn.",
        "quick_actions": "Thao tác nhanh",
        "view_live": "Xem trang chủ",
        "refresh_stats": "Làm mới thống kê",
        "platform": "Nền tảng",
        "url": "Đường dẫn (URL)",
        "order": "Thứ tự",
        "gallery": "Bộ sưu tập ảnh",
        "upload_gallery": "Thêm ảnh vào bộ sưu tập",
        "save_success": "Đã lưu thay đổi thành công!",
        "save_failed": "Lưu thất bại, vui lòng thử lại.",
        "delete_confirm": "Bạn có chắc chắn muốn xóa không?",
        "delete_success": "Đã xóa thành công!",
        "delete_failed": "Xóa thất bại.",
        "project_title": "Tiêu đề dự án",
        "tech_stack": "Công nghệ sử dụng",
        "description": "Mô tả chi tiết",
        "demo_link": "Link Demo",
        "github_link": "Link GitHub",
        "status_published": "Công khai",
        "status_inprogress": "Đang thực hiện",
        "category_name": "Tên danh mục",
        "skill_list": "Danh sách kỹ năng (cách nhau bởi dấu phẩy)",
        "birthday": "Ngày tháng năm sinh",
        "no_data": "Chưa có dữ liệu nào được thêm."
      }
    }
  }
}
;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Đặt tiếng Anh làm mặc định
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
