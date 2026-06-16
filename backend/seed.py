"""Seed dữ liệu mẫu: tài khoản demo + vài bài thi mẫu."""
from database import SessionLocal
from core.security import hash_password
from models.user import User
from models.exam import Exam
from models.question import Question, QuestionType

SAMPLE_EXAMS = [
    {
        "title": "Kiến thức Python cơ bản",
        "description": "Bài ôn tập nhanh về cú pháp và khái niệm nền tảng của Python.",
        "image_url": "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&q=80",
        "time_limit_seconds": 300,
        "questions": [
            {
                "type": QuestionType.single,
                "text": "Từ khóa nào dùng để định nghĩa một hàm trong Python?",
                "options": [{"key": "A", "text": "func"}, {"key": "B", "text": "def"},
                            {"key": "C", "text": "function"}, {"key": "D", "text": "lambda"}],
                "correct": ["B"],
                "explanation": "Hàm trong Python được định nghĩa bằng từ khóa 'def'.",
            },
            {
                "type": QuestionType.multiple,
                "text": "Những kiểu dữ liệu nào sau đây là immutable (bất biến) trong Python?",
                "options": [{"key": "A", "text": "tuple"}, {"key": "B", "text": "list"},
                            {"key": "C", "text": "str"}, {"key": "D", "text": "dict"}],
                "correct": ["A", "C"],
                "explanation": "tuple và str là immutable; list và dict là mutable.",
            },
            {
                "type": QuestionType.single,
                "text": "Kết quả của biểu thức 3 // 2 là gì?",
                "options": [{"key": "A", "text": "1.5"}, {"key": "B", "text": "1"},
                            {"key": "C", "text": "2"}, {"key": "D", "text": "Lỗi"}],
                "correct": ["B"],
                "explanation": "Toán tử // là chia lấy phần nguyên, 3 // 2 = 1.",
            },
        ],
    },
    {
        "title": "Tổng quan về HTTP & Web",
        "description": "Các khái niệm cơ bản về giao thức HTTP và hoạt động của web.",
        "image_url": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
        "time_limit_seconds": None,
        "questions": [
            {
                "type": QuestionType.single,
                "text": "Mã trạng thái HTTP 404 có ý nghĩa gì?",
                "options": [{"key": "A", "text": "Thành công"}, {"key": "B", "text": "Không tìm thấy"},
                            {"key": "C", "text": "Lỗi máy chủ"}, {"key": "D", "text": "Chuyển hướng"}],
                "correct": ["B"],
                "explanation": "404 Not Found nghĩa là tài nguyên không tồn tại.",
            },
            {
                "type": QuestionType.multiple,
                "text": "Những phương thức (method) nào sau đây là của HTTP?",
                "options": [{"key": "A", "text": "GET"}, {"key": "B", "text": "PUSH"},
                            {"key": "C", "text": "POST"}, {"key": "D", "text": "DELETE"}],
                "correct": ["A", "C", "D"],
                "explanation": "GET, POST, DELETE là method HTTP. PUSH không phải.",
            },
        ],
    },
]


def seed():
    db = SessionLocal()
    try:
        demo = db.query(User).filter(User.username == "demo").first()
        if not demo:
            demo = User(
                username="demo",
                display_name="Người dùng Demo",
                hashed_password=hash_password("123456"),
            )
            db.add(demo)
            db.commit()
            db.refresh(demo)
            print("[Seed] Tài khoản demo: username=demo, password=123456")

        if db.query(Exam).filter(Exam.owner_id == demo.id).count() == 0:
            for data in SAMPLE_EXAMS:
                exam = Exam(
                    owner_id=demo.id,
                    title=data["title"],
                    description=data["description"],
                    image_url=data["image_url"],
                    time_limit_seconds=data["time_limit_seconds"],
                )
                for i, q in enumerate(data["questions"]):
                    exam.questions.append(Question(
                        type=q["type"], text=q["text"], options=q["options"],
                        correct=q["correct"], explanation=q["explanation"], order_index=i,
                    ))
                db.add(exam)
            db.commit()
            print(f"[Seed] Đã tạo {len(SAMPLE_EXAMS)} bài thi mẫu")
    finally:
        db.close()
