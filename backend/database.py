from sqlalchemy import create_engine, text
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=20,
    max_overflow=40,
    pool_timeout=30,
    pool_recycle=1800,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    from models import user, exam, question, attempt  # noqa: F401

    Base.metadata.create_all(bind=engine)
    _run_migrations()


def _run_migrations():
    """Idempotent indexes for hot-path columns."""
    migrations = [
        "CREATE INDEX IF NOT EXISTS ix_questions_exam_id ON questions (exam_id)",
        "CREATE INDEX IF NOT EXISTS ix_attempts_user_id ON attempts (user_id)",
        "CREATE INDEX IF NOT EXISTS ix_attempts_exam_id ON attempts (exam_id)",
        "CREATE INDEX IF NOT EXISTS ix_attempts_created_at ON attempts (created_at)",
        "CREATE INDEX IF NOT EXISTS ix_exams_owner_id ON exams (owner_id)",
    ]
    with engine.begin() as conn:
        for stmt in migrations:
            try:
                conn.execute(text(stmt))
            except Exception:
                pass
