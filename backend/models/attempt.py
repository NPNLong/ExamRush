from datetime import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from database import Base


class Attempt(Base):
    __tablename__ = "attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    exam_id = Column(Integer, ForeignKey("exams.id", ondelete="CASCADE"), nullable=False)

    score = Column(Integer, default=0, nullable=False)        # số câu đúng
    total = Column(Integer, default=0, nullable=False)        # tổng số câu
    percentage = Column(Float, default=0.0, nullable=False)   # 0-100
    duration_seconds = Column(Integer, default=0, nullable=False)

    # snapshot kết quả từng câu: [{question_id, selected, correct, is_correct}]
    detail = Column(JSONB, nullable=False, default=list)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    user = relationship("User", back_populates="attempts")
    exam = relationship("Exam", back_populates="attempts")
