from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from core.deps import get_current_user
from database import get_db
from models.attempt import Attempt
from models.user import User
from schemas.attempt import AttemptDetail, AttemptListItem

router = APIRouter(prefix="/api/attempts", tags=["History"])


@router.get("", response_model=list[AttemptListItem])
def list_attempts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rows = (
        db.query(Attempt)
        .options(joinedload(Attempt.exam))
        .filter(Attempt.user_id == current_user.id)
        .order_by(Attempt.created_at.desc())
        .all()
    )
    return [
        AttemptListItem(
            id=a.id,
            exam_id=a.exam_id,
            exam_title=a.exam.title if a.exam else "(Đã xóa)",
            score=a.score,
            total=a.total,
            percentage=a.percentage,
            duration_seconds=a.duration_seconds,
            created_at=a.created_at,
        )
        for a in rows
    ]


@router.get("/{attempt_id}", response_model=AttemptDetail)
def get_attempt(
    attempt_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    a = (
        db.query(Attempt)
        .options(joinedload(Attempt.exam))
        .filter(Attempt.id == attempt_id)
        .first()
    )
    if not a:
        raise HTTPException(status_code=404, detail="Không tìm thấy lịch sử làm bài")
    if a.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Không có quyền xem")
    return AttemptDetail(
        id=a.id,
        exam_id=a.exam_id,
        exam_title=a.exam.title if a.exam else "(Đã xóa)",
        score=a.score,
        total=a.total,
        percentage=a.percentage,
        duration_seconds=a.duration_seconds,
        created_at=a.created_at,
        detail=a.detail,
    )
