import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Sparkles, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ArrowRight, 
  ArrowLeft, 
  Download, 
  Settings, 
  Plus, 
  Trash2, 
  Edit3, 
  Clock, 
  Layers, 
  Users, 
  Building2,
  FileCheck,
  RefreshCw
} from 'lucide-react';

const API_BASE = "http://127.0.0.1:8000";

const HO_VUONG_AGENCIES = [
  "Đảng ủy xã Hồ Vương",
  "Cơ quan Ủy ban MTTQ Việt Nam xã Hồ Vương",
  "Ủy ban nhân dân xã Hồ Vương",
  "Đoàn TNCS Hồ Chí Minh xã Hồ Vương",
  "Hội Liên hiệp Phụ nữ xã Hồ Vương",
  "Hội Nông dân xã Hồ Vương",
  "Hội Cựu chiến binh xã Hồ Vương",
  "Công đoàn xã Hồ Vương"
];

const VTVL_GROUPS = [
  {
    group: "I. Cơ quan Đảng ủy xã Hồ Vương (27 VTVL - QĐ 1096-QĐ/TU Tỉnh ủy Thanh Hóa)",
    items: [
      "Bí thư Đảng ủy xã",
      "Phó Bí thư Thường trực Đảng ủy xã",
      "Trưởng Ban Xây dựng Đảng",
      "Chủ nhiệm Ủy ban Kiểm tra",
      "Chánh Văn phòng Đảng ủy",
      "Phó trưởng Ban Xây dựng Đảng",
      "Phó Chủ nhiệm Ủy ban Kiểm tra",
      "Phó Chánh Văn phòng Đảng ủy",
      "Ủy viên Ủy ban Kiểm tra",
      "Chuyên viên chính về công tác tổ chức xây dựng Đảng",
      "Chuyên viên về công tác tổ chức xây dựng Đảng",
      "Chuyên viên chính về công tác Tuyên giáo và Dân vận",
      "Chuyên viên về công tác Tuyên giáo và Dân vận",
      "Kiểm tra viên chính",
      "Kiểm tra viên",
      "Chuyên viên chính về Văn phòng cấp ủy",
      "Chuyên viên về Văn phòng cấp ủy",
      "Chuyên viên về chuyển đổi số",
      "Cơ yếu viên (nếu có)",
      "Nhân viên cơ yếu (nếu có)",
      "Phụ trách kế toán",
      "Văn thư, lưu trữ",
      "Thủ quỹ",
      "Phục vụ, tạp vụ (Hợp đồng lao động)",
      "Lái xe (Hợp đồng lao động)",
      "Bảo vệ (Hợp đồng lao động)",
      "Nhân viên kỹ thuật (Hợp đồng lao động)"
    ]
  },
  {
    group: "II. Cơ quan Ủy ban MTTQ Việt Nam xã Hồ Vương (07 VTVL - QĐ 1096-QĐ/TU)",
    items: [
      "Chủ tịch Ủy ban Mặt trận Tổ quốc Việt Nam cấp xã",
      "Phó Chủ tịch Ủy ban MTTQ Việt Nam cấp xã, kiêm người đứng đầu các tổ chức chính trị - xã hội cấp xã",
      "Cấp phó của người đứng đầu các tổ chức chính trị - xã hội cấp xã (Kiêm nhiệm)",
      "Chuyên viên về công tác MTTQ Việt Nam và các tổ chức chính trị - xã hội",
      "Phụ trách kế toán (Kiêm nhiệm)",
      "Chuyên viên hành chính",
      "Bảo vệ (Hợp đồng lao động)"
    ]
  },
  {
    group: "III. Trung tâm Chính trị cấp xã (08 VTVL - QĐ 1096-QĐ/TU)",
    items: [
      "Giám đốc",
      "Phó Giám đốc",
      "Giảng viên hạng III",
      "Quản lý đào tạo, bồi dưỡng hạng III (nếu có)",
      "Văn phòng, hành chính, quản trị, văn thư, lưu trữ hạng III",
      "Kế toán viên (Kiêm nhiệm)",
      "Thủ quỹ",
      "Bảo vệ (Hợp đồng lao động)"
    ]
  },
  {
    group: "IV. Khối Chính quyền (HĐND & UBND xã Hồ Vương)",
    items: [
      "Chuyên viên Tổng hợp, Văn phòng - Thống kê",
      "Chuyên viên Địa chính - Xây dựng - Đô thị - Môi trường",
      "Chuyên viên Tài chính - Kế toán",
      "Chuyên viên Tư pháp - Hộ tịch",
      "Chuyên viên Văn hóa - Xã hội",
      "Chuyên viên Nội vụ - Thi đua khen thưởng"
    ]
  }
];

const DEFAULT_VTVL_LIST = VTVL_GROUPS.flatMap(g => g.items);

export default function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [agencyType, setAgencyType] = useState('party'); // 'party' (Ban Tổ chức) | 'gov' (Sở Nội vụ)
  const [agencyName, setAgencyName] = useState('Đảng ủy xã Hồ Vương');
  const [hoVuongDocs, setHoVuongDocs] = useState([]);
  const [selectedLocalDoc, setSelectedLocalDoc] = useState('');
  const [loadingLocalDoc, setLoadingLocalDoc] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [appendExtractMode, setAppendExtractMode] = useState(true);
  
  // Settings modal (Lưu vào localStorage khi reload, fallback về .env ở Backend khi FE không cung cấp)
  const [showSettings, setShowSettings] = useState(false);
  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem('vtvl_gemini_key') || '');
  const [groqKey, setGroqKey] = useState(() => localStorage.getItem('vtvl_groq_key') || '');
  const [aiStatus, setAiStatus] = useState({
    has_gemini: false,
    has_groq: false,
    gemini_source: 'none',
    groq_source: 'none',
    env_has_gemini: false,
    env_has_groq: false
  });

  // Đồng bộ cấu hình AI đã lưu ở localStorage xuống Backend khi reload trang
  useEffect(() => {
    const syncAIConfig = async () => {
      const savedGemini = localStorage.getItem('vtvl_gemini_key') || '';
      const savedGroq = localStorage.getItem('vtvl_groq_key') || '';
      try {
        const res = await fetch(`${API_BASE}/api/settings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gemini_key: savedGemini, groq_key: savedGroq })
        });
        if (res.ok) {
          const data = await res.json();
          setAiStatus(data);
        }
        const docRes = await fetch(`${API_BASE}/api/ho-vuong-documents`);
        if (docRes.ok) {
          const docData = await docRes.json();
          setHoVuongDocs(docData.documents || []);
          if (docData.documents && docData.documents.length > 0) {
            setSelectedLocalDoc(docData.documents[0].rel_path);
          }
        }
      } catch (err) {
        console.warn('Chưa kết nối được Backend để đồng bộ cấu hình AI:', err);
      }
    };
    syncAIConfig();
  }, []);

  const appendDocsToWorkspace = (newDocItems) => {
    setUploadedDocs(prev => {
      const existingNames = new Set(prev.map(d => d.filename));
      const filteredNew = newDocItems.filter(d => !existingNames.has(d.filename));
      const merged = [...prev, ...filteredNew];
      const combinedText = merged.map(d => `=== TÀI LIỆU: ${d.filename} ===\n${d.full_text}`).join('\n\n');
      setDocText(combinedText);
      return merged;
    });
  };

  const handleRemoveUploadedDoc = (filenameToRemove) => {
    setUploadedDocs(prev => {
      const remaining = prev.filter(d => d.filename !== filenameToRemove);
      const combinedText = remaining.map(d => `=== TÀI LIỆU: ${d.filename} ===\n${d.full_text}`).join('\n\n');
      setDocText(combinedText);
      return remaining;
    });
  };

  const handleLoadHoVuongDoc = async (relPathsInput) => {
    const pathsArray = Array.isArray(relPathsInput)
      ? relPathsInput
      : (relPathsInput ? [relPathsInput] : (selectedLocalDoc ? [selectedLocalDoc] : []));
    if (pathsArray.length === 0) return;
    setLoadingLocalDoc(true);
    try {
      const res = await fetch(`${API_BASE}/api/load-ho-vuong-doc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rel_paths: pathsArray })
      });
      if (!res.ok) throw new Error('Không thể đọc tài liệu');
      const data = await res.json();
      if (data.files && data.files.length > 0) {
        appendDocsToWorkspace(data.files);
      } else {
        appendDocsToWorkspace([{ filename: data.filename, text_length: data.text_length, full_text: data.full_text }]);
      }
    } catch (err) {
      alert('Lỗi nạp tài liệu Xã Hồ Vương: ' + err.message);
    } finally {
      setLoadingLocalDoc(false);
    }
  };

  const handleLoadAgencyBundle = () => {
    if (!hoVuongDocs.length) return;
    const agLower = (agencyName || '').toLowerCase();
    let matched = [];
    if (agLower.includes('mttq') || agLower.includes('mặt trận')) {
      matched = hoVuongDocs.filter(d =>
        d.rel_path.includes('UBMTTQ') ||
        d.rel_path.includes('MAT TRAN') ||
        d.rel_path.includes('26.') ||
        d.rel_path.includes('27.') ||
        d.rel_path.includes('29.') ||
        d.rel_path.includes('30.')
      );
    } else if (agLower.includes('đoàn')) {
      matched = hoVuongDocs.filter(d => d.rel_path.includes('DOAN TN') || d.rel_path.includes('DOAN THANH NIEN') || d.rel_path.includes('27.'));
    } else if (agLower.includes('phụ nữ')) {
      matched = hoVuongDocs.filter(d => d.rel_path.includes('HOI LHPN') || d.rel_path.includes('PHU NU') || d.rel_path.includes('27.'));
    } else if (agLower.includes('nông dân')) {
      matched = hoVuongDocs.filter(d => d.rel_path.includes('HOI NONG DAN') || d.rel_path.includes('NONG DAN') || d.rel_path.includes('27.'));
    } else if (agLower.includes('cựu chiến binh')) {
      matched = hoVuongDocs.filter(d => d.rel_path.includes('CUU CHIEN BINH') || d.rel_path.includes('27.'));
    } else if (agLower.includes('công đoàn')) {
      matched = hoVuongDocs.filter(d => d.rel_path.includes('CONG DOAN') || d.rel_path.includes('27.'));
    } else {
      const vtvlKeywords = (selectedVtvl || '').toLowerCase().split(/[\s,()-]+/).filter(w => w.length > 2);
      const matchingQd1096 = hoVuongDocs.filter(d =>
        d.rel_path.includes('QĐ 1096') &&
        vtvlKeywords.some(kw => d.label.toLowerCase().includes(kw))
      ).slice(0, 2);
      matched = [
        ...matchingQd1096,
        ...hoVuongDocs.filter(d => d.rel_path.includes('DANG BO XA HO VUONG') || d.rel_path.includes('QD 222'))
      ];
    }
    if (matched.length === 0) {
      matched = hoVuongDocs.slice(0, 3);
    }
    handleLoadHoVuongDoc(matched.map(m => m.rel_path));
  };

  // Step 1: VTVL & Tasks (Khởi tạo trắng hoàn toàn, không tự fill số liệu giả)
  const [selectedVtvl, setSelectedVtvl] = useState(DEFAULT_VTVL_LIST[0]);
  const [docText, setDocText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [parsingAI, setParsingAI] = useState(false);
  const [tasks, setTasks] = useState([]);

  // Step 3: Calculation & Personnel
  const [method, setMethod] = useState('PP2');
  const [suggestedStaff, setSuggestedStaff] = useState(1);
  const [justification, setJustification] = useState('');
  const [loadingJustification, setLoadingJustification] = useState(false);

  // Modal chỉnh sửa công việc (thay thế prompt thô)
  const [editingTask, setEditingTask] = useState(null);
  const [formattingAI, setFormattingAI] = useState(false);
  
  // Personnel list (D1 - Khởi tạo rỗng, người dùng tự thêm cán bộ thực tế của mình)
  const [personnel, setPersonnel] = useState([]);
  const [showBulkPersonnelModal, setShowBulkPersonnelModal] = useState(false);
  const [bulkPersonnelText, setBulkPersonnelText] = useState('');
  const [bulkMainHours, setBulkMainHours] = useState(1400);
  const [bulkOtherHours, setBulkOtherHours] = useState(0);
  const [bulkSplitEvenly, setBulkSplitEvenly] = useState(true);

  // Step 4: Validation & Export
  const [validationResult, setValidationResult] = useState(null);
  const [validating, setValidating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');

  // Autosave notification
  const [savedTime, setSavedTime] = useState('Vừa xong');

  // Trigger Calculations
  const calculateTotals = () => {
    let totalB1Minutes = 0;
    let totalSuppHours = 0;
    let totalB2ReducedMinutes = 0;

    tasks.filter(t => t.is_selected).forEach(t => {
      const spMin = (t.quantity || 0) * (t.minutes_per_sp || 0);
      totalB1Minutes += spMin;
      totalSuppHours += (t.supp_hours || 0);

      if (t.has_b2 && t.b2_before > t.b2_after) {
        totalB2ReducedMinutes += (t.quantity || 0) * (t.b2_before - t.b2_after);
      }
    });

    const b1Hours = (totalB1Minutes / 60) + totalSuppHours;
    const b2ReducedHours = totalB2ReducedMinutes / 60;
    const netHours = Math.max(0, b1Hours - b2ReducedHours);
    const fte = Number((netHours / 1904.0).toFixed(3));

    return { b1Hours: Math.round(b1Hours * 10) / 10, b2ReducedHours: Math.round(b2ReducedHours * 10) / 10, netHours: Math.round(netHours * 10) / 10, fte };
  };

  const totals = calculateTotals();

  // Handle Multi-Document Upload (Nạp nhiều file cùng lúc và cộng dồn vào hồ sơ)
  const handleFileUpload = async (e) => {
    const fileList = Array.from(e.target.files || []);
    if (fileList.length === 0) return;

    const formData = new FormData();
    fileList.forEach(f => formData.append("files", f));
    setUploading(true);

    try {
      const res = await fetch(`${API_BASE}/api/upload-documents`, {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.files && data.files.length > 0) {
        appendDocsToWorkspace(data.files);
      }
      e.target.value = '';
    } catch (err) {
      alert("Lỗi tải tệp: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  // Run AI Extraction (Hỗ trợ đúc kết từ nhiều tài liệu & cộng dồn nhiều đợt bóc tách)
  const handleAIExtract = async () => {
    if (!docText && !selectedVtvl) {
      alert("Vui lòng tải lên tài liệu hoặc dán văn bản trước khi bóc tách!");
      return;
    }
    setParsingAI(true);
    try {
      const formData = new FormData();
      formData.append("vtvl_title", selectedVtvl);
      formData.append("doc_text", docText || "Quyết định phân công nhiệm vụ và quy chế làm việc...");

      const res = await fetch(`${API_BASE}/api/extract-tasks`, {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.jobs && data.jobs.length > 0) {
        const defaultSource = uploadedDocs.length > 0
          ? uploadedDocs.map(d => d.filename).join("; ")
          : "Quyết định 1096-QĐ/TU & Quy chế làm việc tại xã Hồ Vương";

        setTasks(prevTasks => {
          const baseList = appendExtractMode ? prevTasks : [];
          const existingNames = new Set(baseList.map(t => (t.job_name || '').trim().toLowerCase()));
          const incoming = [];
          data.jobs.forEach((j) => {
            const normName = (j.job_name || '').trim().toLowerCase();
            if (appendExtractMode && existingNames.has(normName)) return;
            existingNames.add(normName);
            const idxNum = baseList.length + incoming.length + 1;
            const mins = Number(j.suggested_minutes) || 60;
            const qty = Number(j.suggested_quantity) || 20;
            incoming.push({
              id: `CV_${String(idxNum).padStart(2, '0')}`,
              task_group: j.task_group || `Thực hiện nhiệm vụ tham mưu của vị trí ${selectedVtvl}`,
              source_doc: j.source_doc || defaultSource,
              vtvl_title: selectedVtvl,
              job_name: j.job_name,
              product: j.product,
              unit: j.unit || "Văn bản",
              quantity: qty,
              minutes_per_sp: mins,
              supp_hours: 0,
              has_b2: false,
              b2_before: mins,
              b2_after: Math.round(mins * 0.7),
              over_480_reason: '',
              is_selected: true
            });
          });
          const merged = [...baseList, ...incoming];
          return merged;
        });
      }
    } catch (err) {
      alert("Lỗi bóc tách AI: " + err.message);
    } finally {
      setParsingAI(false);
    }
  };

  // Generate Administrative Justification (Groq)
  const handleAutoJustify = async () => {
    setLoadingJustification(true);
    try {
      const res = await fetch(`${API_BASE}/api/generate-justification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vtvl_title: selectedVtvl,
          fte: totals.fte,
          assigned: suggestedStaff,
          reason_category: "Đặc thù khối lượng công việc và phân tán địa bàn"
        })
      });
      const data = await res.json();
      setJustification(data.justification);
    } catch (err) {
      alert("Lỗi tạo giải trình: " + err.message);
    } finally {
      setLoadingJustification(false);
    }
  };

  // Run 13-Rule Validation
  const handleRunValidation = async () => {
    setValidating(true);
    const payload = {
      meta: {
        agency_name: agencyName,
        agency_type: agencyType,
        period: "01/10/2025 - 30/09/2026"
      },
      tasks_a2: tasks.filter(t => t.is_selected),
      b1_records: tasks.filter(t => t.is_selected).map(t => ({
        task_name: t.job_name,
        quantity: t.quantity,
        minutes_per_sp: t.minutes_per_sp,
        over_480_reason: t.over_480_reason
      })),
      b2_records: tasks.filter(t => t.is_selected && t.has_b2).map(t => ({
        minutes_before: t.b2_before,
        minutes_after: t.b2_after
      })),
      vtvl_c3: [
        {
          vtvl_id: "VTVL_01",
          vtvl_title: selectedVtvl,
          fte_pp2: totals.fte,
          suggested_staff: suggestedStaff,
          justification: justification,
          method: method
        }
      ],
      personnel_d1: personnel.map(p => ({
        person_id: p.name,
        total_hours: p.main_hours + p.other_hours
      })),
      forecast_d2: [
        { year: 2027, proposed_staff: suggestedStaff, current_staff: 1, reason: "Đề án mới" }
      ]
    };

    try {
      const res = await fetch(`${API_BASE}/api/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: payload })
      });
      const data = await res.json();
      setValidationResult(data);
    } catch (err) {
      alert("Lỗi thẩm định: " + err.message);
    } finally {
      setValidating(false);
    }
  };

  // Export to Master Template Excel
  const handleExportExcel = async () => {
    setExporting(true);
    const isLeader = ["bí thư", "chủ tịch", "trưởng", "chủ nhiệm", "chánh", "giám đốc", "phó"].some(
      kw => selectedVtvl.toLowerCase().includes(kw)
    );
    const isContract = ["lái xe", "bảo vệ", "phục vụ", "hợp đồng"].some(
      kw => selectedVtvl.toLowerCase().includes(kw)
    );
    const isCivilServantUnit = selectedVtvl.toLowerCase().includes("giảng viên") || selectedVtvl.toLowerCase().includes("viên chức");
    const inferredStaffType = isContract ? "HĐ 111" : (isCivilServantUnit ? "Viên chức" : (isLeader ? "Cán bộ" : "Công chức"));

    const selectedTasks = tasks.filter(t => t.is_selected);
    const allDocNames = uploadedDocs.length > 0
      ? uploadedDocs.map(d => d.filename).join("; ")
      : "Quyết định số 1096-QĐ/TU, Quy chế làm việc và phân công nhiệm vụ tại xã Hồ Vương";

    // Tự động đúc kết danh mục Nhiệm vụ Biểu A1 từ các nhóm nhiệm vụ (task_group) của các tài liệu đã nạp
    const taskGroupMap = new Map();
    selectedTasks.forEach(t => {
      const grpName = (t.task_group || `Thực hiện chức năng, nhiệm vụ tham mưu của vị trí ${selectedVtvl}`).trim();
      if (!taskGroupMap.has(grpName)) {
        const nvId = `NV_${String(taskGroupMap.size + 1).padStart(2, '0')}`;
        taskGroupMap.set(grpName, {
          task_id: nvId,
          task_name: grpName,
          agency: agencyName || "Đảng ủy xã Hồ Vương",
          legal_basis: t.source_doc || allDocNames,
          period: "01/10/2025–30/9/2026",
          status: "Tiếp tục thực hiện",
          source: allDocNames
        });
      }
    });
    if (taskGroupMap.size === 0) {
      taskGroupMap.set("default", {
        task_id: "NV_01",
        task_name: `Thực hiện chức năng, nhiệm vụ tham mưu và giải quyết công việc của vị trí ${selectedVtvl}`,
        agency: agencyName || "Đảng ủy xã Hồ Vương",
        legal_basis: allDocNames,
        period: "01/10/2025–30/9/2026",
        status: "Tiếp tục thực hiện",
        source: allDocNames
      });
    }

    const payload = {
      meta: {
        agency_name: agencyName || "Đảng ủy xã Hồ Vương",
        agency_type: agencyType,
        period: "01/10/2025–30/9/2026"
      },
      tasks_a1: Array.from(taskGroupMap.values()),
      tasks_a2: selectedTasks.map((t, idx) => {
        const grpName = (t.task_group || `Thực hiện chức năng, nhiệm vụ tham mưu của vị trí ${selectedVtvl}`).trim();
        const mappedA1 = taskGroupMap.get(grpName) || Array.from(taskGroupMap.values())[0];
        return {
          job_id: `CV_${String(idx + 1).padStart(2, '0')}`,
          task_id: mappedA1.task_id,
          vtvl_id: "VTVL_01",
          job_name: t.job_name,
          product: t.product,
          unit: t.unit,
          basis: t.source_doc || allDocNames
        };
      }),
      b1_records: selectedTasks.map((t, idx) => ({
        job_id: `CV_${String(idx + 1).padStart(2, '0')}`,
        vtvl_id: "VTVL_01",
        quantity: t.quantity,
        minutes_per_sp: t.minutes_per_sp,
        supp_hours: t.supp_hours,
        over_480_reason: t.over_480_reason,
        source_qty: t.source_doc ? `Thống kê từ: ${t.source_doc}` : `Thống kê từ hồ sơ: ${allDocNames}`,
        time_status: "Kiểm đếm, ước lượng thực tế"
      })),
      b2_records: tasks.filter(t => t.is_selected && t.has_b2).map((t, idx) => ({
        job_id: `CV_${String(idx + 1).padStart(2, '0')}`,
        vtvl_id: "VTVL_01",
        impact_type: "Số hóa",
        stage: "Soạn thảo, trình ký số và lưu trữ hồ sơ điện tử",
        sp_applied: t.quantity,
        minutes_before: t.b2_before,
        minutes_after: t.b2_after
      })),
      vtvl_list: [
        {
          vtvl_id: "VTVL_01",
          vtvl_title: selectedVtvl,
          staff_type: inferredStaffType,
          work_regime: "Phổ biến (40 giờ/tuần)"
        }
      ],
      vtvl_c3: [
        {
          vtvl_id: "VTVL_01",
          method: method,
          pp1_quota: suggestedStaff,
          pp3_estimate: suggestedStaff,
          suggested_staff: suggestedStaff,
          justification: justification
        }
      ],
      personnel_d1: personnel.map((p) => ({
        person_id: p.name,
        vtvl_id: "VTVL_01",
        staff_type: inferredStaffType,
        main_hours: p.main_hours,
        other_hours: p.other_hours
      })),
      forecast_d2: [
        { vtvl_id: "VTVL_01", year: 2027, proposed_staff: suggestedStaff, assigned_quota: suggestedStaff, change_request: 0 },
        { vtvl_id: "VTVL_01", year: 2028, proposed_staff: suggestedStaff, assigned_quota: suggestedStaff, change_request: 0 },
        { vtvl_id: "VTVL_01", year: 2029, proposed_staff: suggestedStaff, assigned_quota: suggestedStaff, change_request: 0 },
        { vtvl_id: "VTVL_01", year: 2030, proposed_staff: suggestedStaff, assigned_quota: suggestedStaff, change_request: 0 },
        { vtvl_id: "VTVL_01", year: 2031, proposed_staff: suggestedStaff, assigned_quota: suggestedStaff, change_request: 0 }
      ]
    };

    try {
      const res = await fetch(`${API_BASE}/api/export-excel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: payload })
      });
      const data = await res.json();
      if (data.success) {
        // Tải file trực tiếp qua Blob để bảo đảm 100% tên file và đuôi .xlsx
        const downloadEndpoint = `${API_BASE}${data.download_url}`;
        const fileRes = await fetch(downloadEndpoint);
        const blob = await fileRes.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = blobUrl;
        a.download = data.filename || 'De_An_VTVL_2027_2031.xlsx';
        document.body.appendChild(a);
        a.click();
        
        window.URL.revokeObjectURL(blobUrl);
        a.remove();
        setDownloadUrl(downloadEndpoint);
      }
    } catch (err) {
      alert("Lỗi xuất file: " + err.message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="app-layout">
      {/* Cụm Header cố định (Fixed Header: Top Navbar + Stepper Bar) */}
      <div className="fixed-header-wrapper">
        <header className="top-navbar">
          <div className="brand-section">
            <div className="brand-badge">XÃ HỒ VƯƠNG • THANH HÓA</div>
            <div>
              <h1 className="brand-title">Hệ Thống Đề Án Vị Trí Việc Làm Xã Hồ Vương (2027–2031)</h1>
              <p className="brand-sub">Chuẩn hóa theo Hướng dẫn 07-HD/BTCTW, 06-HD/BTCTW & Quyết định 1096-QĐ/TU Tỉnh ủy Thanh Hóa</p>
            </div>
          </div>

          <div className="top-actions">
            {/* Org Type Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f1f5f9', padding: '0.35rem 0.75rem', borderRadius: '8px' }}>
              <Building2 size={16} color="#475569" />
              <select 
                id="agency-type-select"
                value={agencyType} 
                onChange={(e) => setAgencyType(e.target.value)}
                style={{ border: 'none', background: 'transparent', fontWeight: 600, fontSize: '0.8rem', color: '#334155', outline: 'none', cursor: 'pointer' }}
              >
                <option value="party">Khối Đảng / Đoàn thể (Nộp Ban Tổ chức)</option>
                <option value="gov">Khối Hành chính Nhà nước (Nộp Sở Nội vụ)</option>
              </select>
            </div>

            <button 
              id="settings-modal-btn"
              className="btn btn-secondary" 
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
              onClick={() => setShowSettings(true)}
            >
              <Settings size={15} />
              Cấu hình AI (Gemini & Groq)
            </button>
          </div>
        </header>

        {/* Stepper Bar */}
        <nav className="stepper-container">
          <div className="stepper-nav">
            <button 
              id="nav-step-1"
              className={`step-item ${currentStep === 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}
              onClick={() => setCurrentStep(1)}
            >
              <div className="step-number">{currentStep > 1 ? <CheckCircle2 size={16} /> : "1"}</div>
              <div className="step-meta">
                <h4>Chặng 1: Bóc tách</h4>
                <p>Nhiệm vụ & Công việc (A1, A2)</p>
              </div>
            </button>

            <button 
              id="nav-step-2"
              className={`step-item ${currentStep === 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}
              onClick={() => setCurrentStep(2)}
            >
              <div className="step-number">{currentStep > 2 ? <CheckCircle2 size={16} /> : "2"}</div>
              <div className="step-meta">
                <h4>Chặng 2: Khai báo</h4>
                <p>Sản lượng & Số hóa (B1, B2)</p>
              </div>
            </button>

            <button 
              id="nav-step-3"
              className={`step-item ${currentStep === 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}
              onClick={() => setCurrentStep(3)}
            >
              <div className="step-number">{currentStep > 3 ? <CheckCircle2 size={16} /> : "3"}</div>
              <div className="step-meta">
                <h4>Chặng 3: Tính toán</h4>
                <p>Biên chế & Nhân lực (C3, D1, D2)</p>
              </div>
            </button>

            <button 
              id="nav-step-4"
              className={`step-item ${currentStep === 4 ? 'active' : ''}`}
              onClick={() => {
                setCurrentStep(4);
                handleRunValidation();
              }}
            >
              <div className="step-number">4</div>
              <div className="step-meta">
                <h4>Chặng 4: Thẩm định</h4>
                <p>Lọc 13 lỗi & Xuất Excel</p>
              </div>
            </button>
          </div>
        </nav>
      </div>

      {/* Main Wizard Content (Scrollable Body) */}
      <div className="wizard-scroll-wrapper">
        <main className="wizard-content">
        {/* ================= STEP 1: TASK EXTRACTION ================= */}
        {currentStep === 1 && (
          <div className="stage-card">
            <div className="stage-header">
              <div>
                <h2>Chặng 1: Bóc tách Nhiệm vụ & Danh mục Công việc (Biểu A1, A2)</h2>
                <p>Nạp văn bản chức năng nhiệm vụ hoặc đề án cũ. AI hỗ trợ bóc tách theo đúng cú pháp chuẩn.</p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0, alignItems: 'center' }}>
                <label className="btn btn-secondary" style={{ cursor: 'pointer' }} title="Có thể giữ phím Ctrl hoặc Shift để chọn nhiều file Word, PDF, Excel cùng lúc">
                  <Upload size={16} />
                  {uploading ? "Đang nạp file..." : "Tải nhiều file (Word/PDF/Excel)"}
                  <input type="file" multiple accept=".docx,.doc,.pdf,.xlsx,.xls,.txt,.csv" onChange={handleFileUpload} style={{ display: 'none' }} />
                </label>
                <button 
                  id="btn-ai-extract"
                  className="btn btn-primary" 
                  onClick={handleAIExtract}
                  disabled={parsingAI}
                >
                  <Sparkles size={16} />
                  {parsingAI ? "AI đang đúc kết..." : `AI Đúc kết (${uploadedDocs.length || 1} tài liệu)`}
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <label className="form-label">Chọn Vị trí việc làm (Theo QĐ 1096-QĐ/TU):</label>
                <select 
                  id="vtvl-select"
                  className="form-select"
                  value={selectedVtvl}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedVtvl(val);
                    const isLeader = ["bí thư", "chủ tịch", "trưởng", "chủ nhiệm", "chánh", "giám đốc", "phó"].some(
                      kw => val.toLowerCase().includes(kw)
                    );
                    setMethod(isLeader ? "PP1+PP2" : "PP2");
                  }}
                >
                  {VTVL_GROUPS.map((grp, gIdx) => (
                    <optgroup key={gIdx} label={grp.group}>
                      {grp.items.map((item, idx) => (
                        <option key={`${gIdx}-${idx}`} value={item}>{item}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>

                <div style={{ marginTop: '1rem' }}>
                  <label className="form-label">Đơn vị thuộc Xã Hồ Vương - Tỉnh Thanh Hóa:</label>
                  <select
                    className="form-select"
                    style={{ marginBottom: '0.45rem', fontSize: '0.82rem', background: '#f8fafc' }}
                    value={HO_VUONG_AGENCIES.includes(agencyName) ? agencyName : '__custom__'}
                    onChange={(e) => {
                      if (e.target.value !== '__custom__') {
                        setAgencyName(e.target.value);
                      }
                    }}
                  >
                    {HO_VUONG_AGENCIES.map((ag, idx) => (
                      <option key={idx} value={ag}>{ag}</option>
                    ))}
                    <option value="__custom__">-- Nhập tên đơn vị khác thuộc xã Hồ Vương --</option>
                  </select>
                  <input 
                    id="agency-name-input"
                    type="text" 
                    className="form-input" 
                    placeholder="Tên cơ quan / đơn vị thuộc xã Hồ Vương..."
                    value={agencyName} 
                    onChange={(e) => setAgencyName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>
                    Kho tài liệu tổng hợp ({uploadedDocs.length} file đã nạp):
                  </label>
                  {hoVuongDocs.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                      <select
                        className="form-select"
                        style={{ width: 'auto', maxWidth: '250px', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        value={selectedLocalDoc}
                        onChange={(e) => setSelectedLocalDoc(e.target.value)}
                      >
                        {Array.from(new Set(hoVuongDocs.map(d => d.group))).map((grp, gIdx) => (
                          <optgroup key={gIdx} label={grp}>
                            {hoVuongDocs.filter(d => d.group === grp).map((d, dIdx) => (
                              <option key={`${gIdx}-${dIdx}`} value={d.rel_path}>{d.label}</option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: '0.25rem 0.55rem', fontSize: '0.74rem', color: '#4f46e5', borderColor: '#c7d2fe', background: '#eef2ff' }}
                        disabled={loadingLocalDoc}
                        onClick={() => handleLoadHoVuongDoc(selectedLocalDoc)}
                        title="Cộng dồn tài liệu đang chọn vào bộ hồ sơ"
                      >
                        <Plus size={13} />
                        {loadingLocalDoc ? 'Đang nạp...' : 'Nạp thêm file này'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: '0.25rem 0.55rem', fontSize: '0.74rem', color: '#047857', borderColor: '#a7f3d0', background: '#ecfdf5' }}
                        disabled={loadingLocalDoc}
                        onClick={handleLoadAgencyBundle}
                        title="Tự động nạp trọn bộ Quy chế + Phân công + QĐ 1096 + SPCV của đơn vị đang chọn"
                      >
                        <Layers size={13} />
                        Nạp trọn bộ theo Đơn vị
                      </button>
                    </div>
                  )}
                </div>

                {/* Thanh hiển thị danh sách nhiều tài liệu đã nạp */}
                {uploadedDocs.length > 0 && (
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.4rem',
                    alignItems: 'center',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '0.45rem 0.65rem',
                    marginBottom: '0.45rem'
                  }}>
                    {uploadedDocs.map((doc, idx) => (
                      <span
                        key={idx}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          background: '#e0e7ff',
                          color: '#3730a3',
                          fontSize: '0.73rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.55rem',
                          borderRadius: '999px'
                        }}
                      >
                        <FileCheck size={12} />
                        {doc.filename} ({Math.round((doc.text_length || 0) / 1000 * 10) / 10}k ký tự)
                        <button
                          type="button"
                          onClick={() => handleRemoveUploadedDoc(doc.filename)}
                          style={{ border: 'none', background: 'transparent', color: '#4338ca', cursor: 'pointer', fontWeight: 800, padding: 0, marginLeft: '0.15rem' }}
                          title="Gỡ tài liệu này"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setUploadedDocs([]);
                        setDocText('');
                      }}
                      style={{ border: 'none', background: 'transparent', color: '#e11d48', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', marginLeft: 'auto' }}
                    >
                      Xóa hết tài liệu
                    </button>
                  </div>
                )}

                <textarea 
                  id="doc-text-area"
                  className="form-textarea" 
                  rows={5}
                  placeholder="Bạn có thể tải nhiều file Word/PDF/Excel cùng lúc hoặc bấm [Nạp thêm file này] / [Nạp trọn bộ theo Đơn vị] để hệ thống đúc kết thành 1 file Excel đề án hoàn chỉnh..."
                  value={docText}
                  onChange={(e) => setDocText(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1.5rem 0 0.5rem 0', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#334155', margin: 0 }}>
                  Danh sách công việc đã chọn ({tasks.filter(t => t.is_selected).length} việc):
                </h3>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: '#475569', cursor: 'pointer', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={appendExtractMode}
                    onChange={(e) => setAppendExtractMode(e.target.checked)}
                    style={{ width: '15px', height: '15px', cursor: 'pointer' }}
                  />
                  Cộng dồn công việc khi AI bóc tách thêm tài liệu mới
                </label>
              </div>
              <button 
                id="btn-add-task-manual"
                className="btn btn-secondary" 
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem', fontWeight: 600 }}
                onClick={() => {
                  const newTask = {
                    id: `CV_${String(tasks.length + 1).padStart(2, '0')}`,
                    job_name: '',
                    product: '',
                    unit: 'Hồ sơ',
                    quantity: 1,
                    minutes_per_sp: 60,
                    supp_hours: 0,
                    has_b2: false,
                    b2_before: 60,
                    b2_after: 40,
                    over_480_reason: '',
                    is_selected: true
                  };
                  setTasks([...tasks, newTask]);
                  setEditingTask({ ...newTask, index: tasks.length });
                }}
              >
                <Plus size={14} /> Thêm việc thủ công
              </button>
            </div>

            {/* Khi chưa có công việc nào (Khởi tạo trắng) */}
            {tasks.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '3.5rem 2rem',
                background: '#f8fafc',
                borderRadius: '16px',
                border: '2px dashed #cbd5e1',
                marginTop: '1rem'
              }}>
                <Sparkles size={44} color="#6366f1" style={{ margin: '0 auto 1rem auto', opacity: 0.85 }} />
                <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e293b' }}>
                  Chưa có công việc nào được chọn
                </h4>
                <p style={{ fontSize: '0.875rem', color: '#64748b', maxWidth: '580px', margin: '0.5rem auto 1.5rem auto', lineHeight: 1.6 }}>
                  Hệ thống không tự ý điền trước số liệu giả. Bạn hãy chọn 1 trong 2 cách dưới đây để bắt đầu:
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <label className="btn btn-secondary" style={{ cursor: 'pointer', padding: '0.65rem 1.25rem' }}>
                    <Upload size={16} /> 1. Tải nhiều file Word/PDF/Excel
                    <input type="file" multiple accept=".docx,.doc,.pdf,.xlsx,.xls,.txt,.csv" onChange={handleFileUpload} style={{ display: 'none' }} />
                  </label>
                  <button 
                    id="btn-add-first-task"
                    className="btn btn-primary"
                    style={{ padding: '0.65rem 1.25rem' }}
                    onClick={() => {
                      const newTask = {
                        id: 'CV_01',
                        job_name: '',
                        product: '',
                        unit: 'Văn bản',
                        quantity: 1,
                        minutes_per_sp: 60,
                        supp_hours: 0,
                        has_b2: false,
                        b2_before: 60,
                        b2_after: 40,
                        over_480_reason: '',
                        is_selected: true
                      };
                      setTasks([newTask]);
                      setEditingTask({ ...newTask, index: 0 });
                    }}
                  >
                    <Plus size={16} /> 2. Tự thêm việc thủ công
                  </button>
                </div>
              </div>
            ) : (
              <div className="task-grid">
                {tasks.map((task, idx) => (
                  <div key={task.id} className={`task-card ${task.is_selected ? 'selected' : ''}`}>
                    <input 
                      type="checkbox" 
                      checked={task.is_selected} 
                      onChange={(e) => {
                        const updated = [...tasks];
                        updated[idx].is_selected = e.target.checked;
                        setTasks(updated);
                      }}
                      style={{ width: '18px', height: '18px', marginRight: '1rem', cursor: 'pointer' }}
                    />
                    <div className="task-info">
                      <div className="task-title">{task.job_name || <i>(Chưa nhập tên công việc)</i>}</div>
                      <div className="task-tags">
                        {task.task_group && (
                          <span className="tag" style={{ background: '#ede9fe', color: '#5b21b6' }}>
                            Nhiệm vụ A1: {task.task_group}
                          </span>
                        )}
                        <span className="tag tag-product">SP: {task.product || 'Chưa có'}</span>
                        <span className="tag">ĐVT: {task.unit || 'SP'}</span>
                        <span className="tag">SL: {task.quantity || 1}/năm</span>
                        <span className="tag">Mã: {task.id}</span>
                        {task.source_doc && (
                          <span className="tag" style={{ background: '#f1f5f9', color: '#475569' }}>
                            Nguồn: {task.source_doc}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className="btn btn-ghost" 
                        style={{ padding: '0.35rem', color: '#4f46e5' }}
                        title="Sửa chi tiết công việc"
                        onClick={() => setEditingTask({ ...task, index: idx })}
                      >
                        <Edit3 size={15} />
                      </button>
                      <button 
                        className="btn btn-ghost" 
                        style={{ padding: '0.35rem', color: '#f43f5e' }}
                        title="Xóa công việc"
                        onClick={() => {
                          setTasks(tasks.filter((_, i) => i !== idx));
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="wizard-footer">
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                {tasks.filter(t => t.is_selected).length === 0 
                  ? "Chưa có công việc nào được chọn" 
                  : `Đã chọn ${tasks.filter(t => t.is_selected).length} công việc cho ${selectedVtvl}`}
              </span>
              <button 
                id="btn-next-to-step-2"
                className="btn btn-primary" 
                onClick={() => {
                  if (tasks.filter(t => t.is_selected).length === 0) {
                    alert("Vui lòng tải văn bản để AI bóc tách hoặc bấm [+ Thêm việc thủ công] trước khi sang Chặng 2!");
                    return;
                  }
                  setCurrentStep(2);
                }}
              >
                Tiếp tục sang Chặng 2 (Khai báo) <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: QUANTITY & DIGITAL IMPACT ================= */}
        {currentStep === 2 && (
          <div className="stage-card">
            <div className="stage-header">
              <div>
                <h2>Chặng 2: Khai báo Sản lượng (Biểu B1) & Tác động Chuyển đổi số (Biểu B2)</h2>
                <p>Nhập số liệu thực tế phát sinh trong kỳ chốt (01/10/2025 – 30/09/2026). Mỗi dòng chỉ cần điền 2 ô.</p>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0, whiteSpace: 'nowrap' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Tổng giờ hiện trạng (B1): <b>{totals.b1Hours}h</b></span>
                <br />
                <span style={{ fontSize: '0.8rem', color: '#059669' }}>Tiết kiệm do CĐS (B2): <b>-{totals.b2ReducedHours}h</b></span>
              </div>
            </div>

            {tasks.filter(t => t.is_selected).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3.5rem 2rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', margin: '1rem 0' }}>
                <AlertTriangle size={40} color="#f59e0b" style={{ margin: '0 auto 1rem auto' }} />
                <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b' }}>
                  Chưa có công việc nào được chọn ở Chặng 1
                </h4>
                <p style={{ fontSize: '0.875rem', color: '#64748b', maxWidth: '500px', margin: '0.5rem auto 1.5rem auto', lineHeight: 1.6 }}>
                  Vui lòng quay lại Chặng 1 để nạp văn bản cho AI bóc tách hoặc tự bấm [+ Thêm việc thủ công].
                </p>
                <button className="btn btn-primary" onClick={() => setCurrentStep(1)}>
                  <ArrowLeft size={16} /> Quay lại Chặng 1 để thêm việc
                </button>
              </div>
            ) : (
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40%' }}>Tên công việc & Sản phẩm</th>
                      <th style={{ width: '15%', textAlign: 'center' }}>Sản lượng (SP/năm)</th>
                      <th style={{ width: '15%', textAlign: 'center' }}>Thời gian thực (Phút/SP)</th>
                      <th style={{ width: '30%' }}>Tác động Chuyển đổi số (Biểu B2)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.filter(t => t.is_selected).map((task, idx) => (
                      <tr key={task.id}>
                        <td>
                          <div style={{ fontWeight: 600, color: '#1e293b' }}>{task.job_name || <i>(Chưa nhập tên)</i>}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                            Sản phẩm: <span style={{ color: '#0369a1' }}>{task.product || 'Chưa rõ'}</span> ({task.unit})
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <input 
                            type="number" 
                            className="form-input" 
                            style={{ width: '90px', textAlign: 'center', margin: '0 auto' }}
                            value={task.quantity}
                            min={1}
                            onChange={(e) => {
                              const updated = [...tasks];
                              const realIdx = tasks.findIndex(t => t.id === task.id);
                              updated[realIdx].quantity = Number(e.target.value);
                              setTasks(updated);
                            }}
                          />
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <input 
                            type="number" 
                            className="form-input" 
                            style={{ 
                              width: '90px', 
                              textAlign: 'center', 
                              margin: '0 auto',
                              borderColor: task.minutes_per_sp > 480 ? '#f59e0b' : '#e2e8f0' 
                            }}
                            value={task.minutes_per_sp}
                            min={1}
                            onChange={(e) => {
                              const updated = [...tasks];
                              const realIdx = tasks.findIndex(t => t.id === task.id);
                              updated[realIdx].minutes_per_sp = Number(e.target.value);
                              setTasks(updated);
                            }}
                          />
                          {task.minutes_per_sp > 480 && (
                            <div style={{ fontSize: '0.65rem', color: '#d97706', marginTop: '0.25rem' }}>
                              ⚠️ {'>'} 8h/SP (cần giải trình)
                            </div>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input 
                              type="checkbox" 
                              checked={task.has_b2}
                              id={`b2-toggle-${task.id}`}
                              onChange={(e) => {
                                const updated = [...tasks];
                                const realIdx = tasks.findIndex(t => t.id === task.id);
                                updated[realIdx].has_b2 = e.target.checked;
                                setTasks(updated);
                              }}
                            />
                            <label htmlFor={`b2-toggle-${task.id}`} style={{ fontSize: '0.8rem', cursor: 'pointer' }}>
                              Có áp dụng CĐS / phần mềm
                            </label>
                          </div>

                          {task.has_b2 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.4rem', fontSize: '0.75rem', background: '#f0fdf4', padding: '0.35rem 0.5rem', borderRadius: '6px' }}>
                              <span>Trước:</span>
                              <input 
                                type="number" 
                                className="form-input" 
                                style={{ width: '55px', padding: '0.2rem 0.35rem', fontSize: '0.75rem' }} 
                                value={task.b2_before}
                                onChange={(e) => {
                                  const updated = [...tasks];
                                  const realIdx = tasks.findIndex(t => t.id === task.id);
                                  updated[realIdx].b2_before = Number(e.target.value);
                                  setTasks(updated);
                                }}
                              />
                              <span>p ➔ Sau:</span>
                              <input 
                                type="number" 
                                className="form-input" 
                                style={{ width: '55px', padding: '0.2rem 0.35rem', fontSize: '0.75rem' }} 
                                value={task.b2_after}
                                onChange={(e) => {
                                  const updated = [...tasks];
                                  const realIdx = tasks.findIndex(t => t.id === task.id);
                                  updated[realIdx].b2_after = Number(e.target.value);
                                  setTasks(updated);
                                }}
                              />
                              <span>p</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="wizard-footer">
              <button className="btn btn-secondary" onClick={() => setCurrentStep(1)}>
                <ArrowLeft size={16} /> Quay lại Chặng 1
              </button>
              <button 
                id="btn-next-to-step-3"
                className="btn btn-primary" 
                onClick={() => setCurrentStep(3)}
              >
                Tiếp tục sang Chặng 3 (Tính toán) <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: CALCULATION & PERSONNEL ================= */}
        {currentStep === 3 && (
          <div className="stage-card">
            <div className="stage-header">
              <div>
                <h2>Chặng 3: Xác định Biên chế & Phân bổ Nhân lực (Biểu C3, D1, D2)</h2>
                <p>Hệ thống code thuần tự động tính toán theo công thức Hướng dẫn 07: FTE = Giờ ròng / 1.904 giờ chuẩn.</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>Phương pháp (C3):</span>
                <select
                  id="method-select"
                  className="form-select"
                  style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.82rem', fontWeight: 700, color: '#1e293b' }}
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                >
                  <option value="PP2">PP2 (Đo khối lượng giờ chuẩn 1.904h)</option>
                  <option value="PP1+PP2">PP1+PP2 (Khung quy định + Đo giờ — Lãnh đạo)</option>
                  <option value="PP1">PP1 (Theo quy định khung biên chế/chức danh)</option>
                  <option value="PP3">PP3 (Chuyên gia / So sánh tương đương)</option>
                </select>
              </div>
            </div>

            {/* 3-Tier Dashboard */}
            <div className="metric-dashboard">
              <div className="metric-card">
                <div className="metric-title">Tổng giờ lao động trực tiếp (B1 - B2)</div>
                <div className="metric-value">{totals.netHours} <span style={{ fontSize: '1rem', fontWeight: 500 }}>giờ</span></div>
                <div className="metric-sub">Hiện trạng: {totals.b1Hours}h | Giảm trừ CĐS: {totals.b2ReducedHours}h</div>
              </div>

              <div className="metric-card highlight">
                <div className="metric-title">Số người quy đổi PP2 (FTE)</div>
                <div className="metric-value" style={{ color: '#047857' }}>{totals.fte} <span style={{ fontSize: '1rem', fontWeight: 500 }}>người</span></div>
                <div className="metric-sub" style={{ color: '#b91c1c', fontWeight: 600 }}>⚠️ Giữ nguyên số lẻ, không được tự làm tròn lên!</div>
              </div>

              <div className="metric-card">
                <div className="metric-title">Đề xuất số người bố trí thực tế</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', overflow: 'hidden', flexShrink: 0 }}>
                    <button
                      type="button"
                      onClick={() => setSuggestedStaff(Math.max(0, Number(suggestedStaff || 0) - 1))}
                      style={{ border: 'none', background: '#f1f5f9', padding: '0.45rem 0.7rem', fontWeight: 800, fontSize: '1rem', color: '#334155', cursor: 'pointer' }}
                      title="Giảm 1 người"
                    >
                      −
                    </button>
                    <input
                      id="suggested-staff-input"
                      type="number"
                      min={0}
                      step={1}
                      value={suggestedStaff}
                      onChange={(e) => {
                        const val = e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value, 10) || 0);
                        setSuggestedStaff(val);
                      }}
                      style={{
                        width: '64px',
                        border: 'none',
                        textAlign: 'center',
                        fontSize: '1.1rem',
                        fontWeight: 800,
                        color: '#0f172a',
                        outline: 'none',
                        fontFamily: 'var(--font-mono)'
                      }}
                    />
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b', paddingRight: '0.6rem', whiteSpace: 'nowrap' }}>
                      người
                    </span>
                    <button
                      type="button"
                      onClick={() => setSuggestedStaff(Number(suggestedStaff || 0) + 1)}
                      style={{ border: 'none', background: '#f1f5f9', padding: '0.45rem 0.7rem', fontWeight: 800, fontSize: '1rem', color: '#334155', cursor: 'pointer' }}
                      title="Tăng 1 người"
                    >
                      +
                    </button>
                  </div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: suggestedStaff !== Math.round(totals.fte) ? '#d97706' : '#059669', whiteSpace: 'nowrap' }}>
                    {suggestedStaff !== Math.round(totals.fte) ? "⚠️ Cần giải trình lý do" : "✓ Khớp với số quy đổi"}
                  </span>
                </div>
              </div>
            </div>

            {/* Justification Box (When suggested != fte) */}
            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <label className="form-label" style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>
                  Thuyết minh giải trình lý do bố trí biên chế:
                </label>
                <button 
                  id="btn-auto-justify"
                  className="btn" 
                  style={{ 
                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)',
                    color: '#ffffff',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    padding: '0.5rem 1.15rem',
                    borderRadius: '9999px',
                    border: 'none',
                    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.45)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(99, 102, 241, 0.45)';
                  }}
                  onClick={handleAutoJustify}
                  disabled={loadingJustification}
                >
                  <Sparkles size={16} color="#ffffff" />
                  {loadingJustification ? "Groq đang soạn thảo văn bản..." : "Gợi ý giải trình hành chính (Groq AI)"}
                </button>
              </div>
              <textarea 
                id="justification-text-area"
                className="form-textarea" 
                rows={3} 
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Nhập lý do bố trí số người khác với số quy đổi (Ví dụ: Địa bàn xã rộng loại 1, nhiều vụ việc đột xuất, yêu cầu thường trực theo Phụ lục IV)..."
                style={{ fontSize: '0.9rem', lineHeight: 1.5 }}
              />
            </div>

            {/* Personnel Assignment (Biểu D1 - Quản lý nhân lực thực tế) */}
            <div style={{ marginTop: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e293b' }}>
                    Rà soát nhân lực hiện có & Kiêm nhiệm (Biểu D1 - Chốt tại 30/09/2026):
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>
                    Nhập danh sách cán bộ thực tế của đơn vị. Quỹ thời gian cá nhân trần: <b>1.904 giờ/người/năm</b>.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                  <button
                    id="btn-bulk-import-personnel"
                    className="btn btn-primary"
                    style={{ fontSize: '0.8rem', padding: '0.45rem 0.9rem', fontWeight: 700 }}
                    onClick={() => {
                      setBulkMainHours(totals.netHours || 1400);
                      setShowBulkPersonnelModal(true);
                    }}
                  >
                    <Users size={15} /> Nhập danh sách theo dòng
                  </button>
                  <button
                    id="btn-add-personnel"
                    className="btn btn-secondary"
                    style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem', color: '#4f46e5', borderColor: '#c7d2fe', background: '#eef2ff', fontWeight: 700 }}
                    onClick={() => {
                      const newPerson = {
                        id: `CB_${String(personnel.length + 1).padStart(2, '0')}`,
                        name: `Cán bộ ${personnel.length + 1}`,
                        main_hours: totals.netHours || 1400,
                        other_hours: 200
                      };
                      setPersonnel([...personnel, newPerson]);
                    }}
                  >
                    <Plus size={15} /> Thêm 1 Cán Bộ
                  </button>
                  {personnel.length > 0 && (
                    <button
                      type="button"
                      className="btn btn-ghost"
                      style={{ fontSize: '0.78rem', padding: '0.45rem 0.65rem', color: '#e11d48' }}
                      title="Xóa toàn bộ danh sách cán bộ"
                      onClick={() => {
                        if (window.confirm('Bạn có chắc muốn xóa toàn bộ danh sách cán bộ hiện tại?')) {
                          setPersonnel([]);
                        }
                      }}
                    >
                      <Trash2 size={14} /> Xóa hết
                    </button>
                  )}
                </div>
              </div>

              {personnel.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem 1.5rem', background: '#f8fafc', borderRadius: '14px', border: '2px dashed #cbd5e1', marginTop: '0.75rem' }}>
                  <Users size={36} color="#94a3b8" style={{ margin: '0 auto 0.75rem auto' }} />
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#334155' }}>Chưa có cán bộ nào được nhập</h4>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem', marginBottom: '1.25rem' }}>
                    Bạn có thể dán nhanh danh sách họ tên (mỗi người 1 dòng) hoặc thêm từng cán bộ để theo dõi quỹ giờ làm việc 1.904h.
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button
                      id="btn-empty-bulk-personnel"
                      className="btn btn-primary"
                      style={{ fontSize: '0.82rem', padding: '0.55rem 1.1rem' }}
                      onClick={() => {
                        setBulkMainHours(totals.netHours || 1400);
                        setShowBulkPersonnelModal(true);
                      }}
                    >
                      <Users size={15} /> Nhập danh sách theo dòng (Nhiều người)
                    </button>
                    <button
                      id="btn-add-first-personnel"
                      className="btn btn-secondary"
                      style={{ fontSize: '0.82rem', padding: '0.55rem 1rem' }}
                      onClick={() => {
                        const newPerson = {
                          id: 'CB_01',
                          name: '',
                          main_hours: totals.netHours || 1400,
                          other_hours: 0
                        };
                        setPersonnel([newPerson]);
                      }}
                    >
                      <Plus size={15} /> Thêm từng Cán Bộ
                    </button>
                  </div>
                </div>
              ) : (
                personnel.map((p, idx) => {
                  const totalH = (Number(p.main_hours) || 0) + (Number(p.other_hours) || 0);
                  const isOver = totalH > 1904.0;
                  return (
                    <div key={p.id} style={{ background: '#ffffff', border: `1px solid ${isOver ? '#fecdd3' : '#e2e8f0'}`, borderRadius: '12px', padding: '1.25rem', marginBottom: '0.85rem', boxShadow: 'var(--shadow-sm)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '1rem', alignItems: 'center' }}>
                        <div>
                          <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Họ và tên cán bộ:</label>
                          <input
                            type="text"
                            className="form-input"
                            style={{ marginTop: '0.25rem', fontWeight: 700, color: '#1e293b' }}
                            value={p.name}
                            placeholder="Ví dụ: Nguyễn Văn A, Trần Thị B..."
                            onChange={(e) => {
                              const updated = [...personnel];
                              updated[idx].name = e.target.value;
                              setPersonnel(updated);
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Giờ vị trí chính (h):</label>
                          <input
                            type="number"
                            className="form-input"
                            style={{ marginTop: '0.25rem' }}
                            value={p.main_hours}
                            min={0}
                            onChange={(e) => {
                              const updated = [...personnel];
                              updated[idx].main_hours = Number(e.target.value);
                              setPersonnel(updated);
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Giờ kiêm nhiệm (h):</label>
                          <input
                            type="number"
                            className="form-input"
                            style={{ marginTop: '0.25rem' }}
                            value={p.other_hours}
                            min={0}
                            onChange={(e) => {
                              const updated = [...personnel];
                              updated[idx].other_hours = Number(e.target.value);
                              setPersonnel(updated);
                            }}
                          />
                        </div>
                        <div style={{ paddingTop: '1.3rem' }}>
                          <button
                            className="btn btn-ghost"
                            style={{ color: '#f43f5e', padding: '0.45rem' }}
                            title="Xóa cán bộ này"
                            onClick={() => {
                              setPersonnel(personnel.filter((_, i) => i !== idx));
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', marginTop: '0.65rem' }}>
                        <span style={{ color: '#64748b' }}>
                          Mã định danh: <b>{p.id}</b> | Phân bổ: Vị trí chính ({p.main_hours}h) + Việc khác ({p.other_hours}h)
                        </span>
                        <span style={{ fontWeight: 800, color: isOver ? '#e11d48' : '#059669' }}>
                          {isOver ? `⚠️ QUÁ TẢI: ${totalH} / 1.904h (Dư ${Math.round((totalH - 1904) * 10) / 10}h)` : `✓ HỢP LỆ: ${totalH} / 1.904h`}
                        </span>
                      </div>

                      <div className="workload-bar-wrap" style={{ height: '9px', marginTop: '0.45rem' }}>
                        <div 
                          className="workload-bar-fill" 
                          style={{ 
                            width: `${Math.min(100, (totalH / 1904.0) * 100)}%`,
                            background: isOver 
                              ? 'linear-gradient(90deg, #f43f5e, #be123c)' 
                              : 'linear-gradient(90deg, #10b981, #059669)'
                          }} 
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="wizard-footer">
              <button className="btn btn-secondary" onClick={() => setCurrentStep(2)}>
                <ArrowLeft size={16} /> Quay lại Chặng 2
              </button>
              <button 
                id="btn-next-to-step-4"
                className="btn btn-primary" 
                onClick={() => {
                  setCurrentStep(4);
                  handleRunValidation();
                }}
              >
                Tiếp tục sang Chặng 4 (Thẩm định) <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 4: PRE-FLIGHT VALIDATION & EXPORT ================= */}
        {currentStep === 4 && (
          <div className="stage-card">
            <div className="stage-header">
              <div>
                <h2>Chặng 4: Rà soát 13 Lỗi Nghiệp vụ & Xuất File Phôi Chuẩn (Sheet 13. K_KiemTra)</h2>
                <p>Hệ thống tự động quét 13 lỗi phổ biến. Đảm bảo hồ sơ đạt chuẩn 100% trước khi xuất Excel.</p>
              </div>
              <button 
                id="btn-re-validate"
                className="btn btn-secondary" 
                onClick={handleRunValidation}
                disabled={validating}
              >
                <RefreshCw size={15} />
                {validating ? "Đang quét..." : "Quét lại hồ sơ"}
              </button>
            </div>

            {/* Validation Results Banner */}
            {validationResult && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '1rem', 
                  padding: '1.25rem', 
                  borderRadius: '12px',
                  background: validationResult.is_valid ? '#ecfdf5' : '#fff1f2',
                  border: `1px solid ${validationResult.is_valid ? '#a7f3d0' : '#fecdd3'}`
                }}>
                  {validationResult.is_valid ? (
                    <CheckCircle2 size={36} color="#059669" />
                  ) : (
                    <AlertTriangle size={36} color="#e11d48" />
                  )}
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: validationResult.is_valid ? '#065f46' : '#9f1239' }}>
                      {validationResult.summary_status}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: validationResult.is_valid ? '#047857' : '#be123c', marginTop: '0.2rem' }}>
                      {validationResult.is_valid 
                        ? "Hồ sơ của bạn đã vượt qua toàn bộ 13 tiêu chí kiểm tra của Ban Tổ chức Trung ương. Sẵn sàng xuất file!"
                        : `Phát hiện ${validationResult.total_errors} lỗi cần xử lý và ${validationResult.total_warnings} cảnh báo trước khi nộp.`}
                    </p>
                  </div>
                </div>

                {/* List of Errors */}
                {validationResult.errors && validationResult.errors.length > 0 && (
                  <div style={{ marginTop: '1rem' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#9f1239', marginBottom: '0.5rem' }}>
                      Các lỗi bắt buộc phải sửa:
                    </h4>
                    {validationResult.errors.map((err, idx) => (
                      <div key={idx} className="validation-error-card">
                        <XCircle size={18} color="#e11d48" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div style={{ flex: 1, fontSize: '0.85rem', color: '#881337' }}>
                          <b>[{err.sheet}]</b> {err.message}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* List of Warnings */}
                {validationResult.warnings && validationResult.warnings.length > 0 && (
                  <div style={{ marginTop: '1rem' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#92400e', marginBottom: '0.5rem' }}>
                      Cảnh báo nghiệp vụ cần lưu ý:
                    </h4>
                    {validationResult.warnings.map((warn, idx) => (
                      <div key={idx} className="validation-warning-card">
                        <AlertTriangle size={18} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div style={{ flex: 1, fontSize: '0.85rem', color: '#78350f' }}>
                          <b>[{warn.sheet}]</b> {warn.message}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Export Section */}
            <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <FileSpreadsheet size={48} color="#4f46e5" style={{ margin: '0 auto 1rem auto' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                Xuất File Excel Chuẩn Nộp {agencyType === 'party' ? "Ban Tổ Chức Cấp Ủy" : "Sở Nội Vụ"}
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#64748b', maxWidth: '600px', margin: '0.5rem auto 1.5rem auto' }}>
                Dữ liệu được bơm trực tiếp vào đúng các ô trắng của template chuẩn <b>03. Bo bieu VTVL 19-10-2026.xlsx</b>, bảo toàn 100% công thức ô xám và tính toàn vẹn của tệp thẩm định.
              </p>

              <button 
                id="btn-export-excel"
                className="btn btn-success" 
                style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}
                onClick={handleExportExcel}
                disabled={exporting}
              >
                <Download size={18} />
                {exporting ? "Đang đổ dữ liệu vào phôi Excel..." : "Tải Về File Excel Đề Án Chuẩn"}
              </button>
            </div>

            <div className="wizard-footer">
              <button className="btn btn-secondary" onClick={() => setCurrentStep(3)}>
                <ArrowLeft size={16} /> Quay lại Chặng 3
              </button>
            </div>
          </div>
        )}
        </main>
      </div>

      {/* Modal Chỉnh Sửa Chi Tiết Công Việc (Biểu A2) - Thiết kế cao cấp */}
      {editingTask && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 120, padding: '1.25rem'
        }}>
          <div style={{
            background: 'white', borderRadius: '20px', maxWidth: '640px', width: '100%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid #e2e8f0',
            animation: 'fadeIn 0.2s ease-out', overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{ padding: '1.25rem 1.75rem', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ background: '#e0e7ff', color: '#4338ca', fontWeight: 800, fontSize: '0.75rem', padding: '0.2rem 0.55rem', borderRadius: '6px' }}>
                    {editingTask.id}
                  </span>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>Chỉnh Sửa Chi Tiết Công Việc</h3>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                  Chuẩn hóa theo Hướng dẫn 07: [Động từ] + [Đối tượng] + [Sản phẩm đầu ra]
                </p>
              </div>
              <button 
                className="btn btn-ghost" 
                style={{ padding: '0.35rem', borderRadius: '50%' }}
                onClick={() => setEditingTask(null)}
              >
                <XCircle size={22} color="#64748b" />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem 1.75rem' }}>
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>Tên công việc (Biểu A2):</label>
                  <button
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem', color: '#4f46e5', borderColor: '#c7d2fe', background: '#eef2ff' }}
                    disabled={formattingAI}
                    onClick={async () => {
                      if (!editingTask.job_name) return;
                      setFormattingAI(true);
                      try {
                        const res = await fetch(`${API_BASE}/api/format-task`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ raw_text: editingTask.job_name })
                        });
                        const data = await res.json();
                        setEditingTask({
                          ...editingTask,
                          job_name: data.job_name || editingTask.job_name,
                          product: data.product || editingTask.product,
                          unit: data.unit || editingTask.unit
                        });
                      } catch (err) {
                        alert("Lỗi chuẩn hóa: " + err.message);
                      } finally {
                        setFormattingAI(false);
                      }
                    }}
                  >
                    <Sparkles size={13} />
                    {formattingAI ? "Đang chuẩn hóa..." : "Groq AI Chuẩn hóa cú pháp"}
                  </button>
                </div>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={editingTask.job_name}
                  onChange={(e) => setEditingTask({ ...editingTask, job_name: e.target.value })}
                  placeholder="Ví dụ: Soạn thảo tờ trình đề nghị ban hành quyết định hành chính..."
                  style={{ fontSize: '0.9rem', lineHeight: 1.5 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1rem', marginTop: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Sản phẩm đầu ra:</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingTask.product || ''}
                    onChange={(e) => setEditingTask({ ...editingTask, product: e.target.value })}
                    placeholder="Ví dụ: Tờ trình, Báo cáo, Kế hoạch..."
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Đơn vị tính:</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingTask.unit || ''}
                    onChange={(e) => setEditingTask({ ...editingTask, unit: e.target.value })}
                    placeholder="Ví dụ: Tờ trình, Báo cáo, Hồ sơ..."
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Sản lượng kỳ (SP/năm):</label>
                  <input
                    type="number"
                    className="form-input"
                    value={editingTask.quantity || 1}
                    min={1}
                    onChange={(e) => setEditingTask({ ...editingTask, quantity: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Thời gian thực (Phút/SP):</label>
                  <input
                    type="number"
                    className="form-input"
                    value={editingTask.minutes_per_sp || 60}
                    min={1}
                    onChange={(e) => setEditingTask({ ...editingTask, minutes_per_sp: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '1rem 1.75rem', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => setEditingTask(null)}
              >
                Hủy bỏ
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  const updated = [...tasks];
                  const idx = editingTask.index !== undefined ? editingTask.index : tasks.findIndex(t => t.id === editingTask.id);
                  if (idx !== -1) {
                    updated[idx] = {
                      ...updated[idx],
                      job_name: editingTask.job_name,
                      product: editingTask.product,
                      unit: editingTask.unit,
                      quantity: editingTask.quantity,
                      minutes_per_sp: editingTask.minutes_per_sp
                    };
                    setTasks(updated);
                  }
                  setEditingTask(null);
                }}
              >
                Lưu Thay Đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nhập Nhanh Danh Sách Cán Bộ Theo Dòng (Biểu D1) */}
      {showBulkPersonnelModal && (() => {
        const parsedNames = bulkPersonnelText
          .split(/\r?\n/)
          .map(line => line.replace(/^\s*(?:\d+[\.\)\-\s]+|[\-\*\•\+]\s+)/, '').trim())
          .filter(Boolean);

        const handleInsertPersonnel = (replaceExisting = false) => {
          if (parsedNames.length === 0) {
            alert('Vui lòng nhập hoặc dán ít nhất 1 họ tên cán bộ!');
            return;
          }
          const baseList = replaceExisting ? [] : personnel;
          const totalPeopleCount = baseList.length + parsedNames.length;
          const perPersonMainHours = bulkSplitEvenly && totals.netHours > 0
            ? Math.round((totals.netHours / parsedNames.length) * 10) / 10
            : (Number(bulkMainHours) || 0);

          const newEntries = parsedNames.map((fullName, idx) => ({
            id: `CB_${String(baseList.length + idx + 1).padStart(2, '0')}`,
            name: fullName,
            main_hours: perPersonMainHours,
            other_hours: Number(bulkOtherHours) || 0
          }));

          const updatedList = [...baseList, ...newEntries];
          setPersonnel(updatedList);
          setSuggestedStaff(totalPeopleCount);
          setBulkPersonnelText('');
          setShowBulkPersonnelModal(false);
        };

        return (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 125, padding: '1.25rem'
          }}>
            <div style={{
              background: 'white', borderRadius: '20px', maxWidth: '620px', width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid #e2e8f0',
              animation: 'fadeIn 0.2s ease-out', overflow: 'hidden'
            }}>
              {/* Header */}
              <div style={{ padding: '1.25rem 1.75rem', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ background: '#e0e7ff', color: '#4338ca', fontWeight: 800, fontSize: '0.75rem', padding: '0.2rem 0.55rem', borderRadius: '6px' }}>
                      Biểu D1
                    </span>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>Nhập Nhanh Danh Sách Cán Bộ</h3>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                    Nhập hoặc copy/paste từ Excel, Word — mỗi dòng 1 họ tên cán bộ (tự động lọc bỏ số thứ tự đầu dòng).
                  </p>
                </div>
                <button
                  className="btn btn-ghost"
                  style={{ padding: '0.35rem', borderRadius: '50%' }}
                  onClick={() => setShowBulkPersonnelModal(false)}
                >
                  <XCircle size={22} color="#64748b" />
                </button>
              </div>

              {/* Body */}
              <div style={{ padding: '1.5rem 1.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>
                    Danh sách họ và tên cán bộ ({parsedNames.length} người):
                  </label>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ fontSize: '0.74rem', padding: '0.25rem 0.6rem', color: '#4f46e5', borderColor: '#c7d2fe', background: '#eef2ff' }}
                      onClick={() => {
                        setBulkPersonnelText(
                          "Nguyễn Văn Thạch\nPhạm Thị Nga\nMai Thế Sỹ\nPhạm Bá Luyến\nMai Đình Dũng\nTrịnh Thị Giang\nMai Thị San\nVũ Văn Nghiêm\nNguyễn Văn Điều"
                        );
                      }}
                    >
                      <Users size={13} /> Điền mẫu 9 cán bộ MTTQ xã Hồ Vương
                    </button>
                    <label className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem', cursor: 'pointer' }}>
                      <Upload size={13} /> Nạp từ file .txt / .csv
                    <input
                      type="file"
                      accept=".txt,.csv"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          const content = String(ev.target?.result || '');
                          setBulkPersonnelText(prev => (prev ? `${prev}\n${content}` : content));
                        };
                        reader.readAsText(file, 'utf-8');
                        e.target.value = '';
                      }}
                    />
                  </label>
                  </div>
                </div>

                <textarea
                  id="bulk-personnel-textarea"
                  className="form-textarea"
                  rows={6}
                  autoFocus
                  value={bulkPersonnelText}
                  onChange={(e) => setBulkPersonnelText(e.target.value)}
                  placeholder={"Nguyễn Văn A\nTrần Thị B\nLê Hoàng C\nPhạm Minh D..."}
                  style={{ fontSize: '0.92rem', lineHeight: 1.6 }}
                />

                {/* Thiết lập giờ mặc định khi tạo danh sách */}
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0.9rem 1rem', marginTop: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <input
                      id="bulk-split-evenly-checkbox"
                      type="checkbox"
                      checked={bulkSplitEvenly}
                      onChange={(e) => setBulkSplitEvenly(e.target.checked)}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <label htmlFor="bulk-split-evenly-checkbox" style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                      Tự động chia đều tổng giờ vị trí chính ({totals.netHours}h) cho {parsedNames.length || 1} cán bộ
                      {totals.netHours > 0 && parsedNames.length > 0 && (
                        <span style={{ color: '#4f46e5', marginLeft: '0.35rem' }}>
                          ({Math.round((totals.netHours / parsedNames.length) * 10) / 10}h/người)
                        </span>
                      )}
                    </label>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>
                        Giờ vị trí chính mặc định (h/người):
                      </label>
                      <input
                        type="number"
                        className="form-input"
                        min={0}
                        disabled={bulkSplitEvenly && totals.netHours > 0}
                        value={bulkSplitEvenly && totals.netHours > 0
                          ? (parsedNames.length > 0 ? Math.round((totals.netHours / parsedNames.length) * 10) / 10 : totals.netHours)
                          : bulkMainHours}
                        onChange={(e) => setBulkMainHours(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>
                        Giờ kiêm nhiệm mặc định (h/người):
                      </label>
                      <input
                        type="number"
                        className="form-input"
                        min={0}
                        value={bulkOtherHours}
                        onChange={(e) => setBulkOtherHours(Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div style={{ padding: '1rem 1.75rem', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Đồng thời cập nhật số người bố trí thực tế = tổng số cán bộ
                </span>
                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowBulkPersonnelModal(false)}
                  >
                    Hủy bỏ
                  </button>
                  {personnel.length > 0 && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ color: '#4f46e5', borderColor: '#c7d2fe', background: '#eef2ff' }}
                      onClick={() => handleInsertPersonnel(true)}
                    >
                      Thay thế danh sách cũ ({parsedNames.length})
                    </button>
                  )}
                  <button
                    id="btn-confirm-bulk-personnel"
                    className="btn btn-primary"
                    onClick={() => handleInsertPersonnel(false)}
                  >
                    <Plus size={16} /> Chèn {parsedNames.length > 0 ? `${parsedNames.length} cán bộ` : 'vào danh sách'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Settings Modal */}
      {showSettings && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', maxWidth: '520px', width: '90%', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.2)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>Cấu hình AI (Gemini & Groq)</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              Cấu hình được <b>lưu tự động trên trình duyệt khi tải lại trang (reload)</b>. Nếu để trống trên giao diện, hệ thống sẽ tự động dùng cấu hình dự phòng từ file <code>backend/.env</code>.
            </p>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label className="form-label" style={{ margin: 0 }}>Google AI Studio (Gemini API Key):</label>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  padding: '0.15rem 0.5rem',
                  borderRadius: '999px',
                  background: geminiKey.trim() ? '#e0e7ff' : (aiStatus.env_has_gemini ? '#dcfce7' : '#f1f5f9'),
                  color: geminiKey.trim() ? '#4338ca' : (aiStatus.env_has_gemini ? '#15803d' : '#64748b')
                }}>
                  {geminiKey.trim()
                    ? 'Đang dùng Key giao diện (Đã lưu)'
                    : (aiStatus.env_has_gemini ? 'Đang Fallback từ .env' : 'Chưa cấu hình Key')}
                </span>
              </div>
              <input 
                id="gemini-key-input"
                type="password" 
                className="form-input" 
                placeholder={aiStatus.env_has_gemini ? "Đang dùng key từ file .env (Nhập để ghi đè)..." : "AIzaSy... (Bỏ trống sẽ fallback về .env)"}
                value={geminiKey} 
                onChange={(e) => setGeminiKey(e.target.value)} 
              />
              <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', marginTop: '0.25rem' }}>
                Phụ trách bóc tách tài liệu PDF/Word dài hàng chục trang.
              </span>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label className="form-label" style={{ margin: 0 }}>Groq API Key (Tùy chọn):</label>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  padding: '0.15rem 0.5rem',
                  borderRadius: '999px',
                  background: groqKey.trim() ? '#e0e7ff' : (aiStatus.env_has_groq ? '#dcfce7' : '#f1f5f9'),
                  color: groqKey.trim() ? '#4338ca' : (aiStatus.env_has_groq ? '#15803d' : '#64748b')
                }}>
                  {groqKey.trim()
                    ? 'Đang dùng Key giao diện (Đã lưu)'
                    : (aiStatus.env_has_groq ? 'Đang Fallback từ .env' : 'Chưa cấu hình Key')}
                </span>
              </div>
              <input 
                id="groq-key-input"
                type="password" 
                className="form-input" 
                placeholder={aiStatus.env_has_groq ? "Đang dùng key từ file .env (Nhập để ghi đè)..." : "gsk_... (Bỏ trống sẽ fallback về .env)"}
                value={groqKey} 
                onChange={(e) => setGroqKey(e.target.value)} 
              />
              <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', marginTop: '0.25rem' }}>
                Tăng tốc độ phản hồi sub-second khi chuẩn hóa tên việc và viết thuyết minh.
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                className="btn btn-ghost"
                style={{ fontSize: '0.78rem', color: '#64748b', padding: '0.45rem 0.75rem' }}
                onClick={async () => {
                  setGeminiKey('');
                  setGroqKey('');
                  localStorage.removeItem('vtvl_gemini_key');
                  localStorage.removeItem('vtvl_groq_key');
                  try {
                    const res = await fetch(`${API_BASE}/api/settings`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ gemini_key: '', groq_key: '' })
                    });
                    if (res.ok) {
                      const data = await res.json();
                      setAiStatus(data);
                    }
                  } catch (e) {
                    // ignore
                  }
                }}
              >
                Xóa key FE (Dùng .env)
              </button>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn btn-secondary" onClick={() => setShowSettings(false)}>Đóng</button>
                <button 
                  id="btn-save-keys"
                  className="btn btn-primary" 
                  onClick={async () => {
                    const cleanGemini = geminiKey.trim();
                    const cleanGroq = groqKey.trim();
                    localStorage.setItem('vtvl_gemini_key', cleanGemini);
                    localStorage.setItem('vtvl_groq_key', cleanGroq);
                    setGeminiKey(cleanGemini);
                    setGroqKey(cleanGroq);
                    try {
                      const res = await fetch(`${API_BASE}/api/settings`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ gemini_key: cleanGemini, groq_key: cleanGroq })
                      });
                      if (res.ok) {
                        const data = await res.json();
                        setAiStatus(data);
                      }
                      alert("Đã lưu cấu hình AI thành công (Tự động giữ lại khi reload trang)!");
                      setShowSettings(false);
                    } catch (e) {
                      alert("Đã lưu vào trình duyệt, nhưng chưa kết nối được Backend: " + e.message);
                    }
                  }}
                >
                  Lưu cấu hình
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
