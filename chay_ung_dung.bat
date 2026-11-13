@echo off
chcp 65001 > nul

echo ========================================================
echo   KHOI DONG UNG DUNG TRO LY DE AN VI TRI VIEC LAM 2027-2031
echo   ^(Tuan thu Huong dan so 07-HD/BTCTW - Ban To chuc Trung uong^)
echo ========================================================
echo.

echo [1/2] Dang kiem tra va khoi dong Backend FastAPI...
start /b "" python -m uvicorn main:app --host 127.0.0.1 --port 8000 --app-dir backend

timeout /t 3 /nobreak > nul

echo [2/2] Dang mo trinh duyet tai http://127.0.0.1:8000 ...
start "" http://127.0.0.1:8000

echo.
echo ========================================================
echo   Ung dung dang chay tai: http://127.0.0.1:8000
echo   ^(Dong cua so nay neu muon dung ung dung^)
echo ========================================================
pause