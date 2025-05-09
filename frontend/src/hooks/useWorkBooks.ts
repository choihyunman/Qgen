// src/hooks/useWorkBook.ts
import { useState } from 'react';
import { WorkBook } from '@/types/workbook';
import {
  getWorkBooks,
  createWorkBook,
  deleteWorkBook,
  updateWorkBook,
} from '@/apis/workbook/workbook';

interface UseWorkBookReturn {
  workbooks: WorkBook[];
  isLoading: boolean;
  error: Error | null;
  fetchWorkBooks: (userId: number) => Promise<void>;
  createNewWorkBook: (userId: number, title: string) => Promise<void>;
  removeWorkBook: (
    // userId: number,
    workBookId: number
    // title: string
  ) => Promise<void>;
  editWorkBook: (workBookId: number, title: string) => Promise<void>;
}

export const useWorkBook = (): UseWorkBookReturn => {
  const [workbooks, setWorkbooks] = useState<WorkBook[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 문제집 목록 조회
  const fetchWorkBooks = async (userId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const userId = 1; // 임시
      const data = await getWorkBooks(userId);
      console.log('조회된 문제집 목록 : ', data);
      setWorkbooks(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to fetch workbooks')
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 문제집 생성
  const createNewWorkBook = async (userId: number, title: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const userId = 1; // 임시
      const newWorkBook = await createWorkBook(userId, title);
      setWorkbooks((prev) => [...prev, newWorkBook]);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to create workbook')
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // 문제집 삭제
  const removeWorkBook = async (
    // userId: number,
    workBookId: number
    // title: string
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      // const userId = 1; // 임시
      await deleteWorkBook(workBookId);
      setWorkbooks((prev) => prev.filter((wb) => wb.workBookId !== workBookId));
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to delete workbook')
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // 문제집 수정
  const editWorkBook = async (workBookId: number, title: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // const userId = 1; // 임시
      await updateWorkBook(workBookId, title);
      setWorkbooks((prev) =>
        prev.map((wb) => (wb.workBookId === workBookId ? { ...wb, title } : wb))
      );
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to update workbook')
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    workbooks,
    isLoading,
    error,
    fetchWorkBooks,
    createNewWorkBook,
    removeWorkBook,
    editWorkBook,
  };
};
