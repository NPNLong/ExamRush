from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field

from schemas.question import QuestionFull, QuestionIn, QuestionPublic


class ExamCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    image_url: Optional[str] = None
    time_limit_seconds: Optional[int] = Field(None, ge=0)
    questions: List[QuestionIn] = []


class ExamUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    image_url: Optional[str] = None
    time_limit_seconds: Optional[int] = Field(None, ge=0)
    # Nếu gửi questions => thay thế toàn bộ danh sách câu hỏi
    questions: Optional[List[QuestionIn]] = None


class ExamListItem(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    time_limit_seconds: Optional[int] = None
    question_count: int
    owner_username: Optional[str] = None
    created_at: datetime


class ExamDetailPublic(BaseModel):
    """Khi vào làm bài."""
    id: int
    title: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    time_limit_seconds: Optional[int] = None
    owner_id: int
    created_at: datetime
    questions: List[QuestionPublic]

    class Config:
        from_attributes = True


class ExamDetailFull(BaseModel):
    """Khi chủ sở hữu sửa bài."""
    id: int
    title: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    time_limit_seconds: Optional[int] = None
    owner_id: int
    created_at: datetime
    questions: List[QuestionFull]

    class Config:
        from_attributes = True
