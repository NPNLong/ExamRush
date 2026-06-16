from datetime import datetime
from typing import List

from pydantic import BaseModel


class AnswerIn(BaseModel):
    question_id: int
    selected: List[str] = []


class SubmitIn(BaseModel):
    answers: List[AnswerIn] = []
    duration_seconds: int = 0


class QuestionResult(BaseModel):
    question_id: int
    text: str
    selected: List[str]
    correct: List[str]
    is_correct: bool
    explanation: str | None = None


class AttemptListItem(BaseModel):
    id: int
    exam_id: int
    exam_title: str
    score: int
    total: int
    percentage: float
    duration_seconds: int
    created_at: datetime


class AttemptDetail(BaseModel):
    id: int
    exam_id: int
    exam_title: str
    score: int
    total: int
    percentage: float
    duration_seconds: int
    created_at: datetime
    detail: List[QuestionResult]
