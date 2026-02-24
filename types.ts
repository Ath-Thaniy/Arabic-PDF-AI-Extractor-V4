export type SegmentType = 'TITLE' | 'HEADING' | 'DEFINITION' | 'EXAMPLE' | 'WORD' | 'TEXT' | 'EXERCISE' | 'NUMBER';

export interface ExerciseAnswer {
  arabic: string;
  english: string;
  filipino: string;
}

export interface TranslatedSegment {
  arabic: string;
  english: string;
  filipino: string;
  type: SegmentType;
  teachingScript?: string;
  teachingScriptArabic?: string;
  teachingScriptFilipino?: string;
  exerciseAnswers?: ExerciseAnswer[];
}

export interface ExtractionResult {
  segments: TranslatedSegment[];
  fileName: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
