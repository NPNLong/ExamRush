import enum

from sqlalchemy import Column, Enum as SQLEnum, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from database import Base


class QuestionType(str, enum.Enum):
    single = "single"      # chọn 1 đáp án
    multiple = "multiple"  # chọn nhiều đáp án


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(Integer, ForeignKey("exams.id", ondelete="CASCADE"), nullable=False)
    type = Column(SQLEnum(QuestionType), default=QuestionType.single, nullable=False)
    text = Column(Text, nullable=False)
    # options: [{"key": "A", "text": "..."}, ...]
    options = Column(JSONB, nullable=False, default=list)
    # correct: ["A"] for single, ["A", "C"] for multiple
    correct = Column(JSONB, nullable=False, default=list)
    explanation = Column(Text, nullable=True)
    order_index = Column(Integer, default=0, nullable=False)

    exam = relationship("Exam", back_populates="questions")
