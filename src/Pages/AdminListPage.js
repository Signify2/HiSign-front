import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import FindInPageIcon from '@mui/icons-material/FindInPage';
import SearchIcon from '@mui/icons-material/Search';
import { Box, Button, Modal, Pagination, Typography } from "@mui/material";
import { saveAs } from "file-saver";
import moment from 'moment';
import { useEffect, useState } from "react";
import { Dropdown } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import * as XLSX from "xlsx";
import AdminListToolbar, { AdminListDownloadButtons } from "../components/ListPage/AdminListToolbar";
import { PageContainer } from "../components/PageContainer";
import { loginMemberState } from "../recoil/atom/loginMemberState";
import { DOCUMENT_TYPE_FILTER_ALL, DOCUMENT_TYPES } from "../config/documentTypes";
import ApiService from "../utils/ApiService";
import { downloadPDF, downloadZip } from "../utils/DownloadUtils";
import {
    getDocumentTypeFilterOptions,
    matchesDocumentTypeFilter,
} from "../utils/documentTypeUtils";

const CURRENT_YEAR = String(new Date().getFullYear());
const MONTH_FILTER_ALL = "all";
const CURRENT_MONTH = String(new Date().getMonth() + 1).padStart(2, "0");
const ITEMS_PER_PAGE = 10;
const SORT_KEY_WORK_DATE = "workDate";

// 로컬스토리지에 남아 있을 수 있는 예전 월 형식("1월", "1")도 현재 포맷("01")으로 맞춘다.
const normalizeMonthFilter = (value, fallback = CURRENT_MONTH) => {
    if (!value) return fallback;
    if (value === MONTH_FILTER_ALL) return MONTH_FILTER_ALL;

    const matchedMonth = String(value).trim().match(/^(\d{1,2})(?:월)?$/);
    if (!matchedMonth) return fallback;

    const monthNumber = Number(matchedMonth[1]);
    if (monthNumber < 1 || monthNumber > 12) return fallback;

    return String(monthNumber).padStart(2, "0");
};

const getInitialYearFilter = () => {
    const stored = localStorage.getItem("admin_yearFilter");
    if (!stored || stored === "all") return CURRENT_YEAR;
    return stored;
};

const getInitialMonthFilter = () => {
    const stored = localStorage.getItem("admin_monthFilter");
    return normalizeMonthFilter(stored);
};

const normalizeSortKey = (value) => {
    if (value === "createdAt" || value === "expiredAt" || value === "updatedAt") return value;
    return SORT_KEY_WORK_DATE;
};

const getWorkDateMoment = (doc) => {
    const requestName = String(doc?.requestName ?? "");
    const matched = requestName.match(/(?:^|_)(\d{4})_(\d{1,2})월(?:_|$)/);

    if (matched) {
        const [, year, month] = matched;
        const workDate = moment(`${year}-${month}-01`, "YYYY-M-DD", true);

        if (workDate.isValid()) {
            return workDate;
        }
    }

    const fallbackDate = moment(doc?.createdAt);
    return fallbackDate.isValid() ? fallbackDate : moment.invalid();
};

const getFilterDateMoment = (doc, sortKey) => {
    if (sortKey === SORT_KEY_WORK_DATE) {
        return getWorkDateMoment(doc);
    }

    const filterDate = moment(doc?.[sortKey]);
    return filterDate.isValid() ? filterDate : moment.invalid();
};

const AdminDocuments = () => {
    const loginMember = useRecoilValue(loginMemberState);
    const navigate = useNavigate();
    const [documents, setDocuments] = useState([]);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [viewMode, setViewMode] = useState("list");
    const [selectedDocs, setSelectedDocs] = useState([]);
    const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 1200);
    const [searchQuery, setSearchQuery] = useState(localStorage.getItem("admin_searchQuery") || "");
    const [sortKey, setSortKey] = useState(() => normalizeSortKey(localStorage.getItem("admin_sortKey")));
    const [sortOrder, setSortOrder] = useState(localStorage.getItem("admin_sortOrder") || "desc");
    const [statusFilter, setStatusFilter] = useState(localStorage.getItem("admin_statusFilter") || 'all');
    const [documentTypeFilter, setDocumentTypeFilter] = useState(
        localStorage.getItem("admin_documentTypeFilter") || DOCUMENT_TYPE_FILTER_ALL
    );
    const [yearFilter, setYearFilter] = useState(getInitialYearFilter);
    const [monthFilter, setMonthFilter] = useState(getInitialMonthFilter);

    useEffect(() => {
        // 필터 상태를 유지해서 페이지를 벗어났다가 돌아와도 같은 목록을 보게 한다.
        localStorage.setItem("admin_yearFilter", yearFilter);
        localStorage.setItem("admin_monthFilter", monthFilter);
        localStorage.setItem("admin_statusFilter", statusFilter);
        localStorage.setItem("admin_documentTypeFilter", documentTypeFilter);
        localStorage.setItem("admin_sortKey", sortKey);
        localStorage.setItem("admin_sortOrder", sortOrder);
    }, [yearFilter, monthFilter, statusFilter, documentTypeFilter, sortKey, sortOrder]);

    useEffect(() => {
        // 조건이 바뀌면 현재 페이지가 범위를 벗어날 수 있으므로 첫 페이지로 되돌린다.
        setCurrentPage(1);
    }, [yearFilter, monthFilter, statusFilter, documentTypeFilter, sortKey, sortOrder, searchQuery]);

    useEffect(() => {
        const handleResize = () => setIsMobileView(window.innerWidth <= 1200);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        if (!loginMember) return;
        const role = loginMember.role?.trim().toUpperCase();
        if (role !== "ROLE_ADMIN") {
            alert("관리자만 접근 가능합니다.");
            navigate("/", { replace: true });
        }
    }, [loginMember, navigate]);

    useEffect(() => {
        if (!loginMember || loginMember.role?.trim().toUpperCase() !== "ROLE_ADMIN") return;

        // 관리자 화면에서는 삭제된 상태(status 5)를 제외한 문서만 목록에 올린다.
        ApiService.fetchDocuments("admin")
            .then((response) => {
                const filteredDocuments = response.data.filter(doc => doc.status !== 5);
                setDocuments(filteredDocuments);
            })
            .catch((error) => {
                console.error("문서 불러오기 오류:", error);
                setError("문서를 불러오는 중 문제가 발생했습니다: " + error.message);
            });
    }, [loginMember]);

    const getStatusLabel = (status) => {
        const statusLabels = {
            0: "서명중",
            1: "완료",
            2: "반려",
            3: "취소",
            4: "만료",
            6: "반려",
            7: "검토중",
            8: "작성자 서명중"
        };
        return statusLabels[status] || "알 수 없음";
    };

    const getStatusStyle = (status) => {
        const statusStyles = {
            0: { backgroundColor: "#5ec9f3", color: "#fff" },
            1: { backgroundColor: "#2ecc71", color: "#fff" },
            2: { backgroundColor: "#f5a623", color: "#fff" },
            3: { backgroundColor: "#f0625d", color: "#fff" },
            4: { backgroundColor: "#555555", color: "#fff" },
            6: { backgroundColor: "#f5a623", color: "#fff" },
            7: { backgroundColor: "#b6c3f2", color: "#fff" },
            8: { backgroundColor: "#3412f3ff", color: "#fff" },
        };
        return statusStyles[status] || { backgroundColor: "#ccc", color: "#000" };
    };

    const StatusBadge = ({ status }) => {
        const label = getStatusLabel(status);
        const style = {
            ...getStatusStyle(status),
            borderRadius: "12px",
            padding: "2px 10px",
            fontSize: "13px",
            fontWeight: 600,
            display: "inline-block",
            whiteSpace: "nowrap",
            minWidth: "50px",
            textAlign: "center",
        };
        return <span style={style}>{label}</span>;
    };

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const yearOptions = Array.from(
        new Set([
            CURRENT_YEAR,
            ...documents.flatMap((doc) => {
                const candidates = [
                    getWorkDateMoment(doc),
                    moment(doc.createdAt),
                    moment(doc.updatedAt),
                    moment(doc.expiredAt),
                ];

                return candidates
                    .filter((date) => date.isValid())
                    .map((date) => date.format("YYYY"));
            }),
        ])
    ).sort((a, b) => Number(b) - Number(a));

    const documentTypeFilterOptions = getDocumentTypeFilterOptions();

    // 화면에 보여줄 목록은 검색어, 문서 종류, 연/월, 상태, 정렬 조건을 한 번에 반영해 계산한다.
    const filteredDocuments = documents
        .filter(doc => doc.requestName.toLowerCase().includes(searchQuery.toLowerCase()))
        .filter((doc) => matchesDocumentTypeFilter(doc.type, documentTypeFilter))
        .filter((doc) => {
            const filterDate = getFilterDateMoment(doc, sortKey);
            return filterDate.isValid() && filterDate.format("YYYY") === yearFilter;
        })
        .filter((doc) => {
            if (statusFilter === "all") return true;
            if (statusFilter === "rejected") return doc.status === 2 || doc.status === 6;
            return String(doc.status) === statusFilter;
        })
        .filter((doc) => {
            if (monthFilter === MONTH_FILTER_ALL) return true;
            const selectedMonth = Number(monthFilter);
            const filterDate = getFilterDateMoment(doc, sortKey);
            return filterDate.isValid() && filterDate.month() + 1 === selectedMonth;
        })

        .sort((a, b) => {
            const dateA = getFilterDateMoment(a, sortKey);
            const dateB = getFilterDateMoment(b, sortKey);
            const timeA = dateA.isValid() ? dateA.valueOf() : 0;
            const timeB = dateB.isValid() ? dateB.valueOf() : 0;

            const result = timeB - timeA;
            return sortOrder === "desc" ? result : -result;
        });

    const filteredDocumentIds = new Set(filteredDocuments.map((doc) => doc.id));
    // 선택 상태는 유지하되, 현재 필터 결과에 포함된 문서만 후속 작업 대상으로 본다.
    const selectedFilteredDocs = selectedDocs.filter((doc) => filteredDocumentIds.has(doc.id));

    const toggleSelectDoc = (doc) => {
        setSelectedDocs(prev =>
            prev.some(d => d.id === doc.id)
                ? prev.filter(d => d.id !== doc.id)
                : [...prev, doc]
        );
    };

    const areAllSelected = selectedFilteredDocs.length === filteredDocuments.length && filteredDocuments.length > 0;
    const toggleSelectAllDocs = () => {
        setSelectedDocs((prev) => {
            const outsideFilteredDocs = prev.filter((doc) => !filteredDocumentIds.has(doc.id));

            if (areAllSelected) {
                return outsideFilteredDocs;
            }

            return [...outsideFilteredDocs, ...filteredDocuments];
        });
    };

    const downloadableDocs = selectedFilteredDocs.filter((doc) => doc.status === 1);
    const isDownloadable = downloadableDocs.length > 0;

    const handleBulkDownload = () => {
        if (selectedFilteredDocs.length === 0) {
            alert("선택된 문서가 없습니다.");
            return;
        }

        if (!isDownloadable) {
            alert("서명이 완료된 문서를 선택해주세요.");
            return;
        }

        const shouldDownload = window.confirm("서명 완료 문서만 다운로드 합니다.");
        if (!shouldDownload) return;

        downloadZip(downloadableDocs.map((doc) => doc.id));
    };

    const handleTaExcelDownload = async () => {
        if (selectedFilteredDocs.length === 0) {
            alert("선택된 문서가 없습니다.");
            return;
        }
        try {
            const getDocumentTypeLabel = (type) => {
                const found = DOCUMENT_TYPES.find(t => t.typeValue === type);
                return found ? found.label : type || "알 수 없음";
            };

            const signersMap = {};
            await Promise.all(
                selectedFilteredDocs.map(async (doc) => {
                    try {
                        const signers = await ApiService.fetchSignersByDocument(doc.id);
                        signersMap[doc.id] = signers;
                    } catch {
                        signersMap[doc.id] = [];
                    }
                })
            );

            const toRow = (doc) => {
                const signerList = signersMap[doc.id] || [];
                const signerInfo = signerList.length > 0
                    ? signerList.map(s =>
                        `${s.name}(${s.email}) - ${s.status === 1 ? `서명 완료 (${moment(s.signedAt).format("YYYY-MM-DD HH:mm")})` : "서명 전"}`
                    ).join(", ")
                    : "-";

                return {
                    "과목명": doc.requestName,
                    "상태": getStatusLabel(doc.status),
                    "생성일": moment(doc.createdAt).format("YYYY/MM/DD"),
                    "만료일": moment(doc.expiredAt).format("YYYY/MM/DD HH:mm"),
                    "요청자": doc.requesterName || "알 수 없음",
                    "서명자 정보": signerInfo,
                };
            };

            const workbook = XLSX.utils.book_new();
            DOCUMENT_TYPES.forEach(({ typeValue, label }) => {
                const docs = selectedFilteredDocs.filter(doc => doc.type === typeValue);
                if (docs.length === 0) return;
                const worksheet = XLSX.utils.json_to_sheet(docs.map(toRow));
                XLSX.utils.book_append_sheet(workbook, worksheet, label);
            });

            const unknownDocs = selectedFilteredDocs.filter(
                doc => !DOCUMENT_TYPES.some(t => t.typeValue === doc.type)
            );
            if (unknownDocs.length > 0) {
                const worksheet = XLSX.utils.json_to_sheet(unknownDocs.map(toRow));
                XLSX.utils.book_append_sheet(workbook, worksheet, "기타");
            }

            const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
            const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
            const fileName = monthFilter === MONTH_FILTER_ALL
                ? "작업현황.xlsx"
                : `${Number(monthFilter)}월_작업현황.xlsx`;

            saveAs(blob, fileName);
        } catch (err) {
            console.error("TA 엑셀 생성 오류:", err);
            alert("TA 엑셀 다운로드 중 오류가 발생했습니다.");
        }
    };

    const [signers, setSigners] = useState([]);
    const [showSignersModal, setShowSignersModal] = useState(false);

    // 상세 화면으로 이동하지 않고도 서명 진행 상황을 바로 확인할 수 있게 별도 조회한다.
    const handleSearchClick = (docId) => {
        ApiService.fetchSignersByDocument(docId)
            .then((response) => {
                setSigners(response);
                setShowSignersModal(true);
            })
            .catch(() => {
                alert("서명자 정보를 불러오는데 실패했습니다.");
            });
    };

    const [openDropdownId, setOpenDropdownId] = useState(null);

    const toggleDropdown = (id) => {
        setOpenDropdownId((prevId) => (prevId === id ? null : id));
    };


    return (
        <PageContainer>
            <h1 style={{
                textAlign: "center",
                marginBottom: "20px",
                fontSize: "24px",
                fontWeight: "bold",
                paddingTop: "1rem"
            }}>
                관리자 문서
            </h1>

            {error && <p style={{color: "red", textAlign: "center"}}>{error}</p>}

            <AdminListToolbar
                sortKey={sortKey}
                setSortKey={setSortKey}
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                documentTypeFilter={documentTypeFilter}
                setDocumentTypeFilter={setDocumentTypeFilter}
                documentTypeFilterOptions={documentTypeFilterOptions}
                yearFilter={yearFilter}
                setYearFilter={setYearFilter}
                yearOptions={yearOptions}
                monthFilter={monthFilter}
                setMonthFilter={setMonthFilter}
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                viewMode={viewMode}
                setViewMode={setViewMode}
            />
            <div style={{
                maxWidth: "85%",
                margin: "0 auto",
                padding: "0 11px",
            }}>
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "12px",
                    width: "100%",
                    paddingLeft: "15px",
                    boxSizing: "border-box",
                    marginTop: "4px",
                }}>
                    <div style={{display: "flex", alignItems: "center", gap: "8px"}}>
                        <input
                            type="checkbox"
                            checked={areAllSelected}
                            onChange={toggleSelectAllDocs}
                            style={{transform: "scale(1.2)"}}
                        />
                        <label style={{fontSize: "0.9rem"}}>
                            전체 선택 ({selectedFilteredDocs.length} / {filteredDocuments.length})
                        </label>
                    </div>
                    <AdminListDownloadButtons
                        isDownloadable={isDownloadable}
                        onBulkDownload={handleBulkDownload}
                        onTaExcelDownload={handleTaExcelDownload}
                    />
                </div>
            </div>

            {viewMode === "list" ? (
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    maxWidth: "85%",
                    margin: "auto",
                    padding: "12px"
                }}>
                    {filteredDocuments.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((doc) => (
                        <div key={doc.id} style={{
                            border: "1px solid #ddd",
                            borderRadius: "10px",
                            padding: "16px",
                            backgroundColor: "#fff",
                            boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
                            display: "flex",
                            flexDirection: "column",
                            position: "relative",
                            minHeight: "8rem"
                        }}>
                            <input
                                type="checkbox"
                                checked={selectedDocs.some(d => d.id === doc.id)}
                                onChange={() => toggleSelectDoc(doc)}
                                style={{position: "absolute", top: "16px", left: "16px"}}
                            />

                            <div style={{flex: 1, paddingLeft: "36px", color: "#000000"}}>
                                <div style={{fontWeight: "bold", color: "#000000"}}>
                                    {doc.requestName}
                                    <button
                                        onClick={() => handleSearchClick(doc.id)}
                                        style={{
                                            marginLeft: "8px",
                                            padding: "2px 6px",
                                            border: "none",
                                            backgroundColor: "white",
                                            color: "#000000",
                                            cursor: "pointer",
                                            fontSize: "13px"
                                        }}
                                    >
                                        서명자 정보
                                    </button>

                                </div>
                                <div style={{marginTop: "6px", color: "#000000"}}>
                                    상태: <StatusBadge status={doc.status}/>
                                </div>
                                <div style={{
                                    marginTop: "4px",
                                    color: "#000000"
                                }}>생성일: {moment(doc.createdAt).format('YYYY/MM/DD')}</div>
                                <div style={{
                                    marginTop: "4px",
                                    color: doc.status === 0 && moment(doc.expiredAt).isSame(moment(), 'day') ? "red" : "black"
                                }}>
                                    만료일: {moment(doc.expiredAt).format('YYYY/MM/DD HH:mm')}
                                </div>
                                <div style={{marginTop: "4px"}}>요청자: {doc.requesterName || "알 수 없음"}</div>
                            </div>


                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px',
                                position: 'absolute',
                                bottom: '12px',
                                right: '12px'
                            }}>
                                {isMobileView ? (
                                    <Dropdown>
                                        <Dropdown.Toggle
                                            variant="dark"
                                            onClick={() => toggleDropdown(doc.id)}
                                            style={{
                                                padding: "6px 12px",
                                                borderRadius: "6px",
                                                fontWeight: "bold",
                                                border: "none",
                                                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "6px",
                                                cursor: "pointer"
                                            }}
                                        >
                                            메뉴
                                        </Dropdown.Toggle>

                                        {openDropdownId === doc.id && (
                                            <div
                                                style={{
                                                    position: "absolute",
                                                    top: "100%",
                                                    right: 0,
                                                    marginTop: "4px",
                                                    backgroundColor: "#fff",
                                                    border: "1px solid #ddd",
                                                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                                    borderRadius: "8px",
                                                    zIndex: 2000,
                                                    width: "160px",
                                                    padding: "6px 0"
                                                }}
                                            >
                                                <div
                                                    onClick={() => {
                                                        window.location.href = `/hisign/detail/${doc.id}`;
                                                        setOpenDropdownId(null);
                                                    }}
                                                    style={iconButtonStyle}
                                                >
                                                    <FindInPageIcon fontSize="small" style={{marginRight: "6px"}}/>
                                                    문서 보기
                                                </div>

                                                <div
                                                    onClick={() => {
                                                        if (doc.status === 1) {
                                                            downloadPDF(doc.id);
                                                            setOpenDropdownId(null);
                                                        }
                                                    }}
                                                    style={{
                                                        ...iconButtonStyle,
                                                        color: doc.status !== 1 ? "#aaa" : "#333",
                                                        pointerEvents: doc.status !== 1 ? "none" : "auto"
                                                    }}
                                                >
                                                    <DownloadIcon fontSize="small" style={{marginRight: "6px"}}/>
                                                    다운로드
                                                </div>

                                                <div
                                                    onClick={() => {
                                                        if (doc.status === 7) {
                                                            navigate(`/check-task/${doc.id}`);
                                                            setOpenDropdownId(null);
                                                        }
                                                    }}
                                                    style={{
                                                        ...iconButtonStyle,
                                                        color: doc.status !== 7 ? "#aaa" : "#333",
                                                        pointerEvents: doc.status !== 7 ? "none" : "auto",
                                                    }}
                                                >
                                                    <SearchIcon fontSize="small" style={{marginRight: "6px"}}/>
                                                    검토
                                                </div>

                                                <div
                                                    onClick={() => {
                                                        if (window.confirm("정말 이 문서를 삭제하시겠습니까?")) {
                                                            ApiService.deleteDocument(doc.id,'admin')
                                                                .then(() => {
                                                                    alert("문서가 삭제되었습니다.");
                                                                    setDocuments((prevDocs) =>
                                                                        prevDocs.filter((d) => d.id !== doc.id)
                                                                    );
                                                                    setOpenDropdownId(null);
                                                                })
                                                                .catch((err) => {
                                                                    console.error("문서 삭제 실패:", err);
                                                                    alert("문서 삭제에 실패했습니다.");
                                                                });
                                                        }
                                                    }}
                                                    style={{...iconButtonStyle, color: "#dc3545"}}
                                                >
                                                    <DeleteIcon fontSize="small" style={{marginRight: "6px"}}/>
                                                    삭제
                                                </div>
                                            </div>
                                        )}
                                    </Dropdown>
                                ) : (
                                    <div style={{display: "flex", gap: "6px", flexWrap: "wrap"}}>
                                        <Link to={`/detail/${doc.id}`} style={{
                                            display: "flex", alignItems: "center", padding: "5px 10px",
                                            border: "1px solid #ccc", borderRadius: "5px",
                                            textDecoration: "none", color: "black"
                                        }}>
                                            <FindInPageIcon fontSize="small" style={{marginRight: "6px"}}/>
                                            문서 보기
                                        </Link>
                                        <button
                                            onClick={() => downloadPDF(doc.id)}
                                            disabled={doc.status !== 1}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                padding: "5px 10px",
                                                border: "1px solid #ccc",
                                                borderRadius: "5px",
                                                textDecoration: "none",
                                                backgroundColor:
                                                    (doc.status !== 1)
                                                        ? "transparent"
                                                        : "white",
                                                color:
                                                    (doc.status !== 1)
                                                        ? "#aaa"
                                                        : "black",
                                                cursor:
                                                    (doc.status !== 1)
                                                        ? "not-allowed"
                                                        : "pointer"
                                            }}
                                        >
                                            <DownloadIcon fontSize="small" style={{marginRight: "6px"}}/>
                                            다운로드
                                        </button>
                                        <button
                                            onClick={() => navigate(`/check-task/${doc.id}`)}
                                            disabled={doc.status !== 7}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                padding: "5px 10px",
                                                border: "1px solid #ccc",
                                                borderRadius: "5px",
                                                backgroundColor: doc.status === 7 ? "#007bff" : "transparent",
                                                color: doc.status === 7 ? "#fff" : "#aaa",
                                                fontSize: "0.8rem",
                                                fontWeight: "bold",
                                                cursor: doc.status === 7 ? "pointer" : "not-allowed",
                                            }}
                                        >
                                            <SearchIcon fontSize="small" style={{marginRight: "6px"}}/>
                                            검토
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (window.confirm("정말 이 문서를 삭제하시겠습니까?")) {
                                                    ApiService.deleteDocument(doc.id,'admin')
                                                        .then(() => {
                                                            alert("문서가 삭제되었습니다.");
                                                            setDocuments(prevDocs => prevDocs.filter(d => d.id !== doc.id));
                                                        })
                                                        .catch((err) => {
                                                            console.error("문서 삭제 실패:", err);
                                                            alert("문서 삭제에 실패했습니다.");
                                                        });
                                                }
                                            }}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                padding: "5px 10px",
                                                border: "1px solid #ccc",
                                                borderRadius: "5px",
                                                backgroundColor: "transparent",
                                                color: "#dc3545",
                                                cursor: "pointer"
                                            }}
                                        >
                                            <DeleteIcon fontSize="small" style={{marginRight: "6px"}}/>
                                            삭제
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "20px",
                    padding: "20px",
                    maxWidth: "85%",
                    margin: "auto"
                }}>
                    {filteredDocuments.map((doc) => (
                        <div key={doc.id} style={{
                            border: "1px solid #ddd",
                            borderRadius: "8px",
                            padding: "16px",
                            backgroundColor: "#fff",
                            boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between"
                        }}>
                            <div style={{fontWeight: "bold", marginBottom: "8px"}}>{doc.requestName}</div>
                            <embed src={doc.previewUrl || doc.fileUrl} type="application/pdf" width="100%"
                                   height="150px"/>
                            <div style={{marginTop: "8px", fontSize: "14px"}}>
                                <StatusBadge status={doc.status}/>
                                생성일: {moment(doc.createdAt).format('YY년 MM월 DD일')}<br/>
                                만료일: <span
                                style={{color: moment(doc.expiredAt).isSame(moment(), 'day') ? "red" : "black"}}>{moment(doc.expiredAt).format('YY년 MM월 DD일 HH:mm')}</span><br/>
                                요청자: {doc.requesterName || "알 수 없음"}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <Modal open={showSignersModal} onClose={() => setShowSignersModal(false)}>
                <Box sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    bgcolor: "background.paper",
                    boxShadow: 24,
                    p: 4,
                    width: "90%",
                    maxWidth: "600px",
                    minWidth: "280px",
                    borderRadius: "8px"
                }}>
                    <Typography variant="h6" component="h2" sx={{ textAlign: "center" }}>서명자 정보</Typography>
                    <Box sx={{ maxHeight: "300px", overflowY: "auto", mt: 2, p: 1 }}>
                        {signers.length > 0 ? (
                            <ul>
                                {signers.map((signer, index) => (
                                    <li key={index}>
                                        {signer.name} ({signer.email}) - {signer.status === 1 ? `서명 완료 (${moment(signer.signedAt).format("YYYY-MM-DD HH:mm")})` : "서명 전"}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <Typography textAlign="center">서명자 정보가 없습니다.</Typography>
                        )}
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
                        <Button variant="contained" color="info" onClick={() => setShowSignersModal(false)} sx={{ width: "80px", height: "36px" }}>닫기</Button>
                    </Box>
                </Box>
            </Modal>


            {viewMode === "list" && (
                <div style={{display: "flex", justifyContent: "center", marginTop: "20px"}}>
                    <Pagination count={Math.ceil(filteredDocuments.length / ITEMS_PER_PAGE)} color="default"
                                page={currentPage} onChange={handlePageChange} style={{marginBottom: "1rem"}}/>
                </div>
            )}
        </PageContainer>
    );
};

export default AdminDocuments;

const iconButtonStyle = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    cursor: "pointer",
    fontSize: "14px",
    color: "#333",
    whiteSpace: "nowrap",
    transition: "background-color 0.2s",
};


