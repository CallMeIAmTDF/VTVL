@echo off
chcp 65001 > nul
title HỆ THỐNG TRỢ LÝ ĐỀ ÁN VỊ TRÍ VIỆC LÀM 2027-2031
color 0B

echo ==============================================================================
echo       HỆ THỐNG TRỢ LÝ ĐỀ ÁN VỊ TRÍ VIỆC LÀM GIAI ĐOẠN 2027-2031
echo ==============================================================================
echo.

cd /d "%~dp0"

echo [1/2] Đang khởi động Máy chủ Hợp nhất (FastAPI + React Frontend)...
start /b python -m uvicorn main:app --host 127.0.0.1 --port 8000 --app-dir backend

echo [2/2] Đang mở trình duyệt web tại http://127.0.0.1:8000 ...
timeout /t 2 /nobreak > nul
start http://127.0.0.1:8000

echo.
echo ==============================================================================
echo   Ứng dụng đang hoạt động tại: http://127.0.0.1:8000
echo   Đóng cửa sổ này nếu bạn muốn dừng ứng dụng.
echo ==============================================================================
echo.
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --app-dir backend
