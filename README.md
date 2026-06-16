<div align="center">

<img src="frontend/public/favicon.svg" width="84" height="84" alt="ExamRush logo" />

# ExamRush

### ⚡ Create, take, and review multiple-choice exams — fast.

A modern, full-stack quiz & exam-practice platform with instant scoring, attempt history,
JSON import, bilingual UI, and a polished dark/light interface.

<br/>

[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://docs.docker.com/compose/)
[![License: MIT](https://img.shields.io/badge/License-MIT-22C55E.svg)](LICENSE)

<a href="#-quick-start"><b>Quick Start</b></a> ·
<a href="#-features"><b>Features</b></a> ·
<a href="#-architecture"><b>Architecture</b></a> ·
<a href="#-generate-questions-with-ai"><b>AI Prompt</b></a> ·
<a href="#-api-reference"><b>API</b></a> ·
<a href="#-license"><b>License</b></a>

</div>

---

## 📖 Overview

**ExamRush** is a self-hosted web application for building and practicing multiple-choice
exams. Author questions by hand or import them from JSON, run them in a distraction-free
test mode with an optional countdown timer, get scored instantly, and review every answer
with explanations. All attempts are stored so you can track your progress over time.

It ships as a single `docker compose up` away from running — a FastAPI + PostgreSQL + Redis
backend and a Vite + React + Tailwind frontend, wired together out of the box.

> **Demo account** — `username: demo` · `password: 123456`

---

## ✨ Features

| | |
| --- | --- |
| 🔐 **Authentication** | Username/password sign-up & login secured with JWT and bcrypt hashing. |
| ✍️ **Exam authoring** | Create exams with title, cover image, description, optional time limit, and rich questions. |
| ☑️ **Question types** | Single-answer and multiple-answer questions, each with an optional explanation. |
| 📥 **JSON import / export** | Bulk-import exams from JSON and download a ready-made sample template. |
| ⏱️ **Focused test mode** | Full-screen practice flow with a live countdown and auto-submit on timeout. |
| 🎯 **Instant scoring** | Automatic grading the moment you submit, with a percentage and per-question breakdown. |
| 📊 **Attempt history** | Every attempt is saved; revisit detailed reviews of correct vs. selected answers anytime. |
| 🌗 **Light / dark mode** | System-aware theme with a smooth, animated toggle. |
| 🌐 **Bilingual UI** | Full Vietnamese 🇻🇳 / English 🇬🇧 interface, switchable on the fly. |
| ⚡ **Snappy & cached** | ORJSON responses + Redis-cached exam listings for low-latency loads. |

---

## 🧰 Tech Stack

<table>
<tr><th>Layer</th><th>Technologies</th></tr>
<tr>
  <td><b>Frontend</b></td>
  <td>Vite 5 · React 18 · TypeScript 5.6 · Tailwind CSS v4 · Framer Motion · React Router · React Icons (Lucide)</td>
</tr>
<tr>
  <td><b>Backend</b></td>
  <td>FastAPI · SQLAlchemy 2 · Pydantic v2 · ORJSON · python-jose (JWT) · bcrypt · Uvicorn</td>
</tr>
<tr>
  <td><b>Data</b></td>
  <td>PostgreSQL 16 (persistent storage) · Redis 7 (caching)</td>
</tr>
<tr>
  <td><b>Tooling</b></td>
  <td>Docker · Docker Compose</td>
</tr>
</table>

---

## 🏗️ Architecture

```mermaid
flowchart LR
    User(["🧑 Browser"])

    subgraph Frontend["Frontend · :5173"]
        UI["React + Vite + Tailwind"]
    end

    subgraph Backend["Backend · :8000"]
        API["FastAPI"]
    end

    subgraph Data["Data layer"]
        PG[("PostgreSQL 16<br/>:5433 → 5432")]
        RD[("Redis 7<br/>:6379")]
    end

    User <--> UI
    UI -- "REST /api · JWT" --> API
    API -- "SQLAlchemy" --> PG
    API -- "cache reads" --> RD
```

**Request flow:** the React SPA talks to the FastAPI backend over a REST API under `/api`,
authenticating with a JWT bearer token. The backend persists users, exams, questions, and
attempts in PostgreSQL via SQLAlchemy, and caches read-heavy exam listings in Redis.
On startup the API creates tables and seeds demo data automatically.

---

## 🚀 Quick Start

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/), or Docker Engine with the Compose plugin
- Free host ports: `5173`, `8000`, `5433`, `6379`

### Run the full stack

```bash
git clone <your-repo-url> ExamRush
cd ExamRush
docker compose up --build
```

That single command builds and starts all four services. Once they're healthy:

| Service | URL | |
| --- | --- | --- |
| 🖥️ **Frontend** | <http://localhost:5173> | The web app |
| 📚 **API docs** | <http://localhost:8000/docs> | Interactive Swagger UI |
| 🐘 **PostgreSQL** | `localhost:5433` | From your host |
| 🧠 **Redis** | `localhost:6379` | From your host |

Sign in with the demo account (`demo` / `123456`) or register your own.

> 💡 Run in the background with `docker compose up -d --build`.

---

## 🐳 Docker Compose Cheatsheet

```bash
# Start (foreground, rebuild)            # Start (detached)
docker compose up --build                docker compose up -d --build

# Follow logs (all / one service)
docker compose logs -f
docker compose logs -f backend           # backend | frontend | postgres | redis

# Rebuild / restart a single service
docker compose build backend
docker compose restart frontend

# Open a shell inside a container
docker compose exec backend sh

# Stop (keep database)                   # Stop + wipe database volume
docker compose down                      docker compose down -v
```

> ⚠️ `docker compose down -v` deletes the `pgdata` volume and **all** local ExamRush data.
> Use it only for a clean reset.

**Connect to PostgreSQL:**

```bash
# From the host
psql postgresql://examrush:examrush@localhost:5433/examrush

# From inside the Docker network
docker compose exec postgres psql -U examrush -d examrush
```

---

## 🔌 Ports

| Service | Host Port | Container Port |
| --- | ---: | ---: |
| Frontend | `5173` | `5173` |
| Backend | `8000` | `8000` |
| PostgreSQL | `5433` | `5432` |
| Redis | `6379` | `6379` |

> PostgreSQL is exposed on host port **`5433`** on purpose, because many machines already
> run a local PostgreSQL on `5432`. Inside Docker the backend still connects to `postgres:5432`.

---

## ⚙️ Configuration

The backend reads environment variables from `backend/.env`. Copy the example first:

```bash
cd backend
cp .env.example .env        # Windows: copy .env.example .env
```

**When running inside Docker Compose:**

```env
DATABASE_URL=postgresql://examrush:examrush@postgres:5432/examrush
REDIS_URL=redis://redis:6379/0
FRONTEND_URL=http://localhost:5173
```

**When running the backend locally against the Compose database:**

```env
DATABASE_URL=postgresql://examrush:examrush@localhost:5433/examrush
REDIS_URL=redis://localhost:6379/0
FRONTEND_URL=http://localhost:5173
```

---

## 💻 Local Development (without Docker)

PostgreSQL and Redis must already be running (you can reuse the Compose containers).

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # Windows: copy .env.example .env
uvicorn main:app --reload --port 8000
```

> If you point at the Compose PostgreSQL container, use port `5433` in `DATABASE_URL`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server runs at <http://localhost:5173> and proxies `/api` to <http://localhost:8000>.

---

## 🤖 Generate Questions with AI

Don't write 50 questions by hand — let an AI assistant build them from your study
material. ExamRush ships with a battle-tested prompt that produces a balanced,
exam-ready question set and exports it directly as **import-ready JSON**.

> 🌐 **In the app:** sign in and open the **Guide** page (`/guide`) to read the prompt and
> copy it with one click.

**Workflow:** copy the prompt → paste into ChatGPT / Claude / Gemini with your document
(text, image, or PDF) → the AI returns 50 questions as a single JSON block in the
[ExamRush import format](#-json-import-format) → save it as a `.json` file and import it.

The prompt enforces strict quality rules: content stays within your document, exactly
50 questions, a fixed difficulty split (15 easy / 25 medium / 10 hard), an even
answer-key distribution (A=13, B=13, C=12, D=12), no more than two identical answers in a
row, per-question explanations, topic tags, and source references — all emitted as valid
JSON ready to paste into the importer.

<details>
<summary><b>📋 Click to view / copy the full prompt</b></summary>

````text
Bạn là trợ lý ôn thi môn **An ninh di động**.

Tôi sẽ gửi tài liệu từng chương dưới dạng text, hình ảnh hoặc PDF. Nhiệm vụ của bạn là đọc kỹ tài liệu đó và tạo ra **50 câu hỏi trắc nghiệm có đáp án**, sau đó xuất ra **một file JSON đúng định dạng** để tôi import trực tiếp vào ExamRush.

## 1. Nguyên tắc nội dung

Chỉ tạo câu hỏi dựa trên nội dung tài liệu tôi gửi.

* Không tự bịa kiến thức ngoài tài liệu.
* Nếu cần suy luận, phải ghi rõ là “suy luận từ tài liệu”.
* Nếu tài liệu thiếu thông tin, hãy ghi chú ở cuối.
* Không tạo câu hỏi vượt ngoài phạm vi tài liệu.

## 2. Số lượng và cấu trúc câu hỏi

Tạo đúng **50 câu hỏi trắc nghiệm**, mỗi câu có 4 lựa chọn A, B, C, D.

Yêu cầu:

* Chỉ có 1 đáp án đúng.
* Không để lộ đáp án trong câu hỏi.
* Không dùng quá nhiều câu kiểu “Tất cả đáp án trên”.
* Câu hỏi rõ ràng, đúng trọng tâm ôn thi.
* Các phương án nhiễu phải hợp lý, không quá vô lý.

## 3. Quy tắc phân bổ đáp án đúng BẮT BUỘC

Không được để đáp án đúng lệch quá nhiều về một chữ cái.

Phân bổ đáp án đúng cho 50 câu như sau:

* A: 13 câu
* B: 13 câu
* C: 12 câu
* D: 12 câu

Ngoài ra:

* Không được có quá 2 câu liên tiếp có cùng đáp án đúng.
* Không được mặc định đặt đáp án đúng ở A.
* Trước khi xuất file, phải tự đếm số lượng đáp án A/B/C/D.
* Nếu phân bổ chưa đúng, phải tự sửa lại vị trí các lựa chọn trước khi xuất file.

## 4. Phân bổ độ khó

Tạo đúng:

* 15 câu Dễ: kiểm tra khái niệm, định nghĩa, thuật ngữ.
* 25 câu Trung bình: kiểm tra hiểu bản chất, so sánh, phân biệt, nguyên lý hoạt động.
* 10 câu Khó: tình huống áp dụng, phân tích kịch bản tấn công/phòng thủ, chọn phương án đúng nhất.

## 5. Phân bổ nội dung

Bao phủ đều các phần quan trọng trong chương.

Ưu tiên các nhóm kiến thức:

* mô hình bảo mật,
* mối đe dọa,
* lỗ hổng,
* mã độc di động,
* quyền ứng dụng,
* xác thực,
* mã hóa,
* bảo mật Android/iOS,
* bảo mật mạng di động,
* tấn công và phòng chống.

Tránh tạo nhiều câu hỏi trùng ý.

## 6. Thông tin cần có cho mỗi câu

Với mỗi câu hỏi, cung cấp:

* Câu hỏi
* 4 lựa chọn A/B/C/D
* Đáp án đúng
* Giải thích ngắn gọn vì sao đúng
* Độ khó: Dễ / Trung bình / Khó
* Chủ đề nhỏ
* Nguồn trong tài liệu: trang, slide, mục, hoặc đoạn liên quan nếu xác định được

## 7. File JSON để import vào ExamRush

Sau khi tạo câu hỏi, hãy xuất ra **MỘT khối JSON hợp lệ** đúng theo cấu trúc sau (đây là định dạng import của ExamRush):

```json
{
  "title": "Tên chương / bài thi",
  "description": "Mô tả ngắn về bài thi",
  "image_url": "",
  "time_limit_seconds": 3000,
  "questions": [
    {
      "type": "single",
      "text": "Nội dung câu hỏi?",
      "options": [
        { "key": "A", "text": "Lựa chọn A" },
        { "key": "B", "text": "Lựa chọn B" },
        { "key": "C", "text": "Lựa chọn C" },
        { "key": "D", "text": "Lựa chọn D" }
      ],
      "correct": ["B"],
      "explanation": "Giải thích ngắn gọn vì sao đúng. [Độ khó: Trung bình | Chủ đề: Xác thực | Nguồn: slide 12]"
    }
  ]
}
```

Quy định JSON BẮT BUỘC:

* `type` luôn là `"single"`.
* Mỗi câu có đúng 4 phần tử trong `options` với `key` lần lượt là `"A"`, `"B"`, `"C"`, `"D"`.
* `correct` là một mảng chứa **đúng 1** key, ví dụ `["B"]`.
* `explanation` gồm phần giải thích ngắn, kèm theo độ khó / chủ đề / nguồn đặt trong ngoặc vuông ở cuối: `[Độ khó: ... | Chủ đề: ... | Nguồn: ...]`.
* `title` đặt theo tên chương, `time_limit_seconds` để `3000` (có thể đổi, hoặc `null` nếu không giới hạn), `image_url` để chuỗi rỗng `""`.
* Mảng `questions` phải có đúng 50 phần tử.
* JSON phải hợp lệ, parse được ngay, **không thêm chú thích bên trong JSON** và không bọc thêm văn bản thừa trong khối JSON — chỉ một khối JSON duy nhất để tôi sao chép và lưu thành file `.json`.

## 8. Kiểm tra trước khi xuất file

Trước khi xuất JSON, hãy tự kiểm tra:

* Có đúng 50 câu không?
* Có đủ 4 đáp án mỗi câu không?
* Có đúng 1 đáp án đúng không?
* Có đúng phân bổ độ khó 15/25/10 không?
* Có đúng phân bổ đáp án A=13, B=13, C=12, D=12 không?
* Có quá 2 đáp án giống nhau liên tiếp không?
* Có câu hỏi trùng ý không?
* Có câu nào quá mơ hồ không?
* Có câu nào vượt ngoài tài liệu không?
* JSON có hợp lệ và parse được không? (đúng dấu phẩy, ngoặc, đủ 4 key A/B/C/D mỗi câu)

Nếu phát hiện lỗi, hãy tự sửa trước khi xuất file.

## 9. Nếu tài liệu là hình ảnh hoặc PDF

* Hãy đọc toàn bộ nội dung nhìn thấy được.
* Nếu chữ bị mờ hoặc thiếu trang, hãy báo rõ phần nào không đọc được.
* Vẫn tạo câu hỏi dựa trên phần đọc được.
* Không tự suy đoán phần bị thiếu.

## 10. Kết quả cần trả về

Bắt đầu bằng việc tóm tắt ngắn chương này trong 5–7 gạch đầu dòng.

Sau đó liệt kê 50 câu hỏi kèm đáp án đúng, độ khó, chủ đề và nguồn để tôi rà soát.

Sau đó xuất **khối JSON import-ready** theo định dạng ở mục 7.

Cuối cùng, hãy hiển thị bảng tóm tắt gồm:

* Tổng số câu
* Số câu Dễ / Trung bình / Khó
* Số đáp án đúng A / B / C / D
* Các chủ đề đã bao phủ
* Có bao nhiêu câu có nguồn rõ ràng từ tài liệu
* Ghi chú nếu có phần tài liệu không đọc được hoặc thiếu nguồn
````

</details>

> 💡 The prompt is written for the **Mobile Security** (*An ninh di động*) course — change
> the subject name on the first line to reuse it for any other subject.

---

## 📦 JSON Import Format

Use this shape in the exam editor's **Import from JSON** option:

```json
{
  "title": "Sample Exam",
  "description": "Short description",
  "image_url": "https://example.com/image.jpg",
  "time_limit_seconds": 600,
  "questions": [
    {
      "type": "single",
      "text": "What is the correct answer?",
      "options": [
        { "key": "A", "text": "Option A" },
        { "key": "B", "text": "Option B" }
      ],
      "correct": ["A"],
      "explanation": "Optional explanation"
    }
  ]
}
```

| Field | Notes |
| --- | --- |
| `type` | `"single"` or `"multiple"`. |
| `correct` | Array of option `key`s. |
| `time_limit_seconds` | Omit or set `null` for no timer. |
| `explanation` | Optional. |

---

## 📡 API Reference

Base path: `/api` · Interactive docs at [`/docs`](http://localhost:8000/docs).

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new account |
| `POST` | `/api/auth/login` | Log in and receive a JWT |
| `GET` | `/api/auth/me` | Get the current user |
| `GET` | `/api/exams` | List exams *(Redis-cached)* |
| `GET` | `/api/exams/{id}` | Get exam details for taking |
| `GET` | `/api/exams/{id}/full` | Get exam **with answers** (owner only) |
| `POST` | `/api/exams` | Create an exam |
| `PUT` | `/api/exams/{id}` | Update an exam |
| `DELETE` | `/api/exams/{id}` | Delete an exam |
| `POST` | `/api/exams/{id}/submit` | Submit and score an attempt |
| `GET` | `/api/attempts` | List attempt history |
| `GET` | `/api/attempts/{id}` | Get attempt details |

---

## 🗂️ Project Structure

```text
ExamRush/
├── docker-compose.yml          # Orchestrates all four services
├── README.md
├── backend/                    # FastAPI application
│   ├── main.py                 # App entry, CORS, lifespan, routers
│   ├── database.py             # Engine, session, init_db()
│   ├── seed.py                 # Demo data seeding
│   ├── core/                   # config, security (JWT), cache (Redis), deps
│   ├── models/                 # SQLAlchemy models (user, exam, question, attempt)
│   ├── routers/                # API routes (auth, exams, attempts)
│   ├── schemas/                # Pydantic request/response schemas
│   └── requirements.txt
└── frontend/                   # Vite + React app
    ├── src/
    │   ├── components/          # Header, PageWrapper, AttemptReview, ...
    │   ├── context/            # Auth, Theme, I18n providers
    │   ├── i18n/               # VI / EN translations
    │   ├── lib/                # API client & shared types
    │   └── pages/              # Home, Practice, ExamTake, Result, History, ...
    ├── public/
    ├── package.json
    └── vite.config.ts
```

---

## 🩺 Troubleshooting

<details>
<summary><b>PostgreSQL won't start — port already in use</b></summary>

Confirm the host binding in `docker-compose.yml` is `5433:5432`, and that nothing else is
holding port `5433`.
</details>

<details>
<summary><b>Backend can't connect to PostgreSQL (in Docker)</b></summary>

Keep the in-network value:

```env
DATABASE_URL=postgresql://examrush:examrush@postgres:5432/examrush
```
</details>

<details>
<summary><b>Backend can't connect to PostgreSQL (running locally)</b></summary>

Point at the host-published port:

```env
DATABASE_URL=postgresql://examrush:examrush@localhost:5433/examrush
```
</details>

<details>
<summary><b>Containers in a weird state — rebuild</b></summary>

```bash
# Keep database data
docker compose down && docker compose up --build

# Full clean reset (also wipes the database)
docker compose down -v && docker compose up --build
```
</details>

---

## 🗺️ Roadmap

- [ ] Exam categories & tags
- [ ] Per-question scoring weights
- [ ] Leaderboards and shareable results
- [ ] Image attachments on questions
- [ ] CSV / spreadsheet import

---

## 👤 Author

**Nguyen Phuoc Nguong Long** — design & development.

---

## 📄 License

This project is licensed under the **MIT License**.

```text
MIT License

Copyright (c) 2026 Nguyen Phuoc Nguong Long
```

You are free to use, copy, modify, merge, publish, and distribute this software,
provided the copyright notice and permission notice are included.
See the [LICENSE](LICENSE) file for the full text.

---

<div align="center">

Built with ❤️ by <b>Nguyen Phuoc Nguong Long</b> · Powered by <b>FastAPI</b> + <b>React</b>.

</div>
