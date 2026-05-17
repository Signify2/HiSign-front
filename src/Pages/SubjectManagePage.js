import AddIcon from '@mui/icons-material/Add';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import {
    Box, Button, Checkbox, Chip, CircularProgress,
    Collapse, Tab, Tabs, Typography
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import ApiService from '../utils/ApiService';

const parseInput = (text) =>
    text.split(/[\n,;]+/).map(s => s.trim()).filter(s => s.length > 0);

const SubjectManagePage = () => {
    const [activeTab, setActiveTab]       = useState('worklog');
    const [worklogList, setWorklogList]   = useState([]);
    const [researchList, setResearchList] = useState([]);
    const [isLoading, setIsLoading]       = useState(false);
    const [isSaving, setIsSaving]         = useState(false);

    // 단일 입력
    const [singleInput, setSingleInput]   = useState('');

    // 일괄 추가
    const [bulkInput, setBulkInput]       = useState('');
    const [bulkPreview, setBulkPreview]   = useState(null);
    const [showBulk, setShowBulk]         = useState(false);

    // 체크박스 삭제
    const [checkedSet, setCheckedSet]     = useState(new Set());

    const textareaRef = useRef(null);

    // 탭에 따라 '과목' or '과제' 용어 구분
    const term = activeTab === 'worklog' ? '과목' : '과제';

    useEffect(() => {
        setIsLoading(true);
        setSingleInput('');
        setBulkInput('');
        setBulkPreview(null);
        setCheckedSet(new Set());
        ApiService.getSubjects(activeTab)
            .then(data => {
                if (activeTab === 'worklog') setWorklogList(data);
                else setResearchList(data);
                setIsLoading(false);
            })
            .catch(() => {
                alert('목록을 불러오지 못했습니다.');
                setIsLoading(false);
            });
    }, [activeTab]);

    const currentList    = activeTab === 'worklog' ? worklogList : researchList;
    const setCurrentList = activeTab === 'worklog' ? setWorklogList : setResearchList;

    /* ── 전체 선택 상태 ── */
    const isAllChecked    = currentList.length > 0 && checkedSet.size === currentList.length;
    const isIndeterminate = checkedSet.size > 0 && checkedSet.size < currentList.length;

    /* ── 전체 선택 / 해제 ── */
    const handleCheckAll = () => {
        if (isAllChecked) setCheckedSet(new Set());
        else setCheckedSet(new Set(currentList));
    };

    /* ── 개별 체크 ── */
    const handleCheck = (subject) => {
        setCheckedSet(prev => {
            const next = new Set(prev);
            if (next.has(subject)) next.delete(subject);
            else next.add(subject);
            return next;
        });
    };

    /* ── 선택 항목 삭제 (확인 포함) ── */
    const handleDeleteChecked = () => {
        if (checkedSet.size === 0) return;
        const names = [...checkedSet].join('\n');
        const confirmed = window.confirm(
            `선택한 ${checkedSet.size}개 ${term}을 삭제할까요?\n\n${names}`
        );
        if (!confirmed) return;
        setCurrentList(prev => prev.filter(s => !checkedSet.has(s)));
        setCheckedSet(new Set());
        setBulkPreview(null);
    };

    /* ── 단일 추가 ── */
    const handleSingleAdd = () => {
        const trimmed = singleInput.trim();
        if (!trimmed) {
            alert(`추가할 ${term}명을 입력하세요.`);
            return;
        }
        if (currentList.includes(trimmed)) {
            alert(`이미 존재하는 ${term}입니다.`);
            return;
        }
        const confirmed = window.confirm(`"${trimmed}" ${term}을 추가할까요?`);
        if (!confirmed) return;
        setCurrentList(prev => [...prev, trimmed]);
        setSingleInput('');
    };

    /* ── 일괄 미리보기 ── */
    const handleBulkPreview = () => {
        const parsed = parseInput(bulkInput);
        if (parsed.length === 0) return;
        const duplicates = [], toAdd = [];
        const seen = new Set(currentList);
        parsed.forEach(s => {
            if (seen.has(s)) duplicates.push(s);
            else { toAdd.push(s); seen.add(s); }
        });
        setBulkPreview({ toAdd, duplicates });
    };

    /* ── 일괄 확정 ── */
    const handleBulkConfirm = () => {
        if (!bulkPreview || bulkPreview.toAdd.length === 0) return;
        setCurrentList(prev => [...prev, ...bulkPreview.toAdd]);
        setBulkInput('');
        setBulkPreview(null);
        setShowBulk(false);
    };

    const handleBulkCancel = () => setBulkPreview(null);

    const handleToggleBulk = () => {
        setShowBulk(prev => {
            if (!prev) setTimeout(() => textareaRef.current?.focus(), 100);
            return !prev;
        });
        setBulkPreview(null);
        setBulkInput('');
    };

    /* ── 저장 ── */
    const handleSave = async () => {
        setIsSaving(true);
        const content = currentList.map(s => s.trim()).filter(s => s.length > 0).join('\n');
        try {
            await ApiService.saveSubjects(activeTab, content);
            alert('저장되었습니다.');
        } catch {
            alert('저장에 실패했습니다.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 680, margin: '40px auto', px: 3, pb: 6 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                {term} 목록 관리
            </Typography>

            {/* 탭 */}
            <Tabs
                value={activeTab}
                onChange={(_, v) => { setActiveTab(v); setCheckedSet(new Set()); }}
                variant="fullWidth"
                sx={{ mb: 3, borderBottom: '1px solid #eee' }}
            >
                <Tab label="근무일지" value="worklog" />
                <Tab label="연구참여확약서" value="research" />
            </Tabs>

            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, py: 8 }}>
                    <CircularProgress size={20} />
                    <Typography variant="body2" color="text.secondary" fontStyle="italic">불러오는 중...</Typography>
                </Box>
            ) : (
                <>
                    {/* ── 단일 추가 + 일괄 추가 버튼 ── */}
                    <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                        <input
                            value={singleInput}
                            onChange={e => setSingleInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleSingleAdd(); }}
                            placeholder={`${term}명 입력 후 Enter 또는 추가 버튼`}
                            style={{
                                flex: 1, height: '38px', padding: '0 12px',
                                border: '1px solid #ddd', borderRadius: '6px',
                                fontSize: '14px', outline: 'none',
                            }}
                        />
                        <Button variant="contained" size="small" onClick={handleSingleAdd}
                            startIcon={<AddIcon />} sx={{ whiteSpace: 'nowrap', borderRadius: '6px' }}>
                            추가
                        </Button>
                        <Button variant="outlined" size="small" onClick={handleToggleBulk}
                            startIcon={<PlaylistAddIcon />}
                            color={showBulk ? 'error' : 'primary'}
                            sx={{ whiteSpace: 'nowrap', borderRadius: '6px' }}>
                            {showBulk ? '일괄 닫기' : '일괄 추가'}
                        </Button>
                    </Box>

                    {/* ── 일괄 추가 영역 ── */}
                    <Collapse in={showBulk}>
                        <Box sx={{ border: '1px solid #1976d2', borderRadius: '8px', p: 2, mb: 2, backgroundColor: '#f5f9ff' }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                여러 {term}을 한 번에 추가할 수 있어요.&nbsp;
                                <b>줄바꿈</b>, <b>쉼표( , )</b>, <b>세미콜론( ; )</b> 으로 구분해서 입력하세요.
                            </Typography>
                            <textarea
                                ref={textareaRef}
                                value={bulkInput}
                                onChange={e => { setBulkInput(e.target.value); setBulkPreview(null); }}
                            placeholder={activeTab === 'worklog'
                                ? `예시:\nR01_비즈플로우(김광)\nR02_노드톡스(김영식)\nR03_에이치이엠파마(박영춘)`
                                : `예시:\n[연구참여확약서]R01_비즈플로우(김광)\n[연구참여확약서]R02_노드톡스(김영식)\n[연구참여확약서]R03_에이치이엠파마(박영춘)`
                            }                                rows={5}
                                style={{
                                    width: '100%', boxSizing: 'border-box',
                                    padding: '10px 12px', fontSize: '13px',
                                    border: '1px solid #cce0ff', borderRadius: '6px',
                                    resize: 'vertical', outline: 'none',
                                    fontFamily: 'inherit', lineHeight: 1.6,
                                    backgroundColor: '#fff',
                                }}
                            />
                            {!bulkPreview && (
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1.5 }}>
                                    <Button variant="contained" size="small" onClick={handleBulkPreview}
                                        disabled={!bulkInput.trim()} sx={{ borderRadius: '6px' }}>
                                        목록 확인하기
                                    </Button>
                                </Box>
                            )}
                            {bulkPreview && (
                                <Box sx={{ mt: 2 }}>
                                    {bulkPreview.toAdd.length > 0 && (
                                        <Box sx={{ mb: 1.5 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.8 }}>
                                                <CheckCircleOutlineIcon fontSize="small" color="success" />
                                                <Typography variant="body2" fontWeight="bold" color="success.main">
                                                    추가될 {term} ({bulkPreview.toAdd.length}개)
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.7 }}>
                                                {bulkPreview.toAdd.map((s, i) => (
                                                    <Chip key={i} label={s} size="small" color="success" variant="outlined" sx={{ fontSize: '12px' }} />
                                                ))}
                                            </Box>
                                        </Box>
                                    )}
                                    {bulkPreview.duplicates.length > 0 && (
                                        <Box sx={{ mb: 1.5 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.8 }}>
                                                <ErrorOutlineIcon fontSize="small" color="error" />
                                                <Typography variant="body2" fontWeight="bold" color="error.main">
                                                    이미 존재하여 제외 ({bulkPreview.duplicates.length}개)
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.7 }}>
                                                {bulkPreview.duplicates.map((s, i) => (
                                                    <Chip key={i} label={s} size="small" color="error" variant="outlined" sx={{ fontSize: '12px' }} />
                                                ))}
                                            </Box>
                                        </Box>
                                    )}
                                    {bulkPreview.toAdd.length === 0 && (
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            추가할 수 있는 새 {term}이 없습니다.
                                        </Typography>
                                    )}
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1.5 }}>
                                        <Button variant="outlined" size="small" onClick={handleBulkCancel} sx={{ borderRadius: '6px' }}>
                                            다시 입력
                                        </Button>
                                        <Button variant="contained" size="small" onClick={handleBulkConfirm}
                                            disabled={bulkPreview.toAdd.length === 0} sx={{ borderRadius: '6px' }}>
                                            목록에 추가 ({bulkPreview.toAdd.length}개)
                                        </Button>
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    </Collapse>

                    {/* ── 과목/과제 목록 ── */}
                    <Box sx={{ border: '1px solid #eee', borderRadius: '8px', mb: 2 }}>

                        {/* 목록 헤더: 전체선택 + 선택삭제 */}
                        <Box sx={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            px: 1.5, py: 0.5,
                            backgroundColor: '#f8f9fa',
                            borderBottom: '1px solid #eee',
                            borderRadius: '8px 8px 0 0',
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Checkbox
                                    size="small"
                                    checked={isAllChecked}
                                    indeterminate={isIndeterminate}
                                    onChange={handleCheckAll}
                                    disabled={currentList.length === 0}
                                />
                                <Typography variant="caption" color="text.secondary">
                                    {checkedSet.size > 0
                                        ? `${checkedSet.size}개 선택됨 / 전체 ${currentList.length}개`
                                        : `전체 ${currentList.length}개 · 저장 버튼을 눌러야 서버에 반영돼요`}
                                </Typography>
                            </Box>

                            {checkedSet.size > 0 && (
                                <Button
                                    size="small"
                                    variant="contained"
                                    color="error"
                                    startIcon={<DeleteIcon />}
                                    onClick={handleDeleteChecked}
                                    sx={{ borderRadius: '6px', fontSize: '12px' }}
                                >
                                    선택 삭제 ({checkedSet.size}개)
                                </Button>
                            )}
                        </Box>

                        {/* 목록 아이템 */}
                        <Box sx={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {currentList.length === 0 ? (
                                <Typography variant="body2" color="text.secondary"
                                    sx={{ textAlign: 'center', py: 8 }}>
                                    {term}이 없습니다. 위에서 추가해주세요.
                                </Typography>
                            ) : (
                                currentList.map((subject, index) => {
                                    const checked = checkedSet.has(subject);
                                    return (
                                        <Box
                                            key={index}
                                            onClick={() => handleCheck(subject)}
                                            sx={{
                                                display: 'flex', alignItems: 'center', gap: 1,
                                                px: 1.5, py: 0.8, cursor: 'pointer',
                                                borderBottom: index < currentList.length - 1 ? '1px solid #f0f0f0' : 'none',
                                                backgroundColor: checked ? '#fff3f3' : 'transparent',
                                                '&:hover': { backgroundColor: checked ? '#ffe5e5' : '#f9f9f9' },
                                                transition: 'background-color 0.15s',
                                            }}
                                        >
                                            <Checkbox
                                                size="small"
                                                checked={checked}
                                                onChange={() => handleCheck(subject)}
                                                onClick={e => e.stopPropagation()}
                                                color="error"
                                                sx={{ p: '2px' }}
                                            />
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    flex: 1, wordBreak: 'break-all',
                                                    color: checked ? '#c62828' : 'inherit',
                                                    textDecoration: checked ? 'line-through' : 'none',
                                                }}
                                            >
                                                {subject}
                                            </Typography>
                                        </Box>
                                    );
                                })
                            )}
                        </Box>
                    </Box>

                    {/* ── 저장 버튼 ── */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            variant="contained"
                            onClick={handleSave}
                            disabled={isLoading || isSaving}
                            sx={{ px: 5, borderRadius: '6px' }}
                        >
                            {isSaving ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : '저장'}
                        </Button>
                    </Box>
                </>
            )}
        </Box>
    );
};

export default SubjectManagePage;