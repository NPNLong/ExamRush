import { useState } from 'react'
import { motion } from 'framer-motion'
import { LuCopy, LuCheck, LuSparkles, LuDownload } from 'react-icons/lu'
import { useI18n } from '../context/I18nContext'
import PageWrapper from '../components/PageWrapper'

const PROMPT = `Bạn là trợ lý ôn thi môn **An ninh di động**.

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

\`\`\`json
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
\`\`\`

Quy định JSON BẮT BUỘC:

* \`type\` luôn là \`"single"\`.
* Mỗi câu có đúng 4 phần tử trong \`options\` với \`key\` lần lượt là \`"A"\`, \`"B"\`, \`"C"\`, \`"D"\`.
* \`correct\` là một mảng chứa **đúng 1** key, ví dụ \`["B"]\`.
* \`explanation\` gồm phần giải thích ngắn, kèm theo độ khó / chủ đề / nguồn đặt trong ngoặc vuông ở cuối: \`[Độ khó: ... | Chủ đề: ... | Nguồn: ...]\`.
* \`title\` đặt theo tên chương, \`time_limit_seconds\` để \`3000\` (có thể đổi, hoặc \`null\` nếu không giới hạn), \`image_url\` để chuỗi rỗng \`""\`.
* Mảng \`questions\` phải có đúng 50 phần tử.
* JSON phải hợp lệ, parse được ngay, **không thêm chú thích bên trong JSON** và không bọc thêm văn bản thừa trong khối JSON — chỉ một khối JSON duy nhất để tôi sao chép và lưu thành file \`.json\`.

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
* Ghi chú nếu có phần tài liệu không đọc được hoặc thiếu nguồn`

export default function Guide() {
  const { t } = useI18n()
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(PROMPT)
    } catch {
      // Fallback for browsers without clipboard permission
      const ta = document.createElement('textarea')
      ta.value = PROMPT
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const steps = [t('guide.step1'), t('guide.step2'), t('guide.step3'), t('guide.step4')]

  return (
    <PageWrapper className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-300">
          <LuSparkles className="h-4 w-4" /> AI · JSON · Import ExamRush
        </span>
        <h1 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl">{t('guide.title')}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-slate-600 dark:text-slate-300">{t('guide.subtitle')}</p>

        <a
          href="/an-ninh-di-dong-100.json"
          download="an-ninh-di-dong-100.json"
          className="mt-6 inline-flex items-center gap-2 rounded-xl border border-brand-300 bg-white px-4 py-2.5 text-sm font-semibold text-brand-700 shadow-sm transition-colors hover:bg-brand-50 dark:border-brand-500/40 dark:bg-slate-900 dark:text-brand-300 dark:hover:bg-brand-500/10"
        >
          <LuDownload className="h-4 w-4" /> {t('guide.sample')}
        </a>
      </motion.div>

      {/* Steps */}
      <div className="mt-10">
        <h2 className="mb-4 text-lg font-bold">{t('guide.steps')}</h2>
        <ol className="grid gap-3 sm:grid-cols-2">
          {steps.map((s, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.25 }}
              className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-sm font-bold text-white">
                {i + 1}
              </span>
              <span className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{s}</span>
            </motion.li>
          ))}
        </ol>
      </div>

      {/* Prompt card */}
      <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3 dark:border-slate-800 dark:bg-slate-800/50">
          <span className="text-sm font-semibold">{t('guide.promptTitle')}</span>
          <button
            onClick={copy}
            className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold text-white transition-transform hover:scale-105 ${
              copied ? 'bg-emerald-500' : 'bg-gradient-to-r from-brand-500 to-accent-500'
            }`}
          >
            {copied ? <LuCheck className="h-4 w-4" /> : <LuCopy className="h-4 w-4" />}
            {copied ? t('guide.copied') : t('guide.copy')}
          </button>
        </div>
        <pre className="max-h-[60vh] overflow-auto whitespace-pre-wrap break-words px-5 py-4 text-[13px] leading-relaxed text-slate-700 dark:text-slate-300">
{PROMPT}
        </pre>
      </div>
    </PageWrapper>
  )
}
