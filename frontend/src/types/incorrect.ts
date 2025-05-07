export interface IncorrectTestProps {
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
  onTestClick: (TestNumber: number) => void;
}
