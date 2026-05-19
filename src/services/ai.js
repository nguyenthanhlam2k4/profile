/**
 * Chế độ trả lời Offline thông minh (Smart Offline Mode)
 * Tự động phản hồi bằng ngôn ngữ tự nhiên cực kỳ mượt mà, định dạng Markdown đẹp mắt
 * khi toàn bộ các API Key của Gemini bị cạn kiệt Quota hoặc gặp sự cố mạng/limit 0.
 */
const normalizeText = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove Vietnamese accents
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, '') // remove punctuation
    .replace(/\s+/g, ' ')
    .trim();
};

const getLocalAIResponse = (userMessage, contextData, history = []) => {
  const msg = userMessage.toLowerCase().trim();
  const normMsg = normalizeText(userMessage);

  // 0.1. Xử lý các câu hỏi tiếp nối (follow-up/confirmation) dựa trên lịch sử hội thoại trước đó
  const lastAiMsg = history.slice().reverse().find(m => m.role === 'ai')?.text || '';
  const confirmKeywords = [
    "phai khong", "dung khong", "that khong", "that a", "tin duoc khong", 
    "that chu", "co that khong", "phai ko", "dung ko", "that ha",
    "chac chua", "chac khong", "chac ko"
  ];
  if (confirmKeywords.some(kw => normMsg.includes(kw))) {
    if (lastAiMsg.includes("Cúc") || lastAiMsg.includes("người yêu")) {
      return `Thật chứ bạn! Hai bạn trẻ đang quen nhau rất hạnh phúc và nghiêm túc đó nha. 🥰`;
    }
    if (lastAiMsg.includes("dự án") || lastAiMsg.includes("Project")) {
      return `Đúng vậy bạn, toàn bộ các dự án này đều là dự án thực tế do Lâm thiết kế và tự code đó!`;
    }
    if (lastAiMsg.includes("kỹ năng") || lastAiMsg.includes("Skills")) {
      return `Chắc chắn rồi, Lâm đã có kinh nghiệm làm việc thực tế với các công nghệ này nên bạn cứ yên tâm nhé!`;
    }
    return `Đúng vậy bạn! Mình cam đoan thông tin này hoàn toàn chính xác nhé. 😉`;
  }

  // 0. Đối chiếu và trả lời từ bộ Q&A đã huấn luyện (aiKb) trước
  if (contextData.aiKb && contextData.aiKb.length > 0) {
    for (const item of contextData.aiKb) {
      const normQ = normalizeText(item.question);
      if (normMsg.includes(normQ) || normQ.includes(normMsg)) {
        return item.answer;
      }
      
      // So khớp tương đối qua tỷ lệ từ trùng khớp (70% trở lên)
      const wordsMsg = normMsg.split(' ').filter(w => w.length > 1);
      const wordsQ = normQ.split(' ').filter(w => w.length > 1);
      if (wordsMsg.length > 0 && wordsQ.length > 0) {
        const intersection = wordsMsg.filter(w => wordsQ.includes(w));
        const score = intersection.length / Math.min(wordsMsg.length, wordsQ.length);
        if (score >= 0.7) {
          return item.answer;
        }
      }
    }
  }

  const profile = contextData.profile || {};
  const name = profile.name || "Nguyễn Thành Lâm";
  const title = profile.title || "Fullstack Developer";
  const email = profile.email || "nguyenthanhlam2k4@gmail.com";
  const phone = profile.phone || "Đang cập nhật";
  const hometown = profile.hometown || "Việt Nam";
  const birthday = profile.birthday || "Đang cập nhật";
  const about = profile.about || "Đam mê xây dựng ứng dụng web chất lượng cao.";

  // 1. Chào hỏi
  if (msg.includes("chào") || msg.includes("hi") || msg.includes("hello") || msg.includes("xin chào")) {
    return `Chào bạn! Mình là **Lam's AI Assistant** 🤖. Rất vui được trò chuyện với bạn!\n\nHôm nay mình có thể giúp gì cho bạn? Bạn có thể hỏi về các dự án kỹ thuật, kỹ năng chuyên môn hoặc thông tin liên hệ của Lâm nhé! 😊`;
  }

  // 2. Người yêu (Bé Cúc)
  if (msg.includes("người yêu") || msg.includes("yêu ai") || msg.includes("cúc") || msg.includes("yêu đương")) {
    return `À, bật mí với bạn một thông tin vô cùng ngọt ngào: Lâm hiện đang yêu và quen bé **Cúc** cực kỳ hạnh phúc luôn nhé! 🥰💕`;
  }

  // 3. Dự án (Projects)
  if (msg.includes("dự án") || msg.includes("project") || msg.includes("sản phẩm") || msg.includes("kinh nghiệm") || msg.includes("làm được gì")) {
    let resp = `### 🚀 Các dự án nổi bật của ${name}:\n\n`;
    if (contextData.projects && contextData.projects.length > 0) {
      contextData.projects.forEach(p => {
        resp += `*   **${p.title}**\n`;
        if (p.description) resp += `    - *Mô tả:* ${p.description}\n`;
        if (p.tech) resp += `    - *Công nghệ sử dụng:* \`${p.tech}\`\n`;
        resp += `\n`;
      });
    } else {
      resp += `Lâm đã tham gia phát triển nhiều dự án Web App và Mobile App sử dụng React, Node.js và Firebase. Bạn có thể nhấn vào mục Dự án trên thanh menu để xem chi tiết nhé!\n\n`;
    }
    resp += `\n[NAV:/projects]`;
    return resp;
  }

  // 4. Kỹ năng (Skills)
  if (msg.includes("kỹ năng") || msg.includes("skills") || msg.includes("giỏi gì") || msg.includes("học gì") || msg.includes("công nghệ")) {
    let resp = `### 💻 Kỹ năng kỹ thuật của ${name}:\n\n`;
    if (contextData.skills && contextData.skills.length > 0) {
      contextData.skills.forEach(s => {
        resp += `*   **${s.category}**: ${s.skills || s.items}\n`;
      });
    } else {
      resp += `*   **Frontend:** ReactJS, HTML5, CSS3, Tailwind CSS, Javascript.\n`;
      resp += `*   **Backend & DB:** NodeJS, ExpressJS, Firebase Firestore, MongoDB, MySQL.\n`;
      resp += `*   **Công cụ:** Git, VS Code, Cloudinary.\n`;
    }
    resp += `\nLâm luôn không ngừng học hỏi để làm chủ các công nghệ mới nhất!\n\n[NAV:/#skills]`;
    return resp;
  }

  // 5. Liên hệ (Contact)
  if (msg.includes("liên hệ") || msg.includes("contact") || msg.includes("gmail") || msg.includes("email") || msg.includes("sđt") || msg.includes("số điện thoại") || msg.includes("phone")) {
    return `### 📞 Thông tin liên hệ của ${name}:\n\n*   **Email:** [${email}](mailto:${email})\n*   **Số điện thoại:** ${phone}\n*   **Quê quán:** ${hometown}\n*   **Ngày sinh:** ${birthday}\n\nBạn có thể nhắn tin trực tiếp cho Lâm qua form Liên hệ ở cuối trang chủ hoặc gửi mail cho Lâm nhé! Hoặc mình sẽ kéo bạn xuống mục liên hệ ngay đây:\n\n[NAV:/#contact]`;
  }

  // 6. Giới thiệu bản thân (About)
  if (msg.includes("giới thiệu") || msg.includes("about") || msg.includes("là ai") || msg.includes("thông tin") || msg.includes("tiểu sử")) {
    return `### 👤 Giới thiệu về ${name}:\n\n*   **Chức danh:** ${title}\n*   **Giới thiệu bản thân:** ${about}\n*   **Quê quán:** ${hometown}\n*   **Ngày sinh:** ${birthday}\n\nLâm là một lập trình viên tràn đầy nhiệt huyết, luôn đam mê xây dựng các sản phẩm web tối ưu về cả hiệu năng lẫn trải nghiệm người dùng.\n\n[NAV:/#about]`;
  }

  // 7. Mở rộng / Hỗ trợ chung (Trả về cờ chưa trả lời được để tự động lưu)
  return `Hiện tại Lâm chưa cập nhật thông tin này, mình đã ghi lại để gửi cho Lâm trả lời nhé! [UNANSWERED]`;
};

/**
 * Gửi tin nhắn đến Gemini API với cơ chế xoay vòng.
 * Nếu tất cả khóa đều thất bại, tự động chuyển đổi sang Offline Smart Mode.
 */
export const getAIResponse = async (userMessage, contextData, history = []) => {
  // Lấy tất cả các API Key có sẵn để thực hiện cơ chế xoay vòng (Key Rotation)
  const API_KEYS = [
    import.meta.env.VITE_GEMINI_API_KEY?.trim(),
    import.meta.env.VITE_GEMINI_API_KEY_2?.trim(),
    import.meta.env.VITE_GEMINI_API_KEY_3?.trim()
  ].filter(k => k && k !== 'your_api_key_here' && k !== '');

  if (API_KEYS.length === 0) {
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

  const kbList =
    contextData.aiKb?.length > 0
      ? contextData.aiKb.map(k => `- **Câu hỏi:** ${k.question}\n  **Trả lời:** ${k.answer}`).join('\n')
      : '  - Chưa có dữ liệu Q&A.';

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

## 📚 BỘ CÂU HỎI & TRẢ LỜI ĐƯỢC HUẤN LUYỆN
${kbList}

## 🙋 THÔNG TIN THÊM
- Hiện đang yêu và đang quen bé Cúc 😊
- Sẵn sàng nhận Freelance & Part-time phù hợp với kỹ năng
- Đam mê xây dựng sản phẩm web chất lượng, trải nghiệm người dùng mượt mà
- Tốt nghiệp đại học ngành Công nghệ thông tin
${profileInfo.aiPrompt ? `\n## 🧠 HƯỚNG DẪN HUẤN LUYỆN BỔ SUNG (ADMIN CỦA LÂM CẤU HÌNH)\n${profileInfo.aiPrompt}\n` : ''}
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
- Kiểm tra kỹ danh sách **BỘ CÂU HỎI & TRẢ LỜI ĐƯỢC HUẤN LUYỆN** để trả lời chính xác các câu hỏi FAQ.
- Câu hỏi về **thông tin cá nhân** (người yêu, sở thích, etc.) → trả lời tự nhiên, thân thiện
- Câu hỏi **hoàn toàn không liên quan** (chính trị, tin tức, etc.) → lịch sự từ chối và dẫn dắt về portfolio
- **Tuyệt đối không tự bịa** thông tin nếu không có dữ liệu. Nếu người dùng hỏi điều gì đó về Lâm mà bạn không tìm thấy trong ngữ cảnh cá nhân, kỹ năng, dự án hoặc bộ câu hỏi Q&A trên, hãy trả lời lịch sự là chưa biết và **BẮT BUỘC** thêm tag \`[UNANSWERED]\` ở cuối cùng câu trả lời. Ví dụ: "Hiện tại Lâm chưa cập nhật thông tin này, mình đã ghi lại để gửi cho Lâm nhé! [UNANSWERED]"

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
  // ── Gọi Gemini API với cơ chế xoay vòng khóa (Key Rotation) và Model dự phòng (Fallback Chain) ──
  const models = [
    'gemini-flash-latest'
  ];

  let lastError = null;
  let succeeded = false;
  let finalResponseText = '';

  // Thử lần lượt từng API Key được cấu hình
  for (let keyIdx = 0; keyIdx < API_KEYS.length; keyIdx++) {
    const currentKey = API_KEYS[keyIdx];
    
    // Với mỗi API Key, thử lần lượt các Model từ tốt nhất đến dự phòng
    for (const model of models) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${currentKey}`,
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

        if (response.ok) {
          if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
            finalResponseText = data.candidates[0].content.parts[0].text;
            console.log(`%c[AI Service] Succeeded using model: ${model} (Key #${keyIdx + 1})`, "color: #10B981; font-weight: bold;");
            succeeded = true;
            break;
          }
        } else {
          console.warn(`[Key #${keyIdx + 1}] Model ${model} failed (Status ${response.status}):`, data);
          lastError = data.error?.message || 'Lỗi không xác định';
          
          // Nếu là lỗi Quota 429, bỏ qua để thử model khác hoặc xoay vòng key khác
          if (response.status === 429) {
            continue;
          }
        }
      } catch (err) {
        console.error(`[Key #${keyIdx + 1}] Error fetching Gemini with model ${model}:`, err);
        lastError = err.message;
      }
    }

    // Nếu đã thành công lấy được câu trả lời từ bất kỳ model nào của Key hiện tại, dừng vòng lặp xoay vòng khóa
    if (succeeded) break;
  }

  if (!succeeded) {
    console.warn("Live Gemini API failed (exhausted or limit 0). Switching seamlessly to Smart Offline Responder Mode.", lastError);
    return getLocalAIResponse(userMessage, contextData, history);
  }
  return finalResponseText;
};
