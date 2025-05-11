import { DocumentInfo } from '@/types/document';
import axiosInstance from '@/apis/axiosInstance';

// 자료 업로드 api
export const uploadDocumentByWorkBookId = async (
  file: File,
  workBookId: number
) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('workBookId', workBookId.toString());

  const response = await axiosInstance.post('/api/document/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

// 특정 워크북의 업로드된 파일 목록 조회
export const fetchDocumentsByWorkBook = async (
  workBookId: number
): Promise<DocumentInfo[]> => {
  const response = await axiosInstance.get(
    `/api/document/workbook/${workBookId}`
  );
  console.log('문제집', workBookId, '의 조회된 파일 목록', response.data);
  return response.data;
};

// 파일 삭제 API
export const deleteDocumentByDocumentId = async (documentId: number) => {
  const response = await axiosInstance.delete(`/api/document/${documentId}`);
  return response.data;
};
