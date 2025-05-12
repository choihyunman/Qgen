import { useState, useCallback } from 'react';
import {
  uploadDocumentByWorkBookId,
  fetchDocumentsByWorkBook,
  deleteDocumentByDocumentId,
} from '@/apis/document/document';

export function useDocuments() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 문서 목록 조회
  const getDocuments = useCallback(async (workBookId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const docs = await fetchDocumentsByWorkBook(workBookId);
      return docs;
    } catch (err: any) {
      setError(err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 문서 업로드
  const uploadDocument = useCallback(async (file: File, workBookId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await uploadDocumentByWorkBookId(file, workBookId);
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 문서 삭제
  const deleteDocument = useCallback(async (documentId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await deleteDocumentByDocumentId(documentId);
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    getDocuments,
    uploadDocument,
    deleteDocument,
  };
}
