(() => {
  const toggle = document.getElementById('chatbot-toggle');
  const panel = document.getElementById('chatbot-panel');
  const closeButton = document.getElementById('chatbot-close');
  const form = document.getElementById('chatbot-form');
  const input = document.getElementById('chatbot-input');
  const messages = document.getElementById('chatbot-messages');
  const quickReplies = document.getElementById('chatbot-quick-replies');
  const cta = document.getElementById('chatbot-cta');

  if (!toggle || !panel || !closeButton || !form || !input || !messages || !quickReplies || !cta) {
    return;
  }

  const normalize = (value) => value
    .toLocaleLowerCase('vi')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const includesAny = (text, keywords) => keywords.some((keyword) => text.includes(keyword));

  const replies = [
    {
      keywords: ['gia', 'bao nhieu', '99k', '249k', '379k'],
      answer: 'Hiện có 3 mức dễ chọn:\n• 1 chậu Khởi Đầu: 99.000đ.\n• 3 chậu Trải Nghiệm: 249.000đ.\n• 5 chậu Phủ Xanh: 379.000đ.\n\nBạn muốn thử nhẹ hay làm một góc xanh rõ hơn?',
      showCta: true,
      ctaLabel: 'Xem form chọn combo'
    },
    {
      keywords: ['phu hop', 'chon combo', 'chon loai nao', '1 3 5', 'ban nho', 'may chau'],
      answer: 'Bàn rất nhỏ hoặc muốn thử trước thì chọn 1 chậu. Muốn một góc xanh nhỏ mà bàn vẫn thoáng thì chọn 3 chậu. Muốn mảng xanh nhìn rõ hơn trên bàn hoặc kệ thì chọn 5 chậu.\n\nBạn đang định đặt cây ở bàn làm việc hay một chiếc kệ?',
      showCta: true,
      ctaLabel: 'Nhờ vườn gợi ý combo'
    },
    {
      keywords: ['tung lam cay chet', 'cay chet', 'de cham', 'cham cay', 'tuoi', 'ban ron', 'quen tuoi'],
      answer: 'Không sao, mình bắt đầu lại nhẹ thôi 🌱 Một chậu sẽ ít áp lực hơn. Sen đá không cần tưới mỗi ngày; lịch tưới còn tùy ánh sáng, đất, chậu và độ ẩm. Bạn cho vườn biết vị trí đặt cây để được hướng dẫn sát hơn nhé.',
      showCta: false
    },
    {
      keywords: ['gom gi', 'co gi', 'phu kien', 'binh tuoi', 'dat trong'],
      answer: 'Khởi Đầu có 1 cây + chậu gốm. Trải Nghiệm có 3 cây + phụ kiện + đất. Phủ Xanh có 5 cây + phụ kiện + đất + bình tưới. Giống cây, màu chậu và phụ kiện cụ thể sẽ được vườn xác nhận theo tồn kho.',
      showCta: true,
      ctaLabel: 'Để lại lựa chọn của bạn'
    },
    {
      keywords: ['chon giong', 'loai cay', 'mau chau', 'chon mau', 'mau nao'],
      answer: 'Mình chưa muốn hứa khi chưa xem tồn kho. Bạn để lại sở thích trong form nhé, vườn sẽ xác nhận giống cây và màu chậu đang có trước khi chốt.',
      showCta: true,
      ctaLabel: 'Gửi sở thích cho vườn'
    },
    {
      keywords: ['giao hang', 'ship', 'bao hanh', 'doi cay', 'doi 1 1', 'toan quoc'],
      answer: 'Website hiện giới thiệu giao toàn quốc và đổi 1–1 trong 7 ngày. Điều kiện còn tùy khu vực và tình trạng cây, nên bạn để lại thông tin để vườn xác nhận rõ trước khi chốt nhé.',
      showCta: true,
      ctaLabel: 'Kiểm tra giao hàng'
    },
    {
      keywords: ['re hon', 'dat qua', 'mac', 'ben kia', 'cay le'],
      answer: 'Đúng là cây lẻ có nơi rẻ hơn. Giá ở đây dành cho combo đã phối theo góc bàn, có chậu và các phần đi kèm; bạn không phải tự chọn rồi ghép từng món.',
      showCta: false
    },
    {
      keywords: ['nghi them', 'de toi nghi', 'de minh nghi', 'chua san sang', 'xem them'],
      answer: 'Được chứ, cây cối không cần chọn vội. Bạn cứ lưu lại website. Nếu muốn, để lại thông tin và góc định đặt cây; khi sẵn sàng vườn sẽ gợi ý combo vừa đủ, không ép mua.',
      showCta: true,
      ctaLabel: 'Để lại góc cần tư vấn'
    },
    {
      keywords: ['muon mua', 'dat hang', 'chot', 'mua ngay', 'quan tam', 'dang ky'],
      answer: 'Nghe như mình đã tìm được hướng khá vừa với góc của bạn rồi đó. Bạn bấm nút bên dưới, để lại tên và Zalo; vườn sẽ xác nhận tồn kho, phần đi kèm và giao hàng trước khi chốt nhé.',
      showCta: true,
      ctaLabel: 'Chọn combo phù hợp'
    },
    {
      keywords: ['trong phong', 'ban lam viec', 'phong ngu', 'anh sang', 'dat o dau', 'vi tri'],
      answer: 'Các combo được làm cho bàn làm việc và phòng nhỏ. Nhưng góc quá tối sẽ không hợp. Bạn ghi vị trí định đặt cây trong form để vườn xem giúp nhé.',
      showCta: true,
      ctaLabel: 'Gửi vị trí đặt cây'
    },
    {
      keywords: ['xin chao', 'chao', 'hello', 'hi'],
      answer: 'Chào bạn 🌿 Bạn muốn hỏi về giá, cách chọn 1–3–5 chậu hay cách chăm cây trước?',
      showCta: false
    }
  ];

  const fallback = {
    answer: 'Mình chưa bắt đúng ý bạn. Bạn thử hỏi về giá, cách chọn 1–3–5 chậu, cách chăm hoặc giao hàng nhé. Nếu câu hỏi cần xem tồn kho, bạn để lại thông tin để vườn trả lời chính xác hơn.',
    showCta: true,
    ctaLabel: 'Nhờ vườn trả lời'
  };

  const findReply = (question) => {
    const normalizedQuestion = normalize(question);
    return replies.find((reply) => includesAny(normalizedQuestion, reply.keywords)) || fallback;
  };

  const addMessage = (text, sender) => {
    const message = document.createElement('div');
    message.className = `chat-message chat-message-${sender}`;
    message.textContent = text;
    messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight;
  };

  const setCta = (reply) => {
    if (!reply.showCta) {
      cta.hidden = true;
      return;
    }

    cta.querySelector('span').textContent = reply.ctaLabel || 'Chọn combo phù hợp';
    cta.hidden = false;
  };

  const answerQuestion = (question) => {
    const cleanQuestion = question.trim();
    if (!cleanQuestion) {
      return;
    }

    addMessage(cleanQuestion, 'user');
    input.value = '';

    const reply = findReply(cleanQuestion);
    window.setTimeout(() => {
      addMessage(reply.answer, 'bot');
      setCta(reply);
    }, 220);
  };

  const openChat = () => {
    panel.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    toggle.querySelector('span').textContent = 'Đang tư vấn';
    window.setTimeout(() => input.focus(), 0);
  };

  const closeChat = () => {
    panel.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.querySelector('span').textContent = 'Hỏi Vườn Sen Đá';
    toggle.focus();
  };

  toggle.addEventListener('click', () => {
    if (panel.hidden) {
      openChat();
    } else {
      closeChat();
    }
  });

  closeButton.addEventListener('click', closeChat);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    answerQuestion(input.value);
  });

  quickReplies.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-question]');
    if (button) {
      answerQuestion(button.dataset.question);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !panel.hidden) {
      closeChat();
    }
  });

  cta.addEventListener('click', () => {
    panel.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.querySelector('span').textContent = 'Hỏi Vườn Sen Đá';
  });
})();
