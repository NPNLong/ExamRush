from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, selectinload

from core.cache import cache_delete, cache_delete_pattern, cache_get, cache_set
from core.deps import get_current_user, get_optional_user
from database import get_db
from models.attempt import Attempt
from models.exam import Exam
from models.question import Question
from models.user import User
from schemas.attempt import AttemptDetail, SubmitIn
from schemas.exam import (
    ExamCreate,
    ExamDetailFull,
    ExamDetailPublic,
    ExamListItem,
    ExamUpdate,
)

router = APIRouter(prefix="/api/exams", tags=["Exams"])

_LIST_CACHE = "exam:list:all"


def _bust(exam_id: int | None = None):
    cache_delete(_LIST_CACHE)
    if exam_id:
        cache_delete(f"exam:public:{exam_id}")


def _build_questions(exam: Exam, payload_questions) -> None:
    """Replace exam.questions in place from a list of QuestionIn."""
    exam.questions.clear()
    for i, q in enumerate(payload_questions):
        exam.questions.append(
            Question(
                type=q.type,
                text=q.text,
                options=[o.model_dump() for o in q.options],
                correct=q.correct,
                explanation=q.explanation,
                order_index=q.order_index or i,
            )
        )


# ─── List ────────────────────────────────────────────────────────────────────
@router.get("", response_model=list[ExamListItem])
def list_exams(db: Session = Depends(get_db)):
    cached = cache_get(_LIST_CACHE)
    if cached is not None:
        return cached

    rows = (
        db.query(Exam)
        .options(selectinload(Exam.questions), selectinload(Exam.owner))
        .order_by(Exam.created_at.desc())
        .all()
    )
    result = [
        ExamListItem(
            id=e.id,
            title=e.title,
            description=e.description,
            image_url=e.image_url,
            time_limit_seconds=e.time_limit_seconds,
            question_count=len(e.questions),
            owner_username=e.owner.username if e.owner else None,
            created_at=e.created_at,
        ).model_dump()
        for e in rows
    ]
    cache_set(_LIST_CACHE, result)
    return result


# ─── Get (public, for taking — no answers) ─────────────────────────────────────
@router.get("/{exam_id}", response_model=ExamDetailPublic)
def get_exam(exam_id: int, db: Session = Depends(get_db)):
    cached = cache_get(f"exam:public:{exam_id}")
    if cached is not None:
        return cached

    exam = (
        db.query(Exam)
        .options(selectinload(Exam.questions))
        .filter(Exam.id == exam_id)
        .first()
    )
    if not exam:
        raise HTTPException(status_code=404, detail="Không tìm thấy bài thi")

    data = ExamDetailPublic.model_validate(exam, from_attributes=True).model_dump()
    cache_set(f"exam:public:{exam_id}", data)
    return data


# ─── Get full (owner, for editing — with answers) ──────────────────────────────
@router.get("/{exam_id}/full", response_model=ExamDetailFull)
def get_exam_full(
    exam_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    exam = (
        db.query(Exam)
        .options(selectinload(Exam.questions))
        .filter(Exam.id == exam_id)
        .first()
    )
    if not exam:
        raise HTTPException(status_code=404, detail="Không tìm thấy bài thi")
    if exam.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bạn không có quyền sửa bài thi này")
    return exam


# ─── Create ────────────────────────────────────────────────────────────────────
@router.post("", response_model=ExamDetailFull, status_code=201)
def create_exam(
    body: ExamCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    exam = Exam(
        owner_id=current_user.id,
        title=body.title,
        description=body.description,
        image_url=body.image_url,
        time_limit_seconds=body.time_limit_seconds or None,
    )
    _build_questions(exam, body.questions)
    db.add(exam)
    db.commit()
    db.refresh(exam)
    _bust()
    return exam


# ─── Update ────────────────────────────────────────────────────────────────────
@router.put("/{exam_id}", response_model=ExamDetailFull)
def update_exam(
    exam_id: int,
    body: ExamUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Không tìm thấy bài thi")
    if exam.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bạn không có quyền sửa bài thi này")

    data = body.model_dump(exclude_unset=True)
    for field in ("title", "description", "image_url", "time_limit_seconds"):
        if field in data:
            setattr(exam, field, data[field] or (None if field != "title" else exam.title))
    if body.questions is not None:
        _build_questions(exam, body.questions)

    db.commit()
    db.refresh(exam)
    _bust(exam_id)
    return exam


# ─── Delete ────────────────────────────────────────────────────────────────────
@router.delete("/{exam_id}", status_code=204)
def delete_exam(
    exam_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Không tìm thấy bài thi")
    if exam.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bạn không có quyền xóa bài thi này")
    db.delete(exam)
    db.commit()
    _bust(exam_id)
    return None


# ─── Submit / chấm điểm ─────────────────────────────────────────────────────────
@router.post("/{exam_id}/submit", response_model=AttemptDetail)
def submit_exam(
    exam_id: int,
    body: SubmitIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    exam = (
        db.query(Exam)
        .options(selectinload(Exam.questions))
        .filter(Exam.id == exam_id)
        .first()
    )
    if not exam:
        raise HTTPException(status_code=404, detail="Không tìm thấy bài thi")

    selected_map: dict[int, set[str]] = {
        a.question_id: set(a.selected) for a in body.answers
    }

    detail = []
    score = 0
    for q in exam.questions:
        correct = set(q.correct)
        selected = selected_map.get(q.id, set())
        is_correct = selected == correct and len(selected) > 0
        if is_correct:
            score += 1
        detail.append(
            {
                "question_id": q.id,
                "text": q.text,
                "selected": sorted(selected),
                "correct": sorted(correct),
                "is_correct": is_correct,
                "explanation": q.explanation,
            }
        )

    total = len(exam.questions)
    percentage = round(score / total * 100, 1) if total else 0.0

    attempt = Attempt(
        user_id=current_user.id,
        exam_id=exam.id,
        score=score,
        total=total,
        percentage=percentage,
        duration_seconds=max(0, body.duration_seconds),
        detail=detail,
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    return AttemptDetail(
        id=attempt.id,
        exam_id=exam.id,
        exam_title=exam.title,
        score=score,
        total=total,
        percentage=percentage,
        duration_seconds=attempt.duration_seconds,
        created_at=attempt.created_at,
        detail=detail,
    )
