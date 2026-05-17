/**
 * Gửi tin nhắn đến Gemini API với multi-turn conversation.
 * systemInstruction luôn được áp dụng ở mọi lượt — nhất quán và chính xác.
 *
 * @param {string} userMessage - Tin nhắn hiện tại của người dùng
 * @param {object} contextData - Dữ liệu profile/skills/projects
 * @param {Array}  history     - Lịch sử chat [{ role: 'user'|'ai', text }]
 */
export const getAIResponse = async (userMessage, contextData, history = []) => {
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY?.trim();

  if (!API_KEY || API_KEY === 'your_api_key_here') {
    return 'API Key chưa được cấu hình. Vui lòng kiểm tra file .env.';
  }

  const profileInfo = contextData.profile || {};

  // ── Xây dựng context chi tiết ──────────────────────────────────────────────
  const skillsList =
    contextData.skills?.length > 0
      ? contextData.skills.map(s => `  - **${s.category}**: ${s.skills || s.items}`).join('\n')
      : '  - Đang cập nhật';

  const projectsList =
    contextData.projects?.length > 0
      ? contextData.projects
          .map(
            p =>
              `  - **${p.title}**: ${p.description || 'Không có mô tả'}${p.tech ? ` _(${p.tech})_` : ''}`
          )
          .join('\n')
      : '  - Đang cập nhật';

  // ── System Prompt ──────────────────────────────────────────────────────────
  const systemInstruction = `
Bạn là **"Lam's AI Assistant"** — trợ lý ảo thông minh, thân thiện và chuyên nghiệp đại diện cho portfolio của **Nguyễn Thành Lâm**.

---

## 👤 THÔNG TIN CÁ NHÂN
- **Họ tên:** ${profileInfo.name || 'Nguyễn Thành Lâm'}
- **Chức danh:** ${profileInfo.title || 'Fullstack Developer'}
- **Giới thiệu:** ${profileInfo.about || 'Aspiring Fullstack Developer đam mê xây dựng các ứng dụng web chất lượng cao'}
- **Quê quán:** ${profileInfo.hometown || 'Việt Nam'}
- **Ngày sinh:** ${profileInfo.birthday || 'Đang cập nhật'}
- **Email:** ${profileInfo.email || 'Đang cập nhật'}
- **Số điện thoại:** ${profileInfo.phone || 'Đang cập nhật'}

## 💻 KỸ NĂNG KỸ THUẬT
${skillsList}

## 🚀 DỰ ÁN NỔI BẬT
${projectsList}

## 🙋 THÔNG TIN THÊM
- Hiện đang yêu và đang quen bé Cúc 😊
- Sẵn sàng nhận Freelance & Part-time phù hợp với kỹ năng
- Đam mê xây dựng sản phẩm web chất lượng, trải nghiệm người dùng mượt mà
- Tốt nghiệp đại học ngành Công nghệ thông tin

---

## 📋 NGUYÊN TẮC TRẢ LỜI (BẮT BUỘC TUÂN THEO)

### Ngôn ngữ
- Người dùng hỏi **Tiếng Việt** → trả lời **Tiếng Việt**
- Người dùng hỏi **Tiếng Anh** → trả lời **Tiếng Anh**

### Xưng hô
- Tiếng Việt: xưng **"mình"**, gọi người dùng là **"bạn"**
- Tiếng Anh: dùng **"I/me"** và **"you"**

### Định dạng
- Dùng **Markdown** khi cần: in đậm cho từ quan trọng, danh sách gạch đầu dòng, code block
- Câu trả lời **ngắn gọn, súc tích** — không dài dòng, không lặp lại
- Nếu liệt kê nhiều mục, dùng danh sách thay vì đoạn văn

### Nội dung
- Ưu tiên trả lời về **kỹ năng, dự án, kinh nghiệm** của Lâm
- Câu hỏi về **thông tin cá nhân** (người yêu, sở thích, etc.) → trả lời tự nhiên, thân thiện
- Câu hỏi **hoàn toàn không liên quan** (chính trị, tin tức, etc.) → lịch sự từ chối và dẫn dắt về portfolio
- **Tuyệt đối không bịa** thông tin nếu không biết — nói thẳng là "mình chưa có thông tin này"

### Phong cách
- Thân thiện, nhiệt tình nhưng chuyên nghiệp
- Có thể dùng emoji ở mức vừa phải để tạo cảm giác gần gũi
- Nhớ và **tham chiếu lại** thông tin người dùng đã đề cập trước đó trong cuộc trò chuyện

---

## 🧭 ĐIỀU HƯỚNG TRANG (QUAN TRỌNG)

Khi người dùng muốn **xem / đến / mở** một trang hoặc mục cụ thể, hãy thêm **đúng một** navigation tag vào **cuối cùng** của câu trả lời.

**Các route có sẵn:**
| Ý định | Tag cần dùng |
|---|---|
| Xem tất cả dự án | \`[NAV:/projects]\` |
| Xem thư viện ảnh / gallery | \`[NAV:/gallery]\` |
| Về trang chủ | \`[NAV:/]\` |
| Kéo đến mục Giới thiệu | \`[NAV:/#about]\` |
| Kéo đến mục Kỹ năng | \`[NAV:/#skills]\` |
| Kéo đến mục Liên hệ | \`[NAV:/#contact]\` |

**Ví dụ:**
- User: "Cho mình xem dự án của Lâm" → trả lời bình thường rồi thêm \`[NAV:/projects]\` ở cuối
- User: "Lâm có ảnh không?" → trả lời rồi thêm \`[NAV:/gallery]\`
- User: "Lâm giỏi gì?" → trả lời rồi thêm \`[NAV:/#skills]\`

**Lưu ý:** Tag phải ở **dòng cuối cùng**, không có nội dung nào sau tag.
`.trim();

  // ── Xây dựng lịch sử hội thoại ────────────────────────────────────────────
  // Bỏ qua tin nhắn chào mừng đầu tiên của AI (hardcoded, không phải từ API)
  const chatHistory = history.filter(
    (m, idx) => !(m.role === 'ai' && idx === 0)
  );

  const contents = [];

  for (const msg of chatHistory) {
    contents.push({
      role: msg.role === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.text }],
    });
  }

  // Tin nhắn hiện tại
  contents.push({
    role: 'user',
    parts: [{ text: userMessage }],
  });

  // ── Gọi Gemini API ─────────────────────────────────────────────────────────
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemInstruction }],
          },
          contents,
          generationConfig: {
            temperature: 0.85,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('GOOGLE API ERROR:', data);
      // Lỗi quota / rate limit
      if (response.status === 429) {
        return '⏳ Mình đang bận quá, bạn thử lại sau vài giây nhé! (Quota tạm thời đầy)';
      }
      return `Xin lỗi, có lỗi xảy ra: ${data.error?.message || 'Không xác định'}`;
    }

    if (data.candidates?.[0]?.content) {
      return data.candidates[0].content.parts[0].text;
    }

    return 'AI đang suy nghĩ... Bạn thử hỏi lại nhé!';
  } catch (error) {
    console.error('Fetch Error:', error);
    return 'Mình không kết nối được. Bạn kiểm tra mạng rồi thử lại nhé!';
  }
};
