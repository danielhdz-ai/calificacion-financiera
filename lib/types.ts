export type AnswerValue = string | number;

export type QuestionOption = {
  label: string;
  value: AnswerValue;
  score: number;
};

export type Question = {
  id: string;
  category: string;
  title: string;
  description?: string;
  options: QuestionOption[];
};

export type QualificationLevel =
  | "excelente"
  | "buena"
  | "regular"
  | "requiere-atencion";

export type QualificationResult = {
  score: number;
  level: QualificationLevel;
  title: string;
  summary: string;
  recommendations: string[];
  categoryScores: Record<string, number>;
};

export type Answers = Record<string, AnswerValue>;
