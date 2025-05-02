import {
  CreateWorkBookResponse,
  GetWorkBooksResponse,
  WorkBook,
} from '@/types/list';
import axiosInstance from '@/apis/axiosInstance';

// 문제집 전체 조회 API
export const getWorkBooks = async (userId: number): Promise<WorkBook[]> => {
  try {
    const response = await axiosInstance.get<GetWorkBooksResponse>(
      `/api/workbooks/${userId}`
    );
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch workbooks:', error);
    throw error;
  }
};

// 문제집 생성 API
export const createWorkBook = async (
  userId: number,
  title: string
): Promise<CreateWorkBookResponse> => {
  try {
    const response = await axiosInstance.post<CreateWorkBookResponse>(
      `/api/workbooks/${userId}`,
      { title }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to create workbook:', error);
    throw error;
  }
};

// 문제집 삭제 API
export const deleteWorkBook = async (
  userId: number,
  workBookId: number,
  title: string
): Promise<void> => {
  try {
    await axiosInstance.delete(`/api/workbooks/${userId}/${workBookId}`, {
      data: { title },
    });
  } catch (error) {
    console.error('Failed to delete workbook:', error);
    throw error;
  }
};

// 문제집 수정 API
export const updateWorkBook = async (
  workBookId: number,
  title: string
): Promise<void> => {
  try {
    await axiosInstance.patch(`/api/workbooks/${workBookId}`, {
      title,
    });
  } catch (error) {
    console.error('Failed to update workbook:', error);
    throw error;
  }
};
