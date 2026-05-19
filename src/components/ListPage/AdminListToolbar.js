import DownloadIcon from "@mui/icons-material/Download";
import SearchIcon from "@mui/icons-material/Search";
import ViewListIcon from "@mui/icons-material/ViewList";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import {
    Box,
    Button,
    IconButton,
    InputAdornment,
    TextField,
} from "@mui/material";

const CONTROL_HEIGHT = 36;
const FILTER_CONTROL_MIN_WIDTH = 108;

const wrapRowSx = {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 1,
    rowGap: 1,
};

const filterSelectStyle = {
    padding: "6px 32px 6px 12px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    background: "#fff url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\") no-repeat right 10px center",
    fontSize: "13px",
    minWidth: `${FILTER_CONTROL_MIN_WIDTH}px`,
    height: `${CONTROL_HEIGHT}px`,
    boxSizing: "border-box",
    cursor: "pointer",
    color: "#334155",
    outline: "none",
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
};

const downloadGroupButtonSx = {
    textTransform: "none",
    fontWeight: 600,
    fontSize: "13px",
    borderRadius: 0,
    boxShadow: "none",
    minHeight: CONTROL_HEIGHT,
    height: CONTROL_HEIGHT,
    minWidth: "unset",
    width: "auto",
    flex: "0 0 auto",
    py: 0,
    px: 1.5,
    whiteSpace: "nowrap",
    color: "#334155",
    bgcolor: "transparent",
    "&:hover": {
        boxShadow: "none",
        bgcolor: "rgba(15, 23, 42, 0.06)",
    },
    "&.Mui-disabled": {
        color: "#94a3b8",
    },
};

const DownloadGroupDivider = () => (
    <Box
        sx={{
            width: "1px",
            alignSelf: "stretch",
            my: 0.75,
            bgcolor: "#d1d5db",
            flexShrink: 0,
        }}
    />
);

const FilterSelect = ({ value, onChange, children }) => (
    <Box sx={{ position: "relative", display: "inline-flex" }}>
        <select value={value} onChange={onChange} style={filterSelectStyle}>
            {children}
        </select>
    </Box>
);

const ViewModeToggle = ({ viewMode, setViewMode }) => (
    <Box
        sx={{
            display: "flex",
            flexShrink: 0,
            height: CONTROL_HEIGHT,
            border: "1px solid #e2e8f0",
            borderRadius: 2,
            overflow: "hidden",
            bgcolor: "#fff",
        }}
    >
        <IconButton
            size="small"
            onClick={() => setViewMode("list")}
            aria-label="목록 보기"
            sx={{
                borderRadius: 0,
                width: CONTROL_HEIGHT,
                height: CONTROL_HEIGHT,
                bgcolor: viewMode === "list" ? "primary.main" : "transparent",
                color: viewMode === "list" ? "#fff" : "text.secondary",
                "&:hover": {
                    bgcolor: viewMode === "list" ? "primary.dark" : "action.hover",
                },
            }}
        >
            <ViewListIcon fontSize="small" />
        </IconButton>
        <IconButton
            size="small"
            onClick={() => setViewMode("grid")}
            aria-label="그리드 보기"
            sx={{
                borderRadius: 0,
                width: CONTROL_HEIGHT,
                height: CONTROL_HEIGHT,
                bgcolor: viewMode === "grid" ? "primary.main" : "transparent",
                color: viewMode === "grid" ? "#fff" : "text.secondary",
                "&:hover": {
                    bgcolor: viewMode === "grid" ? "primary.dark" : "action.hover",
                },
            }}
        >
            <ViewModuleIcon fontSize="small" />
        </IconButton>
    </Box>
);

const AdminListToolbar = ({
    sortKey,
    setSortKey,
    sortOrder,
    setSortOrder,
    statusFilter,
    setStatusFilter,
    documentTypeFilter,
    setDocumentTypeFilter,
    documentTypeFilterOptions,
    yearFilter,
    setYearFilter,
    yearOptions,
    monthFilter,
    setMonthFilter,
    searchQuery,
    onSearchChange,
    viewMode,
    setViewMode,
    isDownloadable,
    onExcelDownload,
    onBulkDownload,
    onTaExcelDownload,
}) => (
    <Box
        sx={{
            maxWidth: "85%",
            width: "100%",
            mx: "auto",
            mb: 2,
            px: 2,
            py: 1.5,
            borderRadius: 2,
            bgcolor: "#fff",
            border: "1px solid #e8ecf1",
            display: "flex",
            flexDirection: "column",
            gap: 0,
            boxSizing: "border-box",
            overflow: "hidden",
        }}
    >
        {/* 상단: 다운로드(왼쪽) | 작업명 검색(오른쪽) */}
        <Box
            sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "flex-start",
                gap: 1.5,
                pb: 1.5,
                minWidth: 0,
                width: "100%",
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    flexWrap: "nowrap",
                    alignItems: "stretch",
                    borderRadius: 2,
                    bgcolor: "#eef1f5",
                    border: "1px solid #e2e8f0",
                    overflowX: "auto",
                    maxWidth: "100%",
                    flex: "0 1 auto",
                    minWidth: 0,
                }}
            >
                <Button
                    size="small"
                    variant="text"
                    onClick={onExcelDownload}
                    disabled={!isDownloadable}
                    startIcon={
                        <DownloadIcon
                            sx={{
                                fontSize: 18,
                                color: !isDownloadable ? "#94a3b8" : "#64748b",
                            }}
                        />
                    }
                    sx={downloadGroupButtonSx}
                >
                    엑셀 다운로드
                </Button>
                <DownloadGroupDivider />
                <Button
                    size="small"
                    variant="text"
                    onClick={onBulkDownload}
                    disabled={!isDownloadable}
                    startIcon={
                        <DownloadIcon
                            sx={{
                                fontSize: 18,
                                color: !isDownloadable ? "#94a3b8" : "#64748b",
                            }}
                        />
                    }
                    sx={downloadGroupButtonSx}
                >
                    일괄 다운로드
                </Button>
                <DownloadGroupDivider />
                <Button
                    size="small"
                    variant="text"
                    onClick={onTaExcelDownload}
                    disabled={monthFilter === "all"}
                    startIcon={
                        <DownloadIcon
                            sx={{
                                fontSize: 18,
                                color: monthFilter === "all" ? "#94a3b8" : "#64748b",
                            }}
                        />
                    }
                    sx={{
                        ...downloadGroupButtonSx,
                        px: 1.75,
                    }}
                >
                    제출 현황 다운로드
                </Button>
            </Box>

            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    flex: "0 0 auto",
                    minWidth: 0,
                    maxWidth: "100%",
                    ml: "auto",
                }}
            >
                <TextField
                    size="small"
                    placeholder="작업명 검색"
                    value={searchQuery}
                    onChange={onSearchChange}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        flex: "0 0 auto",
                        width: { xs: "100%", sm: 180, md: 200 },
                        maxWidth: { xs: "100%", sm: 200, md: 220 },
                        minWidth: { xs: 0, sm: 140 },
                        "& .MuiOutlinedInput-root": {
                            height: CONTROL_HEIGHT,
                            borderRadius: 2,
                            bgcolor: "#fff",
                            fontSize: "14px",
                            "& fieldset": { borderColor: "#e2e8f0" },
                            "&:hover fieldset": { borderColor: "#94a3b8" },
                            "&.Mui-focused fieldset": {
                                borderColor: "primary.main",
                                borderWidth: 1,
                            },
                        },
                    }}
                />
            </Box>
        </Box>

        {/* 하단: 필터 드롭다운 + 보기 전환(오른쪽) */}
        <Box
            sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 1,
                rowGap: 1,
                pt: 1.5,
                borderTop: "1px solid #e8ecf1",
                width: "100%",
                minWidth: 0,
            }}
        >
            <Box sx={{ ...wrapRowSx, flex: "1 1 auto", minWidth: 0 }}>
                <FilterSelect
                    value={documentTypeFilter}
                    onChange={(e) => setDocumentTypeFilter(e.target.value)}
                >
                    {documentTypeFilterOptions.map(({ value, label }) => (
                        <option key={value} value={value}>
                            {label}
                        </option>
                    ))}
                </FilterSelect>

                <FilterSelect
                    value={yearFilter}
                    onChange={(e) => setYearFilter(e.target.value)}
                >
                    <option value="all">년도</option>
                    {yearOptions.map((year) => (
                        <option key={year} value={year}>
                            {year}년
                        </option>
                    ))}
                </FilterSelect>

                <FilterSelect
                    value={monthFilter}
                    onChange={(e) => setMonthFilter(e.target.value)}
                >
                    <option value="all">월</option>
                    <option value="1월">1월</option>
                    <option value="2월">2월</option>
                    <option value="3월">3월</option>
                    <option value="4월">4월</option>
                    <option value="5월">5월</option>
                    <option value="6월">6월</option>
                    <option value="7월">7월</option>
                    <option value="8월">8월</option>
                    <option value="9월">9월</option>
                    <option value="10월">10월</option>
                    <option value="11월">11월</option>
                    <option value="12월">12월</option>
                </FilterSelect>

                <FilterSelect
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="all">문서 상태</option>
                    <option value="0">서명중</option>
                    <option value="1">완료</option>
                    <option value="rejected">반려</option>
                    <option value="3">취소</option>
                    <option value="4">만료</option>
                    <option value="7">검토중</option>
                    <option value="8">작성자 서명중</option>
                </FilterSelect>

                <FilterSelect
                    value={sortKey}
                    onChange={(e) => setSortKey(e.target.value)}
                >
                    <option value="createdAt">생성일</option>
                    <option value="expiredAt">만료일</option>
                    <option value="updatedAt">수정일</option>
                </FilterSelect>

                <FilterSelect
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                >
                    <option value="desc">최신순</option>
                    <option value="asc">오래된 순</option>
                </FilterSelect>
            </Box>
            <Box sx={{ flexShrink: 0, ml: "auto" }}>
                <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} />
            </Box>
        </Box>
    </Box>
);

export default AdminListToolbar;
