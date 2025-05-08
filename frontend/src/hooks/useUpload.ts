import { useState } from 'react';
import {
  uploadDocument,
  fetchDocumentsByWorkBook,
  deleteDocument,
} from '@/apis/upload/upload';
import { DocumentInfo } from '@/types/upload';

export function useUpload() {
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 파일 업로드
  const handleUpload = async (file: File, workBookId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await uploadDocument(file, workBookId);
      // 업로드 후 목록 갱신
      await getDocuments(workBookId);
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // 파일 목록 조회
  const getDocuments = async (workBookId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const docs = await fetchDocumentsByWorkBook(workBookId);
      setDocuments(docs);
      return docs;
    } catch (err: any) {
      setError(err);
      setDocuments([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // 파일 삭제
  const handleDelete = async (documentId: number, workBookId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await deleteDocument(documentId);
      // 삭제 후 목록 갱신
      await getDocuments(workBookId);
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    documents,
    isLoading,
    error,
    handleUpload,
    getDocuments,
    handleDelete,
    setDocuments, // 필요시 외부에서 직접 세팅 가능
  };
}
