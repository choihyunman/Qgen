import axiosInstance from '../axiosInstance';
import type { TestPaper, GetNoteTestPapersResponse } from '@/types/note';

// 시험지 전체 조회 API
export const getNoteTestPapers = async (workBookId: number) => {
  const response = await axiosInstance.get<GetNoteTestPapersResponse>(
    `/api/note/${workBookId}`
  );
  return response.data;
};
