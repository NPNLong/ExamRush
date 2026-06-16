from typing import List, Optional

from pydantic import BaseModel, Field, model_validator

from models.question import QuestionType


class Option(BaseModel):
    key: str = Field(..., max_length=8)
    text: str


class QuestionIn(BaseModel):
    type: QuestionType = QuestionType.single
    text: str
    options: List[Option]
    correct: List[str]
    explanation: Optional[str] = None
    order_index: int = 0

    @model_validator(mode="after")
    def _validate(self):
        keys = [o.key for o in self.options]
        if len(keys) < 2:
            raise ValueError("Mỗi câu hỏi cần ít nhất 2 lựa chọn")
        if len(set(keys)) != len(keys):
            raise ValueError("Các lựa chọn không được trùng key")
        if not self.correct:
            raise ValueError("Cần ít nhất 1 đáp án đúng")
        for c in self.correct:
            if c not in keys:
                raise ValueError(f"Đáp án đúng '{c}' không nằm trong các lựa chọn")
        if self.type == QuestionType.single and len(self.correct) != 1:
            raise ValueError("Câu hỏi chọn 1 đáp án chỉ được có đúng 1 đáp án đúng")
        return self


class QuestionPublic(BaseModel):
    """Dùng khi làm bài — KHÔNG lộ đáp án đúng."""
    id: int
    type: QuestionType
    text: str
    options: List[Option]
    order_index: int

    class Config:
        from_attributes = True


class QuestionFull(QuestionPublic):
    """Dùng khi chủ sở hữu xem/sửa — có đáp án."""
    correct: List[str]
    explanation: Optional[str] = None
