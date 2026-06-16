from contextlib import asynccontextmanager

import anyio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import ORJSONResponse

from core.config import settings
from database import init_db
from routers import attempts, auth, exams
from seed import seed


@asynccontextmanager
async def lifespan(app: FastAPI):
    limiter = anyio.to_thread.current_default_thread_limiter()
    limiter.total_tokens = 200
    init_db()
    seed()
    print("ExamRush API khởi động thành công!")
    yield


app = FastAPI(
    title="ExamRush API",
    description="Backend webapp ôn thi / tạo bài thi trắc nghiệm",
    version="1.0.0",
    lifespan=lifespan,
    default_response_class=ORJSONResponse,  # tuần tự hóa JSON nhanh => độ trễ thấp
)

_allowed_origins = list({
    settings.FRONTEND_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
})
app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(exams.router)
app.include_router(attempts.router)


@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "app": "ExamRush API", "version": "1.0.0"}
