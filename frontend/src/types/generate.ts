export interface TestType {
  name: string;
  count: number;
}

export interface GenerateRequest {
  workBookId: number;
  title: string;
  choiceAns: number;
  shortAns: number;
  oxAns: number;
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
    oxAns: number;
  } | null;
  timestamp: string;
  path: string;
}
