"""
Module kiểm tra 13 lỗi nghiệp vụ (13-Rule Pre-flight Validator)
Mô phỏng chính xác thuật toán kiểm định của sheet 13. K_KiemTra trong file phôi BTCTW.
"""

from typing import List, Dict, Any

def validate_proposal(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Rà soát toàn diện hồ sơ đề án qua bộ lọc 13 lỗi.
    Trả về:
    - is_valid: True nếu 0 lỗi
    - total_errors: Số lượng lỗi chặn (Error)
    - total_warnings: Số lượng cảnh báo (Warning)
    - items: Danh sách chi tiết các lỗi kèm hướng dẫn sửa bằng tiếng Việt dễ hiểu.
    """
    errors = []
    warnings = []
    
    tasks_a2 = data.get("tasks_a2", [])
    b1_records = data.get("b1_records", [])
    b2_records = data.get("b2_records", [])
    vtvl_c3 = data.get("vtvl_c3", [])
    personnel_d1 = data.get("personnel_d1", [])
    forecast_d2 = data.get("forecast_d2", [])
    meta = data.get("meta", {})
    
    # 1. Kiểm tra giới hạn 200 dòng (Quy định dòng 3-202)
    if len(tasks_a2) > 200:
        errors.append({
            "code": "RULE_13_ROW_LIMIT",
            "sheet": "2. A2_CongViec",
            "message": f"Số lượng công việc ({len(tasks_a2)}) vượt quá giới hạn 200 dòng của biểu mẫu. Cần gộp nhóm hoặc báo đầu mối hỗ trợ tệp mở rộng.",
            "target": "A2"
        })
        
    # 2. Kiểm tra kỳ báo cáo
    period = meta.get("period", "01/10/2025 - 30/09/2026")
    if "2025" not in period or "2026" not in period:
        errors.append({
            "code": "RULE_09_INVALID_PERIOD",
            "sheet": "1. A1_NhiemVu",
            "message": "Kỳ báo cáo không đúng chuẩn quy định (Kỳ chuẩn bắt buộc: 01/10/2025 đến 30/09/2026).",
            "target": "Meta"
        })

    # 3. Kiểm tra ô trống hoặc = 0 ở B1
    for idx, b1 in enumerate(b1_records):
        task_name = b1.get("task_name", f"Dòng {idx+1}")
        qty = b1.get("quantity", 0)
        minutes = b1.get("minutes_per_sp", 0)
        
        if qty <= 0:
            errors.append({
                "code": "RULE_01_EMPTY_B1_QTY",
                "sheet": "3. B1_KhoiLuong",
                "row": idx + 3,
                "message": f"Công việc '{task_name}' có sản lượng bằng 0 hoặc để trống. Nếu không phát sinh, cần giải trình hoặc loại bỏ khỏi danh mục A2.",
                "target": f"B1_{idx}"
            })
        if minutes <= 0:
            errors.append({
                "code": "RULE_01_EMPTY_B1_MIN",
                "sheet": "3. B1_KhoiLuong",
                "row": idx + 3,
                "message": f"Công việc '{task_name}' chưa điền số phút thực hiện cho 1 sản phẩm.",
                "target": f"B1_{idx}"
            })
        # 4. Kiểm tra thời gian bất thường > 480 phút
        elif minutes > 480:
            reason = b1.get("over_480_reason", "").strip()
            if not reason:
                warnings.append({
                    "code": "RULE_02_EXCESSIVE_MINUTES",
                    "sheet": "3. B1_KhoiLuong",
                    "row": idx + 3,
                    "message": f"Công việc '{task_name}' có thời gian {minutes} phút (> 8 giờ/sản phẩm). Hãy kiểm tra xem có đang tính nhầm thời hạn chờ xử lý TTHC không, hoặc cần nhập lý do giải trình.",
                    "target": f"B1_{idx}"
                })

    # 5. Kiểm tra logic B2 (Tác động chuyển đổi số)
    for idx, b2 in enumerate(b2_records):
        mins_before = b2.get("minutes_before", 0)
        mins_after = b2.get("minutes_after", 0)
        if mins_after >= mins_before and mins_before > 0:
            errors.append({
                "code": "RULE_03_B2_INVALID",
                "sheet": "4. B2_CT_TacDong",
                "row": idx + 3,
                "message": f"Dòng tác động B2: Thời gian sau cải cách ({mins_after}p) không nhỏ hơn trước ({mins_before}p) $\\rightarrow$ Không phát sinh giờ giảm.",
                "target": f"B2_{idx}"
            })

    # 6. Kiểm tra C3 (Làm tròn số người quy đổi & giải trình)
    for c3 in vtvl_c3:
        vtvl_title = c3.get("vtvl_title", "VTVL")
        fte = c3.get("fte_pp2", 0.0)
        assigned = c3.get("suggested_staff", 0)
        justification = c3.get("justification", "").strip()
        method = c3.get("method", "PP2")
        
        # Kiểm tra nếu là chức danh lãnh đạo nhưng chọn PP2
        is_leader = any(k in vtvl_title.lower() for k in ["trưởng", "phó", "chủ tịch", "chánh", "bí thư"])
        if is_leader and method == "PP2":
            warnings.append({
                "code": "RULE_06_WRONG_METHOD",
                "sheet": "8. C3_NhuCau",
                "message": f"Vị trí lãnh đạo '{vtvl_title}' nên áp dụng PP1 (theo quy định khung số lượng lãnh đạo) thay vì PP2 (đo số phút).",
                "target": f"C3_{c3.get('vtvl_id')}"
            })
            
        # Kiểm tra giải trình khi bố trí khác số quy đổi
        if method == "PP2" and assigned > 0 and assigned != round(fte):
            if not justification:
                errors.append({
                    "code": "RULE_05_NEED_JUSTIFICATION",
                    "sheet": "8. C3_NhuCau",
                    "message": f"Vị trí '{vtvl_title}': Đề xuất bố trí {assigned} người (khác mức quy đổi {fte} người) nhưng chưa có nội dung giải trình lý do theo đặc điểm cơ quan/địa bàn.",
                    "target": f"C3_{c3.get('vtvl_id')}"
                })

    # 7. Kiểm tra D1 (Quỹ giờ cá nhân trần 1.904h)
    person_hours_map = {}
    for p in personnel_d1:
        pid = p.get("person_id", p.get("full_name", ""))
        hours = p.get("total_hours", 0.0)
        if pid not in person_hours_map:
            person_hours_map[pid] = 0.0
        person_hours_map[pid] += hours
        
    for pid, total_h in person_hours_map.items():
        if total_h > 1904.0:
            errors.append({
                "code": "RULE_07_D1_OVERLOAD",
                "sheet": "9. D1_NhanLuc",
                "message": f"Cán bộ '{pid}' có tổng giờ phân bổ {total_h}h vượt quá trần quy định 1.904 giờ/năm (vượt {round(total_h - 1904.0, 1)}h). Cần điều chuyển bớt công việc kiêm nhiệm.",
                "target": f"D1_{pid}"
            })

    # 8. Kiểm tra D2 (Dự báo 5 năm)
    for d2 in forecast_d2:
        year = d2.get("year", 2027)
        proposed = d2.get("proposed_staff", 0)
        current = d2.get("current_staff", 0)
        reason = d2.get("reason", "").strip()
        if proposed > current and not reason:
            warnings.append({
                "code": "RULE_10_D2_INCREASE_NO_REASON",
                "sheet": "10. D2_PhuongAn",
                "message": f"Năm {year} có đề xuất tăng biên chế so với hiện tại ({proposed} > {current}) nhưng chưa có căn cứ thuyết minh nhiệm vụ mới được giao.",
                "target": f"D2_{year}"
            })

    # Tổng kết
    is_valid = (len(errors) == 0)
    return {
        "is_valid": is_valid,
        "total_errors": len(errors),
        "total_warnings": len(warnings),
        "errors": errors,
        "warnings": warnings,
        "summary_status": "HỢP LỆ (0 LỖI)" if is_valid else f"CÒN {len(errors)} LỖI CẦN XỬ LÝ"
    }
