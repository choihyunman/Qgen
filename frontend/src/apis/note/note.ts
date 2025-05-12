import axiosInstance from '../axiosInstance';
import type {
  TestPaper,
  GetNoteTestPapersResponse,
  GetNoteTestDetailResponse,
  GetNoteTestIdListResponse,
} from '@/types/note';

// 시험지 전체 조회 API
export const getNoteTestPapers = async (workBookId: number) => {
  const response = await axiosInstance.get<GetNoteTestPapersResponse>(
    `/api/note/${workBookId}`
  );
  return response.data;
};

// 문제 상세 조회 API
export const getNoteTestDetail = async (testId: number) => {
  const response = await axiosInstance.get<GetNoteTestDetailResponse>(
    `/api/note/detail/${testId}`
  );
  return response.data;
};

// 시험지 내 문제 ID 리스트 조회 API
export const getNoteTestIdList = async (
  testPaperId: number
): Promise<number[]> => {
  const response = await axiosInstance.get<GetNoteTestIdListResponse>(
    `/api/note/list/${testPaperId}`
  );
  return response.data.data;
};
