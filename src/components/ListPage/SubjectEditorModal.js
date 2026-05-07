import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { Box, Button, CircularProgress, Modal, Tab, Tabs, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import ApiService from '../../utils/ApiService';

const SubjectEditorModal = ({ open, onClose }) => {
    const [activeTab, setActiveTab] = useState('worklog');
    const [worklogList, setWorklogList] = useState([]);
    const [researchList, setResearchList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [newSubject, setNewSubject] = useState('');

    // 탭이 바뀌거나 모달이 열릴 때 해당 탭 목록 로드
    useEffect(() => {
        if (!open) return;
        setIsLoading(true);
        setNewSubject('');
        ApiService.getSubjects(activeTab)
            .then((data) => {
                if (activeTab === 'worklog') setWorklogList(data);
                else setResearchList(data);
                setIsLoading(false);
            })
            .catch(() => {
                alert('과목 목록을 불러오지 못했습니다.');
                setIsLoading(false);
            });
    }, [open, activeTab]);

    const currentList = activeTab === 'worklog' ? worklogList : researchList;
    const setCurrentList = activeTab === 'worklog' ? setWorklogList : setResearchList;

    const handleDelete = (index) => {
        setCurrentList(prev => prev.filter((_, i) => i !== index));
    };

    const handleAdd = () => {
        const trimmed = newSubject.trim();
        if (!trimmed) return;
        if (currentList.includes(trimmed)) {
            alert('이미 존재하는 과목입니다.');
            return;
        }
        setCurrentList(prev => [...prev, trimmed]);
        setNewSubject('');
    };

    const handleSave = async () => {
        const content = currentList
            .map(s => s.trim())
            .filter(s => s.length > 0)
            .join('\n');
        try {
            await ApiService.saveSubjects(activeTab, content);
            alert('저장되었습니다.');
            onClose();
        } catch {
            alert('저장에 실패했습니다.');
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                bgcolor: 'background.paper',
                boxShadow: 24,
                p: 4,
                width: '90%',
                maxWidth: '560px',
                minWidth: '280px',
                borderRadius: '8px'
            }}>
                <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
                    과목 목록 수정
                </Typography>

                {/* 탭 */}
                <Tabs
                    value={activeTab}
                    onChange={(_, v) => setActiveTab(v)}
                    variant="fullWidth"
                    sx={{ mb: 2, borderBottom: '1px solid #eee' }}
                >
                    <Tab label="근무일지" value="worklog" />
                    <Tab label="연구참여확약서" value="research" />
                </Tabs>

                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, py: 4 }}>
                        <CircularProgress size={20} />
                        <Typography variant="body2" color="text.secondary" fontStyle="italic">
                            불러오는 중...
                        </Typography>
                    </Box>
                ) : (
                    <>
                        {/* 과목 목록 */}
                        <Box sx={{
                            maxHeight: '320px',
                            overflowY: 'auto',
                            border: '1px solid #eee',
                            borderRadius: '6px',
                            mb: 2
                        }}>
                            {currentList.length === 0 ? (
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ textAlign: 'center', py: 4 }}
                                >
                                    과목이 없습니다. 아래에서 추가해주세요.
                                </Typography>
                            ) : (
                                currentList.map((subject, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            px: 2,
                                            py: 1,
                                            borderBottom: index < currentList.length - 1 ? '1px solid #f0f0f0' : 'none',
                                            '&:hover': { backgroundColor: '#f9f9f9' }
                                        }}
                                    >
                                        <Typography variant="body2" sx={{ flex: 1, wordBreak: 'break-all' }}>
                                            {subject}
                                        </Typography>
                                        <Button
                                            size="small"
                                            color="error"
                                            onClick={() => handleDelete(index)}
                                            sx={{ minWidth: '32px', p: '4px' }}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </Button>
                                    </Box>
                                ))
                            )}
                        </Box>

                        {/* 과목 추가 */}
                        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                            <input
                                value={newSubject}
                                onChange={(e) => setNewSubject(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
                                placeholder="추가할 과목명 입력"
                                style={{
                                    flex: 1,
                                    height: '36px',
                                    padding: '0 10px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    outline: 'none'
                                }}
                            />
                            <Button
                                variant="contained"
                                size="small"
                                onClick={handleAdd}
                                startIcon={<AddIcon />}
                                sx={{ whiteSpace: 'nowrap' }}
                            >
                                추가
                            </Button>
                        </Box>
                    </>
                )}

                {/* 하단 버튼 */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 1 }}>
                    <Button variant="outlined" onClick={onClose}>취소</Button>
                    <Button variant="contained" onClick={handleSave} disabled={isLoading}>
                        저장
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default SubjectEditorModal;