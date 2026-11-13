# HƯỚNG DẪN SỬ DỤNG HỆ THỐNG TRỢ LÝ ĐỀ ÁN VỊ TRÍ VIỆC LÀM (2027-2031)
*(Xây dựng Đề án và Xác định Nhu cầu Biên chế theo Hướng dẫn số 07-HD/BTCTW & 06-HD/BTCTW của Ban Tổ chức Trung ương)*

---

## ⚡ 1. KHỞI ĐỘNG NHANH (1 BƯỚC DUY NHẤT)

Bạn không cần mở terminal, không cần cài đặt phức tạp, không cần chạy riêng lẻ backend và frontend:

👉 **Chỉ cần nhấp đúp chuột (Double Click) vào file:**
```
KHOI_DONG_VTVL.bat
```
*(File nằm ngay tại thư mục chính `d:\Download\Mej\`)*

Hệ thống sẽ tự động:
1. Kích hoạt Máy chủ ứng dụng hợp nhất (cổng `8000`).
2. Tự động bật trình duyệt web tại địa chỉ: **`http://127.0.0.1:8000/`**.
3. Khi làm xong, bạn chỉ cần **đóng cửa sổ màn hình đen (Command Prompt)** để tắt ứng dụng.

---

## 🖥️ 2. QUY TRÌNH SỬ DỤNG QUA 4 CHẶNG WIZARD

Giao diện được thiết kế dạng **"Cầm tay chỉ việc"**, phần Header phía trên luôn đứng yên cố định giúp bạn dễ dàng theo dõi tiến độ.

```
[Chặng 1: Bóc tách] ➔ [Chặng 2: Khai báo] ➔ [Chặng 3: Tính toán] ➔ [Chặng 4: Thẩm định & Xuất]
```

---

### 📍 CHẶNG 1: BÓC TÁCH NHIỆM VỤ & CÔNG VIỆC (BIỂU A1, A2)

* **Mục tiêu:** Xác định danh mục công việc chuẩn công thức: `[Động từ hành động]` + `[Đối tượng xử lý]` + `[Sản phẩm đầu ra]`.
* **Cách thực hiện:**
  1. **Chọn Khối cơ quan (ở góc trên thanh tiêu đề):**
     * Chọn *Khối Đảng / Đoàn thể* $\rightarrow$ Đích nộp là **Ban Tổ chức Tỉnh ủy / Huyện ủy**.
     * Chọn *Khối Hành chính Nhà nước* $\rightarrow$ Đích nộp là **Sở Nội vụ / Phòng Nội vụ**.
  2. **Chọn Vị trí việc làm (VTVL):** Chọn từ danh mục mẫu (*Văn phòng - Thống kê, Địa chính - Xây dựng, Tài chính - Kế toán...*) hoặc gõ tên cơ quan của bạn.
  3. **Nạp văn bản:** Bấm nút **"Tải file Word/PDF"** để tải lên Quyết định chức năng nhiệm vụ hoặc Đề án cũ của cơ quan (hoặc dán trực tiếp đoạn văn bản vào ô trống).
  4. **AI Hỗ trợ:** Bấm nút **"AI Bóc tách (Gemini)"**. Trong 3-5 giây, AI sẽ phân rã thành danh sách các Thẻ công việc hoàn chỉnh.
  5. **Tùy chỉnh của người dùng:**
     * Tích chọn $(\checkmark)$ những việc phòng/đơn vị mình thực tế có làm.
     * Bấm icon **Bút chì** để sửa nhanh câu từ cho đúng tên gọi địa phương.
     * Bấm nút **"+ Thêm việc thủ công"** nếu muốn tự bổ sung công việc phát sinh.
  6. Bấm **"Tiếp tục sang Chặng 2"**.

---

### 📍 CHẶNG 2: KHAI BÁO SẢN LƯỢNG (B1) & TÁC ĐỘNG CẢI CÁCH (B2)

* **Mục tiêu:** Đo lường khối lượng thực tế kỳ chuẩn (**01/10/2025 đến 30/09/2026**) và giờ tiết kiệm được nhờ chuyển đổi số.
* **Cách thực hiện:**
  * Mỗi công việc chỉ cần điền **2 ô số liệu duy nhất**:
    1. **Sản lượng (SP/năm):** Số lượng hồ sơ, báo cáo, tờ trình thực tế phát sinh trong năm.
    2. **Thời gian thực (Phút/SP):** Số phút lao động trực tiếp của bạn để làm xong 1 sản phẩm.
  * **Cơ chế bảo vệ chống sai sót nghiệp vụ:**
    * Nếu bạn nhập $> 480$ phút (tương đương 1 ngày làm việc 8 tiếng): Hệ thống sẽ hiện cảnh báo màu vàng để nhắc bạn: *"Không được điền thời hạn chờ ký duyệt TTHC (ví dụ 3 ngày) vào đây, chỉ tính giờ làm việc trực tiếp của riêng bạn"*.
  * **Khai báo Chuyển đổi số (Biểu B2):**
    * Tích chọn ô **"Có áp dụng CĐS / phần mềm"** $\rightarrow$ Hệ thống mở rộng 2 ô: *Thời gian trước cải cách* và *Thời gian sau cải cách*.
    * Hệ thống tự động tính ra số giờ tiết kiệm được để giảm trừ biên chế một cách minh bạch.
  * Bấm **"Tiếp tục sang Chặng 3"**.

---

### 📍 CHẶNG 3: TÍNH TOÁN BIÊN CHẾ & NHÂN LỰC (BIỂU C3, D1, D2)

* **Mục tiêu:** Hệ thống tính toán định mức và hỗ trợ bố trí nhân lực, chống quá tải giờ.
* **Bảng điều khiển 3 Tầng (Dashboard):**
  * **Tầng 1 (Tổng giờ ròng):** Tổng số giờ làm việc thực tế cả năm sau khi đã trừ đi phần tiết kiệm do chuyển đổi số.
  * **Tầng 2 (Số người quy đổi FTE):** Công thức chuẩn Hướng dẫn 07:
    $$\text{FTE} = \frac{\text{Tổng giờ ròng}}{1.904\text{ giờ}}$$
    *(Hệ thống giữ nguyên 3 chữ số thập phân, tuyệt đối không tự ý làm tròn lên).*
  * **Tầng 3 (Đề xuất số người bố trí thực tế):** Bạn chọn số nguyên ($1$ người, $2$ người...).
* **Trợ lý giải trình hành chính (Groq AI):**
  * Nếu số người đề xuất khác với số quy đổi (Ví dụ: quy đổi ra 1.2 người nhưng đề xuất bố trí 2 người): Bấm nút **"Gợi ý giải trình hành chính (Groq AI)"**.
  * AI sẽ tự động sinh ngay 1 đoạn văn bản thuyết minh chuẩn thể thức của Đảng/Nhà nước căn cứ theo đặc thù phân nhóm địa bàn tại Phụ lục IV.
* **Rà soát biểu D1 (Bảo vệ cá nhân không bị quá tải):**
  * Theo dõi cán bộ hiện có: Nếu tổng giờ làm việc $> 1.904$ giờ/năm, thanh đo sẽ báo đỏ **QUÁ TẢI**, nhắc nhở bạn điều chuyển bớt việc kiêm nhiệm.
  * Bấm **"Tiếp tục sang Chặng 4"**.

---

### 📍 CHẶNG 4: THẨM ĐỊNH 13 LỖI & XUẤT FILE PHÔI GỐC CỦA BTCTW

* **Mục tiêu:** Quét sạch toàn bộ 13 lỗi nghiệp vụ phổ biến và xuất file Excel chuẩn nộp cấp trên.
* **Cách thực hiện:**
  1. Bấm **"Quét lại hồ sơ"**: Hệ thống sẽ rà soát tự động qua 13 tiêu chí (ô trống, thời gian bất thường, vượt trần 1.904h, thiếu giải trình, sai kỳ chốt...).
  2. Nếu có lỗi: Hệ thống hiện khung màu đỏ hướng dẫn cụ thể dòng nào sai và cách sửa.
  3. Khi kết quả báo **HỢP LỆ (0 LỖI)**:
     * Bấm nút màu xanh: **"Tải Về File Excel Đề Án Chuẩn"**.
  4. File tải về sẽ có tên chuẩn:
     $$\mathbf{De\_An\_VTVL\_2027\_2031\_[Ten\_Co\_Quan].xlsx}$$
     *Dữ liệu được bơm trực tiếp vào template gốc [03. Bo bieu VTVL 19-10-2026.xlsx](file:///d:/Download/Mej/07-HDVTVL/03.%20Bo%20bieu%20VTVL%2019-10-2026.xlsx), bảo toàn nguyên vẹn mọi công thức ô xám, conditional formatting và macro của Ban Tổ chức Trung ương.*

---

## ⚙️ 3. CẤU HÌNH AI (GEMINI & GROQ)

Ở góc trên bên phải màn hình có nút **"Cấu hình AI (Gemini & Groq)"**:
* **Gemini API Key:** Dành cho bóc tách tài liệu dài hàng chục trang (Lấy key miễn phí tại [Google AI Studio](https://aistudio.google.com/)).
* **Groq API Key (Tùy chọn):** Dành cho phản hồi tức thì dưới 0.5 giây khi chuẩn hóa câu từ và viết thuyết minh (Lấy key tại [Groq Console](https://console.groq.com/)).
* *Lưu ý:* Nếu bạn chưa nhập API Key, ứng dụng vẫn vận hành trơn tru ở chế độ **Thủ công (Manual)** và có sẵn kho dữ liệu mẫu để bạn thực hành ngay lập tức.

---

## ❓ 4. CÂU HỎI THƯỜNG GẶP (FAQ)

1. **Tôi có bị mất dữ liệu khi tắt trình duyệt không?**
   * Không. Dữ liệu làm việc được tự động lưu tạm trên trình duyệt máy tính của bạn.
2. **Tôi có thể nộp trực tiếp file Excel vừa xuất cho cơ quan thẩm định không?**
   * Có. File xuất ra được ghi đè trực tiếp vào đúng file phôi chính thức của Ban Tổ chức Trung ương, giữ nguyên 30 sheet, toàn bộ liên kết công thức và khóa bảo vệ.
3. **Làm sao để dừng hoàn toàn ứng dụng?**
   * Bạn chỉ cần đóng cửa sổ Command Prompt màu đen là hệ thống sẽ dừng hoàn toàn.
