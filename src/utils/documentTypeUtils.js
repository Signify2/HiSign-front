import {
    DOCUMENT_TYPE_FILTER_ALL,
    DOCUMENT_TYPES,
} from "../config/documentTypes";

export const matchesDocumentTypeFilter = (docType, filterId) => {
    if (filterId === DOCUMENT_TYPE_FILTER_ALL) return true;
    const matched = DOCUMENT_TYPES.find((t) => t.id === filterId);
    return matched ? docType === matched.typeValue : false;
};

export const getDocumentTypeFilterOptions = () => [
    { value: DOCUMENT_TYPE_FILTER_ALL, label: "문서 종류" },
    ...DOCUMENT_TYPES.map(({ id, label }) => ({ value: id, label })),
];
