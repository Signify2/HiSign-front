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

const toolbarGridRowSx = {
    display: "grid",
    gridTemplateColumns: { xs: "1fr", md: "1fr auto" },
    gap: 1,
    alignItems: "center",
};

const filterSelectStyle = {
    padding: "6px 28px 6px 12px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    background: "#fff",
    fontSize: "13px",
    minWidth: `${FILTER_CONTROL_MIN_WIDTH}px`,
    height: `${CONTROL_HEIGHT}px`,
    boxSizing: "border-box",
    cursor: "pointer",
    color: "#334155",
    outline: "none",
};

const actionButtonSx = {
    textTransform: "none",
    fontWeight: 600,
    fontSize: "13px",
    borderRadius: 1.5,
    boxShadow: "none",
    minHeight: CONTROL_HEIGHT,
    height: CONTROL_HEIGHT,
    py: 0,
    whiteSpace: "nowrap",
    flexShrink: 0,
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
    onOpenSubjectEditor,
}) => (
    <Box
        sx={{
            maxWidth: "85%",
            mx: "auto",
            mb: 2,
            px: 1,
            p: 1.5,
            borderRadius: 2,
            bgcolor: "#f8fafc",
            border: "1px solid #e8ecf1",
            display: "flex",
            flexDirection: "column",
            gap: 1.25,
        }}
    >
        <Box sx={toolbarGridRowSx}>
            <Box
                sx={{
                    display: "flex",
                    flexWrap: "nowrap",
                    alignItems: "stretch",
                    borderRadius: 2,
                    bgcolor: "#eef1f5",
                    border: "1px solid #e2e8f0",
                    overflowX: "auto",
                    width: "fit-content",
                    maxWidth: "100%",
                    flexShrink: 0,
                    pb: { xs: 0.25, md: 0 },
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
                    ...wrapRowSx,
                    flex: "1 1 240px",
                    minWidth: { xs: "100%", md: 260 },
                    maxWidth: { md: 420 },
                    justifyContent: { xs: "stretch", md: "flex-end" },
                }}
            >
                <TextField
                    size="small"
                    fullWidth
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
                        flex: "1 1 160px",
                        minWidth: 160,
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
            </Box>
        </Box>

        <Box
            sx={{
                ...toolbarGridRowSx,
                pt: 1.25,
                borderTop: "1px solid #e8ecf1",
            }}
        >
            <Box sx={wrapRowSx}>
                <select
                    value={documentTypeFilter}
                    onChange={(e) => setDocumentTypeFilter(e.target.value)}
                    style={filterSelectStyle}
                >
                    {documentTypeFilterOptions.map(({ value, label }) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </select>

                <select
                    value={yearFilter}
                    onChange={(e) => setYearFilter(e.target.value)}
                    style={filterSelectStyle}
                >
                    <option value="all">년도</option>
                    {yearOptions.map((year) => (
                        <option key={year} value={year}>{year}년</option>
                    ))}
                </select>

                <select
                    value={monthFilter}
                    onChange={(e) => setMonthFilter(e.target.value)}
                    style={filterSelectStyle}
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
                </select>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={filterSelectStyle}
                >
                    <option value="all">문서 상태</option>
                    <option value="0">서명중</option>
                    <option value="1">완료</option>
                    <option value="rejected">반려</option>
                    <option value="3">취소</option>
                    <option value="4">만료</option>
                    <option value="7">검토중</option>
                    <option value="8">작성자 서명중</option>
                </select>

                <select
                    value={sortKey}
                    onChange={(e) => setSortKey(e.target.value)}
                    style={filterSelectStyle}
                >
                    <option value="createdAt">생성일</option>
                    <option value="expiredAt">만료일</option>
                    <option value="updatedAt">수정일</option>
                </select>

                <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    style={filterSelectStyle}
                >
                    <option value="desc">최신순</option>
                    <option value="asc">오래된 순</option>
                </select>
            </Box>

            <Button
                size="small"
                variant="outlined"
                onClick={onOpenSubjectEditor}
                sx={{
                    ...actionButtonSx,
                    ml: { xs: 0, sm: "auto" },
                    width: { xs: "100%", sm: "auto" },
                    alignSelf: { xs: "stretch", sm: "center" },
                    borderColor: "#cbd5e1",
                    color: "#334155",
                    bgcolor: "#fff",
                }}
            >
                과목 목록 수정
            </Button>
        </Box>
    </Box>
);

export default AdminListToolbar;
