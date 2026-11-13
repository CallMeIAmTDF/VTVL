"""
FastAPI Server cho VTVL Wizard 2027-2031
"""

import os
import io
from typing import Dict, Any, List
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel

import fitz  # PyMuPDF
import docx

from config import settings, reload_settings
from calculation_engine import calculate_b1_row, calculate_b2_row, calculate_c3_vtvl, check_d1_personnel
from validator_13_rules import validate_proposal
from excel_injector import inject_proposal_to_excel
from ai_service import AIService

app = FastAPI(title="VTVL Wizard Backend", version="1.0.0")

# CORS setup for Vite frontend (http://localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ai_service = AIService()

class ConfigRequest(BaseModel):
    gemini_key: str = ""
    groq_key: str = ""

class FormatTaskRequest(BaseModel):
    raw_text: str

class JustificationRequest(BaseModel):
    vtvl_title: str
    fte: float
    assigned: int
    reason_category: str = "Địa bàn"

class CalculationRequest(BaseModel):
    data: Dict[str, Any]

@app.get("/api/health")
def health_check():
    st = reload_settings()
    return {
        "status": "healthy",
        "has_gemini": bool(ai_service.gemini_key),
        "has_groq": bool(ai_service.groq_key),
        "gemini_source": ai_service.gemini_source,
        "groq_source": ai_service.groq_source,
        "env_has_gemini": bool((st.GEMINI_API_KEY or "").strip()),
        "env_has_groq": bool((st.GROQ_API_KEY or "").strip()),
        "template_found": os.path.exists(st.MASTER_TEMPLATE_PATH)
    }

@app.get("/api/settings")
def get_api_settings():
    st = reload_settings()
    return {
        "has_gemini": bool(ai_service.gemini_key),
        "has_groq": bool(ai_service.groq_key),
        "gemini_source": ai_service.gemini_source,
        "groq_source": ai_service.groq_source,
        "env_has_gemini": bool((st.GEMINI_API_KEY or "").strip()),
        "env_has_groq": bool((st.GROQ_API_KEY or "").strip())
    }

@app.post("/api/settings")
def update_api_keys(req: ConfigRequest):
    global ai_service
    st = reload_settings()
    ai_service = AIService(gemini_api_key=req.gemini_key, groq_api_key=req.groq_key)
    return {
        "success": True,
        "has_gemini": bool(ai_service.gemini_key),
        "has_groq": bool(ai_service.groq_key),
        "gemini_source": ai_service.gemini_source,
        "groq_source": ai_service.groq_source,
        "env_has_gemini": bool((st.GEMINI_API_KEY or "").strip()),
        "env_has_groq": bool((st.GROQ_API_KEY or "").strip())
    }

def extract_text_from_bytes(content: bytes, filename: str) -> str:
    """Đọc nội dung văn bản từ mọi định dạng tài liệu (.pdf, .docx, .doc, .xlsx, .xls, .txt, .csv)"""
    lower_name = filename.lower()
    if lower_name.endswith(".pdf"):
        doc = fitz.open(stream=content, filetype="pdf")
        text = "\n".join([page.get_text() for page in doc])
        doc.close()
        return text
    elif lower_name.endswith(".docx"):
        doc_stream = io.BytesIO(content)
        d = docx.Document(doc_stream)
        lines = [p.text.strip() for p in d.paragraphs if p.text.strip()]
        for t in d.tables:
            for r in t.rows:
                # Loại bỏ các ô gộp (merged cells) bị lặp lại cùng 1 nội dung trên cùng 1 hàng
                unique_cells = list(dict.fromkeys(
                    c.text.strip().replace("\n", " ") for c in r.cells if c.text.strip()
                ))
                row_txt = " | ".join(unique_cells)
                if row_txt:
                    lines.append(row_txt)
        return "\n".join(lines)
    elif lower_name.endswith(".xlsx"):
        import openpyxl as opxl
        wb = opxl.load_workbook(io.BytesIO(content), read_only=True, data_only=True)
        lines = []
        for sname in wb.sheetnames[:10]:
            ws = wb[sname]
            lines.append(f"[Sheet: {sname}]")
            for row in list(ws.iter_rows(min_row=1, max_row=300, values_only=True)):
                vals = [str(c).strip() for c in row if c is not None and str(c).strip()]
                if vals:
                    lines.append(" | ".join(vals))
        wb.close()
        return "\n".join(lines)
    elif lower_name.endswith((".doc", ".xls")):
        import re as _re
        text_u16 = content.decode("utf-16le", errors="ignore")
        runs = _re.findall(r"[0-9A-Za-zÀ-ỹ\s,.;:()/\-\+\?\%\_\r\n\t]{15,}", text_u16)
        cleaned = [r.strip() for r in runs if len(r.strip()) >= 15 and sum(c.isalpha() for c in r) > 8]
        return "\n".join(cleaned)
    else:
        try:
            return content.decode("utf-8")
        except Exception:
            return content.decode("cp1258", errors="ignore")


@app.post("/api/upload-document")
async def upload_document(file: UploadFile = File(...)):
    """Đọc nội dung từ 1 file đơn lẻ"""
    content = await file.read()
    text = extract_text_from_bytes(content, file.filename)
    return {"filename": file.filename, "text_length": len(text), "preview": text[:500], "full_text": text}


@app.post("/api/upload-documents")
async def upload_multiple_documents(files: List[UploadFile] = File(...)):
    """Đọc nội dung từ NHIỀU file cùng lúc (.pdf, .docx, .doc, .xlsx, .xls, .txt) để tổng hợp đề án"""
    results = []
    combined_parts = []
    for f in files:
        content = await f.read()
        text = extract_text_from_bytes(content, f.filename)
        results.append({
            "filename": f.filename,
            "text_length": len(text),
            "full_text": text
        })
        combined_parts.append(f"=== TÀI LIỆU: {f.filename} ===\n{text}")
    combined_text = "\n\n".join(combined_parts)
    return {
        "files": results,
        "total_files": len(results),
        "text_length": len(combined_text),
        "full_text": combined_text
    }


class LoadLocalDocRequest(BaseModel):
    rel_path: str = ""
    rel_paths: List[str] = []


@app.get("/api/ho-vuong-documents")
def list_ho_vuong_documents():
    """Liệt kê kho tài liệu gốc của Xã Hồ Vương - Tỉnh Thanh Hóa (QĐ 1096, NVGOC, SPCV, VTVL)"""
    workspace_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    folders = [
        ("QĐ 1096 (Bản mô tả VTVL Tỉnh ủy Thanh Hóa)", os.path.join(workspace_root, "QĐ 1096", "1096")),
        ("NVGOC (Quy chế & Phân công Xã Hồ Vương)", os.path.join(workspace_root, "NVGOC")),
        ("SPCV (Thống kê Văn bản & Sản phẩm Xã Hồ Vương)", os.path.join(workspace_root, "SPCV")),
        ("VTVL (Danh mục & Bản mô tả VTVL)", os.path.join(workspace_root, "VTVL")),
    ]
    docs = []
    for group_label, folder_path in folders:
        if not os.path.exists(folder_path):
            continue
        for root, _, files in os.walk(folder_path):
            for fn in sorted(files):
                if fn.lower().endswith((".pdf", ".docx", ".doc", ".xlsx", ".xls", ".txt")):
                    full_p = os.path.join(root, fn)
                    rel_p = os.path.relpath(full_p, workspace_root).replace("\\", "/")
                    sub_dir = os.path.relpath(root, folder_path).replace("\\", "/")
                    label = fn if sub_dir == "." else f"[{sub_dir}] {fn}"
                    docs.append({
                        "group": group_label,
                        "label": label,
                        "rel_path": rel_p
                    })
    return {"documents": docs}


@app.post("/api/load-ho-vuong-doc")
def load_ho_vuong_doc(req: LoadLocalDocRequest):
    """Đọc 1 hoặc NHIỀU văn bản từ kho tài liệu Xã Hồ Vương - Tỉnh Thanh Hóa"""
    workspace_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    paths_to_read = req.rel_paths if req.rel_paths else ([req.rel_path] if req.rel_path else [])
    if not paths_to_read:
        raise HTTPException(status_code=400, detail="Chưa chọn tài liệu cần nạp")

    loaded_files = []
    combined_parts = []
    for rel_p in paths_to_read:
        target_path = os.path.abspath(os.path.join(workspace_root, rel_p))
        if not target_path.startswith(workspace_root) or not os.path.exists(target_path):
            continue
        with open(target_path, "rb") as f:
            raw_bytes = f.read()
        fname = os.path.basename(target_path)
        text = extract_text_from_bytes(raw_bytes, fname)
        loaded_files.append({
            "filename": fname,
            "rel_path": rel_p,
            "text_length": len(text),
            "full_text": text
        })
        combined_parts.append(f"=== TÀI LIỆU: {fname} ===\n{text}")

    if not loaded_files:
        raise HTTPException(status_code=404, detail="Không tìm thấy tài liệu trong kho dữ liệu Xã Hồ Vương")

    combined_text = "\n\n".join(combined_parts)
    return {
        "files": loaded_files,
        "filename": ", ".join([f["filename"] for f in loaded_files]),
        "text_length": len(combined_text),
        "full_text": combined_text
    }

@app.post("/api/extract-tasks")
def extract_tasks(vtvl_title: str = Form(...), doc_text: str = Form(...)):
    """Dùng Gemini bóc tách nhiệm vụ & công việc A2 từ văn bản"""
    jobs = ai_service.parse_document_to_tasks(doc_text, vtvl_title)
    return {"vtvl_title": vtvl_title, "jobs": jobs}

@app.post("/api/format-task")
def format_task(req: FormatTaskRequest):
    """Dùng Groq chuẩn hóa tên việc siêu nhanh (< 0.5s)"""
    res = ai_service.format_task_name_fast(req.raw_text)
    return res

@app.post("/api/generate-justification")
def generate_justification(req: JustificationRequest):
    """Sinh câu văn thuyết minh hành chính chuẩn theo Hướng dẫn 07"""
    res = ai_service.generate_justification(req.vtvl_title, req.fte, req.assigned, req.reason_category)
    return {"justification": res}

@app.post("/api/validate")
def validate_data(req: CalculationRequest):
    """Quét 13 lỗi nghiệp vụ tiền thẩm định"""
    result = validate_proposal(req.data)
    return result

import unicodedata
import re

def to_safe_filename(name: str) -> str:
    name = name.replace('Đ', 'D').replace('đ', 'd')
    s = unicodedata.normalize('NFKD', name).encode('ASCII', 'ignore').decode('utf-8')
    s = re.sub(r'[^a-zA-Z0-9]+', '_', s).strip('_')
    return s or "DonVi"

@app.post("/api/export-excel")
def export_excel(req: CalculationRequest):
    """Đổ dữ liệu vào template phôi 03. Bo bieu VTVL 19-10-2026.xlsx"""
    agency_name = req.data.get("meta", {}).get("agency_name", "DonVi")
    safe_agency = to_safe_filename(agency_name)
    output_filename = f"De_An_VTVL_2027_2031_{safe_agency}.xlsx"
    
    export_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "exports"))
    output_path = os.path.join(export_dir, output_filename)
    
    try:
        inject_proposal_to_excel(req.data, output_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
    return {
        "success": True,
        "filename": output_filename,
        "download_url": f"/api/download/{output_filename}"
    }

@app.get("/api/download/{filename}")
def download_excel(filename: str):
    export_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "exports"))
    file_path = os.path.join(export_dir, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File không tồn tại")
    
    # Đảm bảo filename có đuôi .xlsx
    if not filename.endswith(".xlsx"):
        download_name = f"{filename}.xlsx"
    else:
        download_name = filename

    return FileResponse(
        path=file_path, 
        filename=download_name, 
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": f'attachment; filename="{download_name}"',
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
    )

from fastapi.staticfiles import StaticFiles

# Mount Frontend static files if built
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))
if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
