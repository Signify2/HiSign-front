import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import styled from "styled-components";
import { signingState } from "../recoil/atom/signingState";
import ApiService from "../utils/ApiService";

const CompleteSignPage = () => {
  const navigate = useNavigate();
  const currentSigningState = useRecoilValue(signingState);
  const resetSigningState = useSetRecoilState(signingState);
  const [summary] = useState(() => {
    const completedAt = new Date();
    const formattedTime = new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).format(completedAt);

    return {
      documentName: currentSigningState.documentName || "문서명 없음",
      completedAt: formattedTime
    };
  });

  useEffect(() => {
    resetSigningState({
      requesterName: "",
      requestName: "",
      description: "",
      isRejectable: null,
      hasExistingSignature: null,
      documentId: null,
      documentName: "",
      signerEmail: "",
      signerName: "",
      token: "",
      fileUrl: "",
      signatureFields: []
    });
    ApiService.deleteSignerCookie()
      .then(() => {})
      .catch((error) => {
        console.error("서명자 쿠키 삭제 실패:", error);
      });
  }, [resetSigningState]);

  return (
    <Container>
      <Icon>✅</Icon>
      <Title>서명이 완료되었습니다</Title>
      <InfoCard>
        <InfoRow>
          <Label>문서명</Label>
          <Value>{summary.documentName}</Value>
        </InfoRow>
        <InfoRow>
          <Label>완료 시각</Label>
          <Value>{summary.completedAt}</Value>
        </InfoRow>
      </InfoCard>
      <MoveButton type="button" onClick={() => navigate("/dashboard")}>
        대시보드로 이동
      </MoveButton>
    </Container>
  );
};

export default CompleteSignPage;

// ✅ 스타일링
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
  padding: 24px;
  gap: 12px;
`;

const Icon = styled.div`
  font-size: 40px;
`;

const Title = styled.h2`
  margin: 0;
  color: #1f2937;
`;

const InfoCard = styled.div`
  width: 100%;
  max-width: 520px;
  margin-top: 8px;
  padding: 20px;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
`;

const Label = styled.span`
  color: #6b7280;
  font-weight: 600;
`;

const Value = styled.span`
  color: #111827;
  font-weight: 700;
  text-align: right;
`;

const MoveButton = styled.button`
  margin-top: 16px;
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  background: #2563eb;
  color: #ffffff;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    background: #1d4ed8;
  }
`;
