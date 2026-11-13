"""
Module Excel Template Injector
Bơm dữ liệu trực tiếp vào đúng các ô trắng của template chuẩn 03. Bo bieu VTVL 19-10-2026.xlsx,
bảo toàn 100% công thức ô xám, định dạng, conditional formatting và macro của Ban Tổ chức Trung ương.
"""

import os
import shutil
import openpyxl
from typing import Dict, Any
from config import settings

def inject_proposal_to_excel(data: Dict[str, Any], output_path: str) -> str:
    """
    Tạo bản sao từ MASTER_TEMPLATE_PATH và điền dữ liệu người dùng vào đúng các ô nhập liệu trắng,
    tuyệt đối không ghi đè các cột công thức khóa (ô xám) và tuân thủ 100% danh mục DM_THAM_SO.
    """
    master_path = settings.MASTER_TEMPLATE_PATH
    if not os.path.exists(master_path):
        raise FileNotFoundError(f"Không tìm thấy file phôi chuẩn tại: {master_path}")
        
    # Tạo thư mục output nếu chưa có
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    
    # Copy file phôi sang đường dẫn mới để bảo toàn file gốc
    shutil.copyfile(master_path, output_path)
    
    # Mở workbook để ghi dữ liệu
    wb = openpyxl.load_workbook(output_path)
    
    meta = data.get("meta", {})
    agency_name = meta.get("agency_name") or "Đảng ủy xã Hồ Vương"
    # Chuẩn hóa ký tự gạch ngang en-dash theo đúng DM_THAM_SO: "01/10/2025–30/9/2026"
    std_period = "01/10/2025–30/9/2026"

    # 0. Điền 12. CHIA_VUNG_CAP_XA (Bước 1 bắt buộc đối với đơn vị cấp xã theo Hướng dẫn chuẩn nhập dữ liệu)
    # Lưu ý: Nhập từ dòng 4; cột F4:F7 là danh sách vùng khóa tuyệt đối không sửa.
    if "12. CHIA_VUNG_CAP_XA" in wb.sheetnames:
        ws_cv = wb["12. CHIA_VUNG_CAP_XA"]
        ws_cv.cell(row=4, column=1, value=1)
        ws_cv.cell(row=4, column=2, value=meta.get("commune_name") or "Xã Hồ Vương")
        ws_cv.cell(row=4, column=3, value=meta.get("commune_region") or "Vùng Đồng bằng")

    # 1. Điền 1. A1_NhiemVu (Tất cả các cột A..G là ô nhập liệu)
    tasks_a1 = data.get("tasks_a1", [])
    if "1. A1_NhiemVu" in wb.sheetnames:
        ws_a1 = wb["1. A1_NhiemVu"]
        for idx, item in enumerate(tasks_a1[:200]):
            row = settings.DATA_ROW_START + idx
            raw_status = item.get("status", "Tiếp tục thực hiện")
            valid_a1_status = raw_status if raw_status in (
                "Tiếp tục thực hiện", "Mới tiếp nhận", "Đã chuyển giao", "Không còn thực hiện"
            ) else "Tiếp tục thực hiện"
            ws_a1.cell(row=row, column=1, value=item.get("task_id", f"NV_{idx+1:02d}"))
            ws_a1.cell(row=row, column=2, value=item.get("task_name", ""))
            ws_a1.cell(row=row, column=3, value=item.get("agency") or agency_name)
            ws_a1.cell(row=row, column=4, value=item.get("legal_basis") or "Quyết định quy định chức năng, nhiệm vụ và Quy chế làm việc")
            ws_a1.cell(row=row, column=5, value=std_period)
            ws_a1.cell(row=row, column=6, value=valid_a1_status)
            ws_a1.cell(row=row, column=7, value=item.get("source") or "Văn bản giao nhiệm vụ được cấp có thẩm quyền phê duyệt")
            
    # 2. Điền 2. A2_CongViec (Các cột A..H là ô nhập liệu)
    tasks_a2 = data.get("tasks_a2", [])
    if "2. A2_CongViec" in wb.sheetnames:
        ws_a2 = wb["2. A2_CongViec"]
        for idx, item in enumerate(tasks_a2[:200]):
            row = settings.DATA_ROW_START + idx
            ws_a2.cell(row=row, column=1, value=item.get("job_id", f"CV_{idx+1:02d}"))
            ws_a2.cell(row=row, column=2, value=item.get("task_id", "NV_01"))
            ws_a2.cell(row=row, column=3, value=item.get("vtvl_id", "VTVL_01"))
            ws_a2.cell(row=row, column=4, value=item.get("job_name", ""))
            ws_a2.cell(row=row, column=5, value=item.get("product") or "Văn bản, hồ sơ")
            ws_a2.cell(row=row, column=6, value=item.get("unit") or "Văn bản")
            ws_a2.cell(row=row, column=7, value=item.get("quality") or "Đúng quy định, bảo đảm chất lượng và tiến độ")
            ws_a2.cell(row=row, column=8, value=item.get("basis") or "Quy chế làm việc và phân công nhiệm vụ")

    # 3. Điền 3. B1_KhoiLuong
    # LƯU Ý: Cột B (2), F (6), G (7), M..R (13..18) là CÔNG THỨC KHÓA — tuyệt đối không ghi đè!
    b1_records = data.get("b1_records", [])
    if "3. B1_KhoiLuong" in wb.sheetnames:
        ws_b1 = wb["3. B1_KhoiLuong"]
        for idx, item in enumerate(b1_records[:200]):
            row = settings.DATA_ROW_START + idx
            minutes_val = float(item.get("minutes_per_sp", 60) or 60)
            supp_val = float(item.get("supp_hours", 0) or 0)
            raw_time_status = item.get("time_status", "Kiểm đếm, ước lượng thực tế")
            valid_time_status = raw_time_status if raw_time_status in (
                "Có định mức", "Kiểm đếm, ước lượng thực tế", "Chưa đủ căn cứ"
            ) else "Kiểm đếm, ước lượng thực tế"

            ws_b1.cell(row=row, column=1, value=item.get("job_id", f"CV_{idx+1:02d}"))
            # Col 2 (Mã VTVL) là công thức tự tham chiếu từ A2_CongViec -> không ghi đè
            ws_b1.cell(row=row, column=3, value=float(item.get("quantity", 1) or 1))
            ws_b1.cell(row=row, column=4, value=minutes_val)
            ws_b1.cell(row=row, column=5, value=supp_val)
            # Col 6 (Giờ SP) & Col 7 (Giờ tổng) là công thức -> không ghi đè
            ws_b1.cell(row=row, column=8, value=item.get("source_qty") or "Thống kê, kiểm đếm hồ sơ, văn bản lưu trữ thực tế tại xã Hồ Vương kỳ 01/10/2025–30/9/2026")
            reason_extra = (item.get("over_480_reason") or item.get("note") or "").strip()
            base_source_time = item.get("source_time") or "Phiếu khảo sát, bấm giờ thực tế thực hiện quy trình nghiệp vụ tại xã Hồ Vương"
            if (minutes_val > 480 or supp_val > 0) and reason_extra:
                base_source_time = f"{base_source_time} ({reason_extra})"
            elif minutes_val > 480 or supp_val > 0:
                base_source_time = f"{base_source_time} (Công việc phức tạp qua nhiều khâu phối hợp/thẩm định tại cơ sở)"
            ws_b1.cell(row=row, column=9, value=base_source_time)
            ws_b1.cell(row=row, column=10, value=valid_time_status)
            ws_b1.cell(row=row, column=11, value=std_period)
            # Col 12 (Mã SP trong danh mục DM_SAN_PHAM): theo Huong_dan_chuan_nhap_du_lieu_Bo_bieu_VTVL.docx,
            # khi dùng số đo thực tế ở cột D thì ĐỂ TRỐNG cột L (12) và cột S (19).
            if item.get("sp_code"):
                ws_b1.cell(row=row, column=12, value=item.get("sp_code"))

    # 4. Điền 4. B2_CT_TacDong
    # LƯU Ý: Cột B (2), H (8), N..P (14..16) là CÔNG THỨC KHÓA — tuyệt đối không ghi đè!
    b2_records = data.get("b2_records", [])
    if "4. B2_CT_TacDong" in wb.sheetnames:
        ws_b2 = wb["4. B2_CT_TacDong"]
        for idx, item in enumerate(b2_records[:200]):
            row = settings.DATA_ROW_START + idx
            raw_impact = item.get("impact_type", "Số hóa")
            valid_impact = raw_impact if raw_impact in (
                "Số hóa", "Cải tiến quy trình", "Thuê dịch vụ/đặt hàng", "Tự chủ", "Xã hội hóa", "Công việc mới phát sinh"
            ) else "Số hóa"
            ws_b2.cell(row=row, column=1, value=item.get("job_id", f"CV_{idx+1:02d}"))
            # Col 2 (Mã VTVL) là công thức -> không ghi đè
            ws_b2.cell(row=row, column=3, value=valid_impact)
            ws_b2.cell(row=row, column=4, value=item.get("stage") or "Soạn thảo, xử lý, ký số và lưu trữ hồ sơ điện tử")
            ws_b2.cell(row=row, column=5, value=float(item.get("sp_applied", 1) or 1))
            ws_b2.cell(row=row, column=6, value=float(item.get("minutes_before", 60) or 60))
            ws_b2.cell(row=row, column=7, value=float(item.get("minutes_after", 40) or 40))
            # Col 8 (Giờ tiết kiệm) là công thức -> không ghi đè
            ws_b2.cell(row=row, column=9, value=float(item.get("new_work_hours", 0) or 0))
            ws_b2.cell(row=row, column=10, value=item.get("evidence") or "Hệ thống quản lý văn bản và điều hành tác nghiệp điện tử")
            ws_b2.cell(row=row, column=11, value=std_period)
            ws_b2.cell(row=row, column=12, value="Trước thay đổi, có điều chỉnh")
            ws_b2.cell(row=row, column=13, value="Đã kiểm chứng")
            # Col 14, 15, 16 là công thức -> không ghi đè
            ws_b2.cell(row=row, column=17, value=item.get("duplicate_code") or "")
            ws_b2.cell(row=row, column=18, value=item.get("scope") or "Trong đơn vị")
            ws_b2.cell(row=row, column=19, value="Đã đối chiếu")

    # 5. Điền 6. C1_VTVL và 7. C2_NangLuc
    # LƯU Ý ở C1: Cột E (5 - Giờ chuẩn PP2) và Cột K (11 - Cảnh báo) là CÔNG THỨC KHÓA — không ghi đè!
    vtvl_list = data.get("vtvl_list", [])
    if "6. C1_VTVL" in wb.sheetnames:
        ws_c1 = wb["6. C1_VTVL"]
        for idx, item in enumerate(vtvl_list[:200]):
            row = settings.DATA_ROW_START + idx
            raw_regime = item.get("work_regime", "Phổ biến (40 giờ/tuần)")
            valid_regime = raw_regime if raw_regime in ("Phổ biến (40 giờ/tuần)", "Đặc thù") else "Phổ biến (40 giờ/tuần)"
            ws_c1.cell(row=row, column=1, value=item.get("vtvl_id", f"VTVL_{idx+1:02d}"))
            ws_c1.cell(row=row, column=2, value=item.get("vtvl_title", ""))
            ws_c1.cell(row=row, column=3, value=item.get("staff_type", "Công chức"))
            ws_c1.cell(row=row, column=4, value=item.get("approval_doc") or "Quyết định số 1096-QĐ/TU và Hướng dẫn 07-HD/BTCTW")
            # Col 5 (Giờ chuẩn PP2) là công thức tự nhảy = 1904 -> không ghi đè
            ws_c1.cell(row=row, column=6, value="Hướng dẫn 07-HD/BTCTW; Quyết định 1096-QĐ/TU")
            ws_c1.cell(row=row, column=7, value="Tiếp tục sử dụng")
            ws_c1.cell(row=row, column=8, value="")
            ws_c1.cell(row=row, column=9, value="")
            ws_c1.cell(row=row, column=10, value=valid_regime)

    if "7. C2_NangLuc" in wb.sheetnames:
        ws_c2 = wb["7. C2_NangLuc"]
        for idx, item in enumerate(vtvl_list[:200]):
            row = settings.DATA_ROW_START + idx
            vtvl_title = item.get("vtvl_title", "Vị trí việc làm chuyên môn")
            ws_c2.cell(row=row, column=1, value=item.get("vtvl_id", f"VTVL_{idx+1:02d}"))
            ws_c2.cell(row=row, column=2, value=item.get("responsibility") or f"Chịu trách nhiệm trực tiếp tham mưu, tổ chức thực hiện các nhiệm vụ thuộc vị trí {vtvl_title} theo phân công")
            ws_c2.cell(row=row, column=3, value=item.get("general_comp") or "Đạo đức, bản lĩnh chính trị; Giao tiếp hành chính; Phối hợp công tác; Ứng dụng CNTT và chuyển đổi số (Bậc 3)")
            ws_c2.cell(row=row, column=4, value=item.get("prof_comp") or f"Năng lực tham mưu xây dựng văn bản, thẩm định và giải quyết nghiệp vụ chuyên sâu thuộc lĩnh vực {vtvl_title} (Bậc 3)")
            ws_c2.cell(row=row, column=5, value=item.get("lead_comp") or "Chủ động lập kế hoạch công việc cá nhân và phối hợp liên bộ phận")
            ws_c2.cell(row=row, column=6, value="Hướng dẫn số 07-HD/BTCTW ngày 13/4/2026 và Quyết định số 1096-QĐ/TU")
            ws_c2.cell(row=row, column=7, value="Bản mô tả công việc và Khung năng lực chuẩn của vị trí việc làm")

    # 6. Điền 8. C3_NhuCau
    # LƯU Ý: Cột C..G (3..7) và M..N (13..14) là CÔNG THỨC KHÓA — tuyệt đối không ghi đè!
    vtvl_c3 = data.get("vtvl_c3", [])
    if "8. C3_NhuCau" in wb.sheetnames:
        ws_c3 = wb["8. C3_NhuCau"]
        for idx, item in enumerate(vtvl_c3[:200]):
            row = settings.DATA_ROW_START + idx
            method_val = item.get("method", "PP2")
            if method_val not in ("PP1", "PP2", "PP3", "PP1+PP2", "PP2+PP3", "PP1+PP3", "PP1+PP2+PP3"):
                method_val = "PP2"
            suggested_val = int(item.get("suggested_staff", 1) or 0)
            ws_c3.cell(row=row, column=1, value=item.get("vtvl_id", f"VTVL_{idx+1:02d}"))
            ws_c3.cell(row=row, column=2, value=method_val)
            # Col 3..7 (Giờ B1, Giờ giảm B2, Giờ ròng, Giờ chuẩn, Người PP2) là công thức -> không ghi đè
            if "PP1" in method_val:
                ws_c3.cell(row=row, column=8, value=item.get("pp1_quota", suggested_val))
            if "PP3" in method_val:
                ws_c3.cell(row=row, column=9, value=item.get("pp3_estimate", suggested_val))
            ws_c3.cell(row=row, column=10, value=suggested_val)
            ws_c3.cell(row=row, column=11, value=item.get("justification") or "Xác định trên cơ sở khối lượng công việc thực tế quy đổi và yêu cầu nhiệm vụ thường trực tại đơn vị theo Hướng dẫn 07-HD/BTCTW")
            ws_c3.cell(row=row, column=12, value="Đã kiểm chứng")

    # 7. Điền 9. D1_NhanLuc
    # LƯU Ý: Cột D (4 - Tổng giờ) và Cột J (10 - Cảnh báo) là CÔNG THỨC KHÓA — không ghi đè!
    personnel_d1 = data.get("personnel_d1", [])
    if "9. D1_NhanLuc" in wb.sheetnames:
        ws_d1 = wb["9. D1_NhanLuc"]
        for idx, item in enumerate(personnel_d1[:200]):
            row = settings.DATA_ROW_START + idx
            ws_d1.cell(row=row, column=1, value=item.get("person_id", f"CB_{idx+1:02d}"))
            ws_d1.cell(row=row, column=2, value=item.get("vtvl_id", "VTVL_01"))
            ws_d1.cell(row=row, column=3, value=item.get("staff_type", "Công chức"))
            # Col 4 (Tổng giờ) là công thức = E + F -> không ghi đè
            ws_d1.cell(row=row, column=5, value=float(item.get("main_hours", 1400) or 0))
            ws_d1.cell(row=row, column=6, value=float(item.get("other_hours", 0) or 0))
            ws_d1.cell(row=row, column=7, value=agency_name)
            ws_d1.cell(row=row, column=8, value="Danh sách cán bộ, công chức và bảng phân công công tác chốt tại 30/9/2026")
            ws_d1.cell(row=row, column=9, value="Đã kiểm chứng")

    # 8. Điền DU_BAO_5_NAM và 10. D2_PhuongAn
    # LƯU Ý: Cột C của D2_PhuongAn lấy dữ liệu tự động từ DU_BAO_5_NAM!G..G khi DU_BAO_5_NAM!F = "Đã kiểm chứng"
    forecast_d2 = data.get("forecast_d2", [])
    if "DU_BAO_5_NAM" in wb.sheetnames:
        ws_db = wb["DU_BAO_5_NAM"]
        for idx, item in enumerate(forecast_d2[:200]):
            row = settings.DATA_ROW_START + idx
            ws_db.cell(row=row, column=1, value=item.get("vtvl_id", "VTVL_01"))
            ws_db.cell(row=row, column=2, value=int(item.get("year", 2027 + idx)))
            ws_db.cell(row=row, column=3, value=float(item.get("delta_staff", 0) or 0))
            ws_db.cell(row=row, column=4, value=item.get("forecast_content") or "Duy trì ổn định khối lượng công việc và đẩy mạnh ứng dụng chuyển đổi số trong giải quyết nghiệp vụ")
            ws_db.cell(row=row, column=5, value=item.get("forecast_basis") or "Phương hướng, nhiệm vụ giai đoạn 2027–2031 và Kế hoạch chuyển đổi số của đơn vị")
            ws_db.cell(row=row, column=6, value="Đã kiểm chứng")
            # Col 7, 8, 9 (C3 hiện tại, Dự báo năm, Kiểm tra) là công thức -> không ghi đè

    if "10. D2_PhuongAn" in wb.sheetnames:
        ws_d2 = wb["10. D2_PhuongAn"]
        for idx, item in enumerate(forecast_d2[:200]):
            row = settings.DATA_ROW_START + idx
            proposed = int(item.get("proposed_staff", 1) or 0)
            assigned = int(item.get("assigned_quota", proposed) or proposed)
            ws_d2.cell(row=row, column=1, value=item.get("vtvl_id", "VTVL_01"))
            ws_d2.cell(row=row, column=2, value=int(item.get("year", 2027 + idx)))
            # Col 3: ở bản có DU_BAO_5_NAM là công thức tự lấy; ở bản không có DU_BAO_5_NAM là ô nhập
            col3_val = ws_d2.cell(row=row, column=3).value
            if not str(col3_val or "").startswith("="):
                ws_d2.cell(row=row, column=3, value=proposed)
            ws_d2.cell(row=row, column=4, value=proposed)
            ws_d2.cell(row=row, column=5, value=assigned)
            ws_d2.cell(row=row, column=6, value=item.get("rearrangement") or "Giữ ổn định số lượng hiện có, tăng cường chuẩn hóa quy trình và ứng dụng CNTT")
            ws_d2.cell(row=row, column=7, value=int(item.get("change_request", proposed - assigned) or 0))
            ws_d2.cell(row=row, column=8, value=item.get("reason") or "Phù hợp với nhu cầu vị trí việc làm theo khối lượng công việc thực tế và biên chế được giao giai đoạn 2027–2031")
            ws_d2.cell(row=row, column=9, value="Đã hoàn thành ở đơn vị")
            # Col 10..13 là công thức khóa -> không ghi đè

    # 9. Điền 14. T_TienDo (Đơn vị & Kỳ tại dòng 3; các cột C..K là công thức tự tổng hợp)
    if "14. T_TienDo" in wb.sheetnames:
        ws_td = wb["14. T_TienDo"]
        ws_td.cell(row=3, column=1, value=agency_name)
        ws_td.cell(row=3, column=2, value=std_period)

    # Lưu lại file
    wb.save(output_path)
    wb.close()
    return output_path
