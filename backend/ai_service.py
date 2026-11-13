"""
Module AI Service tích hợp Chiến lược Dual-LLM:
- Google AI Studio (Gemini): Đọc hiểu tài liệu lớn (PDF/Word), bóc tách A1/A2.
- Groq (GPT-OSS-120B / Qwen-3.8 / Llama): Tương tác tức thì (chuẩn hóa tên việc, viết giải trình, bóc tách dự phòng).
- Hỗ trợ Fallback chéo 2 chiều (Gemini <-> Groq) và tự động đọc lại .env kèm log chi tiết.
"""

import json
import traceback
from typing import List, Dict, Any, Optional
import httpx
from groq import Groq
from config import reload_settings


def _mask_key(key: str) -> str:
    if not key:
        return "EMPTY"
    if len(key) <= 10:
        return "***"
    return f"{key[:6]}...{key[-4:]}"


class AIService:
    # Danh sách model khả dụng theo thứ tự ưu tiên (Tự động thử model tiếp theo nếu model đầu bị 404/decommissioned)
    GROQ_MODELS = [
        "openai/gpt-oss-120b",
        "qwen/qwen3.8-27b",
        "openai/gpt-oss-20b",
        "llama-3.3-70b-versatile",
    ]
    GEMINI_MODELS = [
        "gemini-3.8-flash",
        "gemini-2.5-flash",
        "gemini-2.0-flash",
        "gemini-1.5-flash",
    ]

    def __init__(self, gemini_api_key: Optional[str] = None, groq_api_key: Optional[str] = None):
        # Luôn đọc mới lại file .env từ đĩa để nhận ngay khi user vừa sửa file .env mà chưa restart server
        current_settings = reload_settings()

        fe_gemini = (gemini_api_key or "").strip()
        fe_groq = (groq_api_key or "").strip()
        env_gemini = (current_settings.GEMINI_API_KEY or "").strip()
        env_groq = (current_settings.GROQ_API_KEY or "").strip()

        # Ưu tiên key từ Frontend; nếu FE không cung cấp thì fallback về cấu hình trong .env
        self.gemini_key = fe_gemini or env_gemini
        self.groq_key = fe_groq or env_groq
        self.gemini_source = "frontend" if fe_gemini else ("env" if env_gemini else "none")
        self.groq_source = "frontend" if fe_groq else ("env" if env_groq else "none")

        print(
            f"[AI-SERVICE INIT] Gemini: source={self.gemini_source} ({_mask_key(self.gemini_key)}) | "
            f"Groq: source={self.groq_source} ({_mask_key(self.groq_key)})",
            flush=True
        )

        # Setup Gemini (Dùng REST trực tiếp qua httpx với timeout chặt chẽ, tránh treo thread do google.generativeai retry 600s)
        self.gemini_model = self.GEMINI_MODELS[0] if self.gemini_key else None

        # Setup Groq (kèm timeout=25s để không bao giờ treo server)
        if self.groq_key:
            try:
                self.groq_client = Groq(api_key=self.groq_key, timeout=25.0, max_retries=1)
            except Exception as e:
                print(f"[AI-SERVICE ERROR] Khởi tạo Groq thất bại: {type(e).__name__}: {e}", flush=True)
                self.groq_client = None
        else:
            self.groq_client = None

    def _call_groq(self, messages: List[Dict[str, str]], temperature: float = 0.2, json_mode: bool = False) -> Optional[str]:
        """Gọi Groq với cơ chế tự động fallback qua các model khả dụng và in log rõ ràng."""
        if not self.groq_client:
            print("[AI-SERVICE GROQ] Bỏ qua vì chưa có Groq API Key.", flush=True)
            return None

        for model_name in self.GROQ_MODELS:
            try:
                print(f"[AI-SERVICE GROQ] Đang gọi model '{model_name}' (source={self.groq_source})...", flush=True)
                kwargs: Dict[str, Any] = {
                    "messages": messages,
                    "model": model_name,
                    "temperature": temperature,
                }
                if json_mode:
                    kwargs["response_format"] = {"type": "json_object"}

                chat = self.groq_client.chat.completions.create(**kwargs)
                content = chat.choices[0].message.content.strip()
                print(f"[AI-SERVICE GROQ] Thành công với model '{model_name}' ({len(content)} ký tự).", flush=True)
                return content
            except Exception as e:
                print(f"[AI-SERVICE GROQ ERROR] Model '{model_name}' lỗi: {type(e).__name__}: {e}", flush=True)
                continue

        return None

    def _call_gemini(self, prompt: str, json_mode: bool = False) -> Optional[str]:
        """Gọi Gemini REST API trực tiếp qua httpx (timeout 12s, không bao giờ bị treo vô hạn)."""
        if not self.gemini_key:
            print("[AI-SERVICE GEMINI] Bỏ qua vì chưa có Gemini API Key.", flush=True)
            return None

        for model_name in self.GEMINI_MODELS:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={self.gemini_key}"
            payload: Dict[str, Any] = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"temperature": 0.2}
            }
            if json_mode:
                payload["generationConfig"]["responseMimeType"] = "application/json"

            try:
                print(f"[AI-SERVICE GEMINI] Đang gọi model '{model_name}' (source={self.gemini_source}, timeout=12s)...", flush=True)
                with httpx.Client(timeout=12.0) as client:
                    resp = client.post(url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                    print(f"[AI-SERVICE GEMINI] Thành công với model '{model_name}' ({len(text)} ký tự).", flush=True)
                    return text
                else:
                    err_Preview = resp.text[:250].replace("\n", " ")
                    print(f"[AI-SERVICE GEMINI ERROR] Model '{model_name}' HTTP {resp.status_code}: {err_Preview}", flush=True)
                    # Nếu lỗi 400/401/403 do API_KEY_INVALID thì dừng ngay để chuyển sang Groq, không thử tiếp model Gemini khác
                    if resp.status_code in (400, 401, 403) and ("API_KEY_INVALID" in resp.text or "API key not valid" in resp.text or "PERMISSION_DENIED" in resp.text):
                        print("[AI-SERVICE GEMINI] Phát hiện Gemini API Key không hợp lệ -> Chuyển ngay sang Groq!", flush=True)
                        return None
            except Exception as e:
                print(f"[AI-SERVICE GEMINI ERROR] Model '{model_name}' lỗi kết nối/timeout: {type(e).__name__}: {e}", flush=True)
                continue

        return None

    def _prepare_multi_doc_context(self, doc_text: str, vtvl_title: str = "", max_chars: int = 16000) -> str:
        """
        Nén thông minh nhiều tài liệu lớn (ví dụ 274.000 ký tự) về đúng trọng tâm của VTVL đang chọn,
        đảm bảo mọi tài liệu đều có mặt và tốc độ phản hồi AI chỉ mất 2-4 giây (không vượt giới hạn Token/TPM).
        """
        if len(doc_text) <= max_chars:
            return doc_text

        parts = doc_text.split("=== TÀI LIỆU:")
        if len(parts) <= 1:
            return doc_text[:max_chars]

        header_part = parts[0]
        doc_chunks = ["=== TÀI LIỆU:" + p for p in parts[1:]]
        per_doc_budget = max(2500, (max_chars - len(header_part)) // len(doc_chunks))

        # Từ khóa ưu tiên theo tên VTVL để giữ lại các đoạn mô tả nhiệm vụ sát nhất
        keywords = [w.lower() for w in vtvl_title.replace(",", " ").replace("-", " ").split() if len(w) > 2]
        priority_terms = keywords + ["nhiệm vụ", "công việc", "tham mưu", "chủ trì", "báo cáo", "kế hoạch", "quyết định", "thẩm định"]

        trimmed_chunks = []
        for chunk in doc_chunks:
            if len(chunk) <= per_doc_budget:
                trimmed_chunks.append(chunk)
                continue
            lines = chunk.splitlines()
            title_line = lines[0] if lines else "=== TÀI LIỆU ==="
            body_lines = lines[1:]
            # Luôn giữ phần mở đầu của tài liệu (1/3 ngân sách) + các dòng chứa từ khóa liên quan VTVL (2/3 ngân sách)
            head_budget = per_doc_budget // 3
            head_text = "\n".join(body_lines)[:head_budget]
            rest_text = "\n".join(body_lines)[head_budget:]
            scored_paras = []
            for para in rest_text.split("\n"):
                p_clean = para.strip()
                if not p_clean:
                    continue
                p_low = p_clean.lower()
                score = sum(2 for kw in keywords if kw in p_low) + sum(1 for pt in priority_terms if pt in p_low)
                if score > 0:
                    scored_paras.append((score, p_clean))
            # Lấy các đoạn điểm cao nhất cho tới khi đủ ngân sách
            selected_paras = []
            used_len = len(title_line) + len(head_text) + 20
            for _, p_txt in sorted(scored_paras, key=lambda x: x[0], reverse=True):
                if used_len + len(p_txt) + 1 > per_doc_budget:
                    break
                selected_paras.append(p_txt)
                used_len += len(p_txt) + 1
            combined_doc = title_line + "\n" + head_text + ("\n" + "\n".join(selected_paras) if selected_paras else "")
            trimmed_chunks.append(combined_doc[:per_doc_budget])

        return header_part + "\n\n".join(trimmed_chunks)

    def parse_document_to_tasks(self, doc_text: str, vtvl_title: str) -> List[Dict[str, Any]]:
        """
        Dùng Gemini (hoặc fallback sang Groq) để đọc TỔNG HỢP NHIỀU TÀI LIỆU (Quy chế, Phân công,
        Bản mô tả QĐ 1096, Thống kê văn bản SPCV...) và đúc kết thành danh mục Nhiệm vụ (A1) + Công việc (A2) + Sản lượng (B1).
        """
        context_for_ai = self._prepare_multi_doc_context(doc_text, vtvl_title=vtvl_title, max_chars=16000)
        prompt = f"""
Bạn là chuyên gia thẩm định Đề án Vị trí việc làm tại Xã Hồ Vương - Tỉnh Thanh Hóa theo Hướng dẫn số 07-HD/BTCTW của Ban Tổ chức Trung ương và Quyết định số 1096-QĐ/TU của Ban Thường vụ Tỉnh ủy Thanh Hóa.
Hãy đọc kỹ TẤT CẢ các văn bản/tài liệu được cung cấp dưới đây (có thể bao gồm: Quy định chức năng nhiệm vụ, Quy chế làm việc, Thông báo phân công nhiệm vụ, Bản mô tả công việc QĐ 1096, và Bảng thống kê văn bản ban hành/văn bản đến) để ĐÚC KẾT, TỔNG HỢP danh sách các công việc cụ thể thuộc vị trí việc làm: "{vtvl_title}".

QUY TẮC BẮT BUỘC THEO HƯỚNG DẪN 07-HD/BTCTW:
1. Nhóm nhiệm vụ (task_group - Biểu A1): Gom các công việc liên quan vào đúng Nhiệm vụ khung (Ví dụ: "Tham mưu công tác xây dựng Đảng", "Công tác giám sát và phản biện xã hội", "Công tác văn phòng, tổng hợp và lưu trữ"...).
2. Tên công việc (job_name - Biểu A2): PHẢI bắt đầu bằng ĐỘNG TỪ HÀNH ĐỘNG + ĐỐI TƯỢNG XỬ LÝ (Ví dụ: "Soạn thảo tờ trình...", "Thẩm định hồ sơ...", "Tổng hợp báo cáo..."). Không trùng lặp giữa các tài liệu.
3. Mỗi công việc phải xác định rõ "product" (Sản phẩm đầu ra) và "unit" (Đơn vị tính: Văn bản, Báo cáo, Kế hoạch, Tờ trình, Hồ sơ, Cuộc, Hội nghị...).
4. Nếu trong tài liệu có bảng thống kê số lượng văn bản/hồ sơ thực tế (SPCV), hãy ước tính "suggested_quantity" (Số SP/năm sát thực tế); nếu không có số thống kê thì gợi ý sản lượng hợp lý theo năm (ví dụ 12, 24, 36, 50...).
5. Ghi rõ "source_doc" là tên văn bản/tài liệu làm căn cứ trích xuất công việc đó.

Trả về định dạng JSON thuần túy có cấu trúc:
{{
  "jobs": [
    {{
      "task_group": "Tên nhiệm vụ gốc (Biểu A1)",
      "job_name": "Tên công việc chuẩn công thức Động từ + Đối tượng (Biểu A2)",
      "product": "Tên sản phẩm đầu ra",
      "unit": "Đơn vị tính sản phẩm (Văn bản, Báo cáo, Kế hoạch, Hồ sơ...)",
      "suggested_quantity": 20,
      "suggested_minutes": 60,
      "source_doc": "Tên văn bản/tài liệu căn cứ",
      "quality": "Đúng quy định, bảo đảm chất lượng và tiến độ"
    }}
  ]
}}

Nội dung tổng hợp từ các tài liệu đầu vào:
{context_for_ai}
"""
        print(
            f"\n[AI-SERVICE] === BẮT ĐẦU ĐÚC KẾT TÀI LIỆU CHO VTVL: {vtvl_title} "
            f"(Gốc: {len(doc_text)} ký tự -> Nén trọng tâm: {len(context_for_ai)} ký tự) ===",
            flush=True
        )

        # 1. Thử gọi Gemini trước (nếu có key hợp lệ AIza...)
        raw_json = None
        if self.gemini_key and self.gemini_key.startswith("AIza"):
            raw_json = self._call_gemini(prompt, json_mode=True)
        elif self.gemini_key:
            print(f"[AI-SERVICE GEMINI] Key '{_mask_key(self.gemini_key)}' không bắt đầu bằng 'AIza' -> Chuyển thẳng sang Groq siêu tốc!", flush=True)

        # 2. Nếu Gemini lỗi hoặc chưa có key chuẩn AIza, gọi Groq (openai/gpt-oss-120b)
        if not raw_json:
            print("[AI-SERVICE] Đang dùng Groq để đúc kết danh mục công việc từ bộ tài liệu...", flush=True)
            raw_json = self._call_groq(
                messages=[
                    {"role": "system", "content": "Bạn là chuyên gia thẩm định Đề án VTVL. Chỉ trả về JSON hợp lệ chứa khóa 'jobs'."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.2,
                json_mode=True
            )

        if raw_json:
            try:
                parsed = json.loads(raw_json)
                if isinstance(parsed, list):
                    print(f"[AI-SERVICE] Đã bóc tách thành công {len(parsed)} công việc.", flush=True)
                    return parsed
                if isinstance(parsed, dict) and "jobs" in parsed and isinstance(parsed["jobs"], list):
                    print(f"[AI-SERVICE] Đã bóc tách thành công {len(parsed['jobs'])} công việc.", flush=True)
                    return parsed["jobs"]
            except Exception as e:
                print(f"[AI-SERVICE JSON PARSE ERROR] Không đọc được JSON bóc tách: {e}\nRaw: {raw_json[:300]}", flush=True)

        print("[AI-SERVICE WARNING] Cả Gemini và Groq đều không khả dụng -> Trả về danh mục mẫu mặc định.", flush=True)
        return [
            {
                "job_name": f"Soạn thảo tờ trình tham mưu công tác thuộc {vtvl_title}",
                "product": "Tờ trình kèm dự thảo quyết định",
                "unit": "Tờ trình",
                "suggested_minutes": 90,
                "quality": "Đạt chuẩn thể thức"
            },
            {
                "job_name": f"Tổng hợp và xây dựng báo cáo định kỳ tháng/quý của {vtvl_title}",
                "product": "Báo cáo tổng hợp số liệu",
                "unit": "Báo cáo",
                "suggested_minutes": 150,
                "quality": "Đúng hạn, đầy đủ số liệu"
            },
            {
                "job_name": "Thẩm định và xử lý hồ sơ nghiệp vụ chuyên môn",
                "product": "Hồ sơ đã kiểm tra, phiếu thẩm định",
                "unit": "Hồ sơ",
                "suggested_minutes": 45,
                "quality": "Chính xác, không sai sót"
            }
        ]

    def format_task_name_fast(self, raw_input: str) -> Dict[str, str]:
        """
        Dùng Groq (siêu nhanh < 0.5s) để chuẩn hóa tên việc người dùng gõ tay
        thành cú pháp [Động từ] + [Đối tượng] + [Sản phẩm]
        """
        prompt = f"""
Chuẩn hóa tên công việc hành chính sau đây về đúng thể thức: [Động từ hành động] + [Đối tượng xử lý].
Đồng thời chỉ ra Sản phẩm đầu ra và Đơn vị tính.
Nội dung người dùng nhập: "{raw_input}"

Trả về JSON duy nhất:
{{
  "job_name": "Tên công việc chuẩn",
  "product": "Sản phẩm đầu ra",
  "unit": "Đơn vị tính"
}}
"""
        print(f"\n[AI-SERVICE] === CHUẨN HÓA TÊN CÔNG VIỆC: '{raw_input}' ===", flush=True)

        raw_json = self._call_groq(
            messages=[
                {"role": "system", "content": "You are a professional Vietnamese administrative workflow assistant. Output ONLY valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            json_mode=True
        )

        if not raw_json:
            raw_json = self._call_gemini(prompt, json_mode=True)

        if raw_json:
            try:
                return json.loads(raw_json)
            except Exception as e:
                print(f"[AI-SERVICE JSON PARSE ERROR] {e}", flush=True)

        return {
            "job_name": raw_input.strip(),
            "product": "Sản phẩm hoàn thành",
            "unit": "Văn bản"
        }

    def generate_justification(self, vtvl_title: str, fte: float, assigned: int, reason_category: str = "Địa bàn") -> str:
        """
        Tự động tạo câu văn giải trình chuẩn thể thức hành chính khi bố trí biên chế khác số quy đổi.
        Ưu tiên dùng Groq phản hồi tức thì.
        """
        prompt = f"""
Viết 1 đoạn văn giải trình ngắn (2-3 câu) chuẩn thể thức văn bản của Đảng và Nhà nước Việt Nam để gửi cơ quan thẩm định Đề án Vị trí việc làm:
- Vị trí việc làm: {vtvl_title}
- Số người quy đổi theo khối lượng thời gian (FTE): {fte} người
- Số người đề xuất bố trí thực tế: {assigned} người
- Nhóm lý do: {reason_category} (theo tiêu chí phân nhóm Phụ lục IV Hướng dẫn 07-HD/BTCTW).
Giọng văn khách quan, thuyết phục, bám sát yêu cầu nhiệm vụ chính trị và đặc thù địa bàn.
Chỉ trả về đoạn văn bản, không thêm lời chào.
"""
        print(
            f"\n[AI-SERVICE] === SINH GIẢI TRÌNH HÀNH CHÍNH: VTVL='{vtvl_title}', FTE={fte}, Bố trí={assigned} ===",
            flush=True
        )

        # Nếu cả 2 key đều rỗng (do server khởi tạo lúc .env còn trống), tự động nạp lại .env
        if not self.groq_client and not self.gemini_model:
            print("[AI-SERVICE] Phát hiện chưa có client AI, đang thử đọc lại file .env...", flush=True)
            self.__init__()

        res_text = self._call_groq(
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            json_mode=False
        )
        if res_text:
            return res_text

        res_text = self._call_gemini(prompt, json_mode=False)
        if res_text:
            return res_text

        print("[AI-SERVICE WARNING] Cả Groq và Gemini đều lỗi -> Trả về câu giải trình mẫu fallback.", flush=True)
        return (
            f"Căn cứ đặc thù khối lượng công việc thực tế, địa bàn quản lý rộng và các nhiệm vụ đột xuất phát sinh trong kỳ, "
            f"đơn vị đề xuất bố trí {assigned} người tại vị trí {vtvl_title} nhằm bảo đảm hoàn thành tốt nhiệm vụ được giao theo quy định."
        )
