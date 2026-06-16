export type QuestionType = 'single' | 'multiple'

export interface Option {
  key: string
  text: string
}

export interface QuestionPublic {
  id: number
  type: QuestionType
  text: string
  options: Option[]
  order_index: number
}

export interface QuestionFull extends QuestionPublic {
  correct: string[]
  explanation?: string | null
}

export interface QuestionInput {
  type: QuestionType
  text: string
  options: Option[]
  correct: string[]
  explanation?: string | null
  order_index?: number
}

export interface ExamListItem {
  id: number
  title: string
  description?: string | null
  image_url?: string | null
  time_limit_seconds?: number | null
  question_count: number
  owner_username?: string | null
  created_at: string
}

export interface ExamDetailPublic {
  id: number
  title: string
  description?: string | null
  image_url?: string | null
  time_limit_seconds?: number | null
  owner_id: number
  created_at: string
  questions: QuestionPublic[]
}

export interface ExamDetailFull {
  id: number
  title: string
  description?: string | null
  image_url?: string | null
  time_limit_seconds?: number | null
  owner_id: number
  created_at: string
  questions: QuestionFull[]
}

export interface ExamPayload {
  title: string
  description?: string | null
  image_url?: string | null
  time_limit_seconds?: number | null
  questions: QuestionInput[]
}

export interface QuestionResult {
  question_id: number
  text: string
  selected: string[]
  correct: string[]
  is_correct: boolean
  explanation?: string | null
}

export interface AttemptListItem {
  id: number
  exam_id: number
  exam_title: string
  score: number
  total: number
  percentage: number
  duration_seconds: number
  created_at: string
}

export interface AttemptDetail extends AttemptListItem {
  detail: QuestionResult[]
}

export interface User {
  id: number
  username: string
  display_name?: string | null
  created_at: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: User
}
