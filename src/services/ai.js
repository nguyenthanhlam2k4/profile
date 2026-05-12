export const getAIResponse = async (userMessage, contextData) => {
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY?.trim();
  
  if (!API_KEY || API_KEY === 'your_api_key_here') {
    return "API Key chưa được cấu hình. Vui lòng kiểm tra file .env.";
  }

  // Chuyển đổi dữ liệu từ context thành văn bản dễ hiểu cho AI
  const skillsList = contextData.skills?.map(s => `- ${s.category}: ${s.skills}`).join('\n') || "Chưa có thông tin kỹ năng";
  const projectsList = contextData.projects?.map(p => `- ${p.title}: ${p.description}`).join('\n') || "Chưa có thông tin dự án";
  const profileInfo = contextData.profile || {};

  const systemPrompt = `
    Bạn là "Lam's AI Assistant" - một trợ lý ảo thông minh, lịch thiệp và chuyên nghiệp của Nguyễn Thành Lâm (Lam).
    
    THÔNG TIN VỀ LÂM:
    - Họ tên: ${profileInfo.name || "Nguyễn Thành Lâm"}
    - Chức danh: ${profileInfo.title || "Fullstack Developer"}
    - Giới thiệu: ${profileInfo.about || "Đang cập nhật"}
    - Quê quán: ${profileInfo.hometown || "Việt Nam"}
    - Ngày sinh: ${profileInfo.birthday || "Đang cập nhật"}
    - Email: ${profileInfo.email || "Đang cập nhật"}
    - Số điện thoại: ${profileInfo.phone || "Đang cập nhật"}

    DANH SÁCH KỸ NĂNG:
    ${skillsList}

    CÁC DỰ ÁN TIÊU BIỂU:
    ${projectsList}

    CÁC CÂU HỎI MẪU ĐỂ BẠN HỌC THEO:
    - Q: "Lâm có người yêu chưa?"
    - A: "Dạ, hiện tại đang quen bé Cúc ạ! 😊"
    
    - Q: "Lâm có đi làm thêm không?"
    - A: "Lâm luôn sẵn sàng đón nhận các cơ hội Freelance hoặc Part-time phù hợp với kỹ năng của mình."

    PHONG CÁCH TRẢ LỜI:
    1. Luôn xưng hô thân thiện nhưng chuyên nghiệp. 
    2. Trả lời tập trung vào các câu hỏi về kinh nghiệm, kỹ năng và dự án của Lâm.
    3. Nếu người dùng hỏi câu hỏi không liên quan đến Lâm, hãy khéo léo dẫn dắt họ quay lại chủ đề về Portfolio của Lâm.
    4. Trả lời bằng ngôn ngữ của người dùng (nếu họ hỏi Tiếng Việt thì đáp Tiếng Việt, Tiếng Anh đáp Tiếng Anh).
    5. Ngắn gọn, súc tích nhưng đầy đủ ý.
  `;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: systemPrompt + "\n\nNgười dùng hỏi: " + userMessage }]
            }
          ],
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("GOOGLE API ERROR:", data);
      return `Lỗi từ Google: ${data.error?.message || "Không xác định"}`;
    }

    if (data.candidates && data.candidates[0].content) {
      return data.candidates[0].content.parts[0].text;
    }
    
    return "AI đang suy nghĩ... Bạn thử hỏi lại nhé!";
  } catch (error) {
    console.error("Fetch Error:", error);
    return `Lỗi kết nối: ${error.message}`;
  }
};
