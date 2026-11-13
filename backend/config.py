import os
from pydantic_settings import BaseSettings

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
ENV_FILE_PATH = os.path.join(BACKEND_DIR, ".env")

class Settings(BaseSettings):
    GEMINI_API_KEY: str = ""
    GROQ_API_KEY: str = ""
    
    # Path to master Excel template
    MASTER_TEMPLATE_PATH: str = os.path.abspath(
        os.path.join(BACKEND_DIR, "..", "..", "07-HDVTVL", "03. Bo bieu VTVL 19-10-2026.xlsx")
    )
    
    STANDARD_ANNUAL_HOURS: float = 1904.0  # Quỹ thời gian làm việc chuẩn PP2 (giờ/người/năm)
    MAX_DAILY_MINUTES: int = 480          # 1 ngày làm việc (phút)
    DATA_ROW_START: int = 3
    DATA_ROW_END: int = 202

    class Config:
        env_file = ENV_FILE_PATH
        env_file_encoding = "utf-8"
        extra = "allow"

def reload_settings() -> Settings:
    """Đọc lại file .env từ ổ đĩa để cập nhật ngay lập tức khi người dùng sửa file .env"""
    global settings
    settings = Settings(_env_file=ENV_FILE_PATH, _env_file_encoding="utf-8")
    return settings

settings = reload_settings()
