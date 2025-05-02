export interface TestType {
  name: string;
  count: number;
}

export interface GenerateRequest {
  workBookId: number;
  title: string;
  choiceAns: number;
  shortAns: number;
  OXAns: number;
  wordAns: number;
  quantity: number;
}

export interface GenerateResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    Id: number;
    title: string;
    choiceAns: number;
    shortAns: number;
    wordAns: number;
    quantity: number;
    createAt: string;
    oxans: number;
  } | null;
  timestamp: string;
  path: string;
}
