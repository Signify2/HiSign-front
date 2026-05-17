import {
    DOCUMENT_TYPE_FILTER_ALL,
    DOCUMENT_TYPES,
} from "../config/documentTypes";

const researchType = DOCUMENT_TYPES.find((type) => type.id === "research");

export const isResearchDocument = (requestName = "") =>
    Boolean(researchType?.requestNameMarker) &&
    requestName.includes(researchType.requestNameMarker);

export const getDocumentTypeId = (requestName = "") =>
    isResearchDocument(requestName) ? "research" : "worklog";

export const matchesDocumentTypeFilter = (requestName, filterId) => {
    if (filterId === DOCUMENT_TYPE_FILTER_ALL) return true;
    return getDocumentTypeId(requestName) === filterId;
};

export const getDocumentTypeFilterOptions = () => [
    { value: DOCUMENT_TYPE_FILTER_ALL, label: "문서 종류" },
    ...DOCUMENT_TYPES.map(({ id, label }) => ({ value: id, label })),
];
