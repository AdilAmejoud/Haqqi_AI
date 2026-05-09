"""
bridge.py — HaqqiAI HTTP Bridge
Run: uvicorn bridge:app --host 0.0.0.0 --port 8001 --reload
"""

import os
import sys
sys.path.insert(0, os.path.dirname(__file__))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import chromadb
from chromadb.utils import embedding_functions
from google import genai
from google.genai import types as genai_types

load_dotenv()

# ── ChromaDB setup ─────────────────────────────────────────────────────────────
CHROMA_PATH = os.getenv("CHROMA_PATH", "./data/chroma")
COLLECTION  = "lois_marocaines"

def get_collection():
    os.makedirs(CHROMA_PATH, exist_ok=True)
    client = chromadb.PersistentClient(path=CHROMA_PATH)
    ef = embedding_functions.SentenceTransformerEmbeddingFunction(
        model_name="sentence-transformers/paraphrase-multilingual-mpnet-base-v2"
    )
    return client.get_or_create_collection(
        name=COLLECTION,
        embedding_function=ef,
        metadata={"hnsw:space": "cosine"}
    )

def search_laws(query: str, n_results: int = 5, domain_filter: str | None = None) -> list[dict]:
    col = get_collection()
    where = {"domain": domain_filter} if domain_filter else None
    results = col.query(
        query_texts=[query],
        n_results=n_results,
        where=where,
        include=["documents", "metadatas", "distances"]
    )
    chunks = []
    if results["documents"] and results["documents"][0]:
        for doc, meta, dist in zip(
            results["documents"][0],
            results["metadatas"][0],
            results["distances"][0]
        ):
            chunks.append({
                "text":     doc,
                "source":   meta.get("source", ""),
                "law_name": meta.get("law_name", ""),
                "article":  meta.get("article", ""),
                "domain":   meta.get("domain", ""),
                "score":    round(1 - dist, 3)
            })
    return chunks

# ── Gemini client ──────────────────────────────────────────────────────────────
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

app = FastAPI(title="HaqqiAI Bridge")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── System prompt per legal level ──────────────────────────────────────────────
def get_system_prompt(legal_level: str = "citizen") -> str:
    base = """أنت "حقي AI"، مساعد قانوني ذكي متخصص في القانون المغربي.
- استند دائماً على النصوص القانونية المغربية الرسمية
- اذكر أرقام المواد والفصول القانونية عند الإجابة
- لا تعطي رأياً شخصياً — غير ما كتبه القانون"""

    levels = {
        "citizen": """- تكلم بالدارجة المغربية البسيطة دائماً
- شرح كأنك تحكي لصديق، بدون مصطلحات تقنية
- استعمل أمثلة من الحياة اليومية المغربية
- في الآخر دائماً قل: "هاد المعلومة عامة، إذا كانت القضية خطيرة استشر محامي" """,

        "student": """- استخدم العربية الفصحى القانونية الرسمية
- استشهد دائماً بالمواد القانونية المحددة
- اذكر المصدر التشريعي الكامل: اسم القانون، الفصل، تاريخ الصدور
- أشر إلى الاجتهادات القضائية المغربية إن وجدت""",

        "expert": """- تواصل بأسلوب أكاديمي وقانوني متخصص رفيع المستوى
- عند صياغة العقود: المقدمات، الأطراف، البنود بترقيم دقيق، البنود الختامية
- عند المذكرات: الوقائع، الدفوع الشكلية، الدفوع الموضوعية، الطلبات
- قدم خيارات استراتيجية متعددة مع تقييم المخاطر"""
    }

    return base + "\n\n" + levels.get(legal_level, levels["citizen"])


# ── Models ─────────────────────────────────────────────────────────────────────
class ChatRequest(BaseModel):
    message: str
    history: list[dict] = []
    domain: str | None = None
    legal_level: str = "citizen"
    case_context: dict | None = None
    conversation_id: str | None = None
    pdf_context: str | None = None
    pdf_filename: str | None = None

class ChatResponse(BaseModel):
    reply: str
    sources: list[dict]
    domain_used: str | None

class DocumentRequest(BaseModel):
    type: str
    full_name: str
    second_party: str | None = None
    date: str | None = None
    amount: str | None = None
    details: str | None = None
    legal_level: str = "expert"


# ── Routes ─────────────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    try:
        count = get_collection().count()
        return {"status": "ok", "indexed_chunks": count, "model": "gemini-flash-lite-latest"}
    except Exception as e:
        return {"status": "error", "detail": str(e)}


@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    # 1. RAG search
    chunks = search_laws(req.message, n_results=5, domain_filter=req.domain)

    if chunks:
        context_parts = []
        for i, c in enumerate(chunks, 1):
            context_parts.append(
                f"[{i}] {c['law_name']} — {c['article']}\n"
                f"المصدر: {c['source']} (درجة الصلة: {c['score']})\n"
                f"{c['text']}"
            )
        context = "\n\n---\n\n".join(context_parts)
    else:
        context = "ما كاين حتى نص قانوني مرتبط بالسؤال في قاعدة البيانات."

    # 2. Build system prompt
    system = get_system_prompt(req.legal_level)

    if req.case_context:
        system += f"""

سياق القضية الحالية:
- العنوان: {req.case_context.get('title', '')}
- الموكل: {req.case_context.get('client_name', '')}
- التصنيف: {req.case_context.get('category', '')}"""
        if req.case_context.get('instructions'):
            system += f"\n- تعليمات المحامي: {req.case_context.get('instructions')}"

    if req.pdf_context:
        system += f"""

لديك وثيقة PDF مرفقة اسمها: {req.pdf_filename or 'وثيقة.pdf'}
محتوى الوثيقة:
{req.pdf_context[:8000]}

قواعد إضافية عند الإجابة:
- استند على محتوى الوثيقة عند الإجابة
- اذكر الصفحة أو البند عند الاقتباس
- إذا ما كانتش المعلومة في الوثيقة: وضح ذلك
- كيّف أسلوب الشرح حسب مستوى المستخدم"""

    # 3. Build Gemini contents (history + new message)
    contents = []
    for h in req.history[-10:]:
        role = "user" if h["role"] == "user" else "model"
        contents.append(genai_types.Content(role=role, parts=[genai_types.Part(text=h["content"])]))

    # Final message with RAG context
    full_message = f"""النصوص القانونية المرجعية:
{context}

سؤال المستخدم:
{req.message}"""
    contents.append(genai_types.Content(role="user", parts=[genai_types.Part(text=full_message)]))

    try:
        response = client.models.generate_content(
            model="gemini-flash-lite-latest",
            contents=contents,
            config=genai_types.GenerateContentConfig(system_instruction=system)
        )
        reply = response.text
    except Exception as e:
        reply = f"خطأ في الاتصال بالنموذج: {str(e)}"

    # 4. Sources
    sources = [
        {"law": c["law_name"], "article": c["article"], "score": c["score"]}
        for c in chunks
    ]

    return ChatResponse(reply=reply, sources=sources, domain_used=req.domain)


@app.post("/generate-document")
async def generate_document(req: DocumentRequest):
    doc_types = {
        "contract": "عقد",
        "complaint": "شكاية",
        "memo": "مذكرة قانونية",
        "template": "نموذج وثيقة"
    }
    doc_label = doc_types.get(req.type, req.type)

    prompt = f"""أنت محامٍ مغربي خبير. اصنع {doc_label} قانونية احترافية كاملة بالعربية الفصحى.

المعطيات:
- الطرف الأول: {req.full_name}
- الطرف الثاني: {req.second_party or 'غير محدد'}
- التاريخ: {req.date or 'غير محدد'}
- المبلغ: {req.amount or 'غير محدد'}
- التفاصيل: {req.details or 'لا توجد تفاصيل إضافية'}

اكتب الوثيقة كاملة، جاهزة للطباعة، مع جميع البنود القانونية اللازمة."""

    response = client.models.generate_content(
        model="gemini-flash-lite-latest",
        contents=prompt
    )
    return {"document": response.text}


class SummarizeLawRequest(BaseModel):
    title: str
    law_number: str = ""
    category: str = ""
    description: str = ""
    tags: list[str] = []

@app.post("/summarize-law")
async def summarize_law(req: SummarizeLawRequest):
    prompt = f"""لخص هاد القانون المغربي بالدارجة في 5-7 جمل مفيدة للمواطن العادي:

العنوان: {req.title}
الرقم: {req.law_number}
التصنيف: {req.category}
الوصف: {req.description}
الكلمات المفتاحية: {', '.join(req.tags)}

قواعد الملخص:
- بالدارجة المغربية فقط
- اذكر أهم 3-4 حقوق أو نقاط مهمة
- استخدم أمثلة بسيطة من الحياة اليومية
- اذكر متى يحتاج المواطن لهاد القانون
- جملة أخيرة: "إذا كنت محتاج أكثر معلومات، اضغط استشر حقي"
"""

    response = client.models.generate_content(
        model="gemini-1.5-flash",
        contents=prompt
    )
    return {"summary": response.text}


@app.get("/domains")
def list_domains():
    try:
        col = get_collection()
        metas = col.get(include=["metadatas"])["metadatas"]
        domains = sorted({m.get("domain", "unknown") for m in metas if m})
        return {"domains": domains, "total": col.count()}
    except Exception as e:
        return {"error": str(e)}
