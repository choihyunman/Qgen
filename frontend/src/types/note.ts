export interface NoteProps {
  currentNumber: number;
  totalNumber: number;
  test: string;
  options: string[];
  selectedOption: number | null;
  isSubmitted: boolean;
  answerIndex: number;
  explanation: string;
  onSelect: (index: number) => void;
  onNext: () => void;
}

export interface TestListProps {
  currentNumber: number;
  totalTests: number;
  onTestClick: (testNumber: number) => void;
}

// 시험지 전체 조회 응답 타입 (API)
export interface TestPaper {
  testPaperId: number;
  title: string;
  quantity: number;
}

export interface GetNoteTestPapersResponse {
  success: boolean;
  status: number;
  message: string;
  data: TestPaper[];
  timestamp: string;
  path: string;
}
