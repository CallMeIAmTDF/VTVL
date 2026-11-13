"""
Module tính toán thuần (Deterministic Calculation Engine)
Tuân thủ 100% quy tắc số học của Hướng dẫn 07-HD/BTCTW và Bo bieu VTVL.
Không sử dụng AI cho bất kỳ phép tính số học nào.
"""

from typing import List, Dict, Any
from config import settings

def calculate_b1_row(quantity: float, minutes_per_sp: float, supp_hours: float = 0.0) -> Dict[str, float]:
    """
    Tính giờ cho 1 dòng biểu B1
    - quantity: Số SP/năm (Cột C)
    - minutes_per_sp: Trung bình phút/SP (Cột D)
    - supp_hours: Giờ bổ sung (Cột E)
    """
    sp_hours = round((quantity * minutes_per_sp) / 60.0, 2)
    total_hours = round(sp_hours + supp_hours, 2)
    return {
        "sp_hours": sp_hours,
        "total_hours": total_hours
    }

def calculate_b2_row(sp_applied: float, minutes_before: float, minutes_after: float, new_work_hours: float = 0.0) -> Dict[str, float]:
    """
    Tính giờ giảm/tăng của biểu B2_CT_TacDong
    - sp_applied: Số SP áp dụng cải cách (Cột E)
    - minutes_before: Phút trước thay đổi (Cột F)
    - minutes_after: Phút sau thay đổi (Cột G)
    - new_work_hours: Giờ việc mới phát sinh (Cột I)
    """
    diff_minutes = max(0.0, minutes_before - minutes_after)
    reduced_hours = round((sp_applied * diff_minutes) / 60.0, 2)
    return {
        "reduced_hours": reduced_hours,
        "new_work_hours": new_work_hours,
        "net_impact_hours": round(new_work_hours - reduced_hours, 2)
    }

def calculate_c3_vtvl(
    vtvl_id: str,
    method: str,  # 'PP1', 'PP2', 'PP3' hoặc 'PP2+PP1'
    b1_hours: float,
    b2_reduced_hours: float,
    assigned_staff_goal: int,
    pp1_quota: float = 0.0,
    pp3_estimate: float = 0.0
) -> Dict[str, Any]:
    """
    Tính toán nhu cầu nhân lực biểu C3
    - 1.904 giờ chuẩn cho PP2
    - FTE tính đến 3 chữ số thập phân
    """
    net_hours = round(max(0.0, b1_hours - b2_reduced_hours), 2)
    fte_pp2 = round(net_hours / settings.STANDARD_ANNUAL_HOURS, 3)
    
    # Xác định người cần bố trí
    if method == "PP1":
        suggested_staff = int(round(pp1_quota))
    elif method == "PP3":
        suggested_staff = int(round(pp3_estimate))
    else:  # PP2
        suggested_staff = assigned_staff_goal
        
    needs_justification = (suggested_staff != round(fte_pp2))
    
    return {
        "vtvl_id": vtvl_id,
        "method": method,
        "b1_hours": b1_hours,
        "b2_reduced_hours": b2_reduced_hours,
        "net_hours": net_hours,
        "standard_annual_hours": settings.STANDARD_ANNUAL_HOURS,
        "fte_pp2": fte_pp2,
        "suggested_staff": suggested_staff,
        "needs_justification": needs_justification
    }

def check_d1_personnel(person_id: str, main_hours: float, other_hours: float) -> Dict[str, Any]:
    """
    Kiểm tra tải làm việc của từng cán bộ (Biểu D1)
    Tổng thời gian không được vượt quá 1.904 giờ
    """
    total = round(main_hours + other_hours, 2)
    is_overloaded = total > settings.STANDARD_ANNUAL_HOURS
    is_underloaded = total < 1000.0  # Dưới 1000 giờ là thiếu việc
    
    warning = ""
    if is_overloaded:
        warning = f"Quá tải: Tổng {total}h vượt trần {settings.STANDARD_ANNUAL_HOURS}h (Dư {round(total - settings.STANDARD_ANNUAL_HOURS, 1)}h)"
    elif is_underloaded:
        warning = f"Chưa đủ tải: Tổng {total}h thấp hơn mức chuẩn 1.904h"
    else:
        warning = "Đạt tiêu chuẩn quỹ giờ"
        
    return {
        "person_id": person_id,
        "total_hours": total,
        "is_overloaded": is_overloaded,
        "is_underloaded": is_underloaded,
        "status": "ĐẠT" if not is_overloaded else "CẢNH BÁO",
        "warning": warning
    }
