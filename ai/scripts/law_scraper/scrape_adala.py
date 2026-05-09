"""
scrape_adala.py — Scrape adala.justice.gov.ma → insert into Supabase law_documents

The site structure is simple:
  Each category page lists laws as <a href="/api/uploads/YYYY/MM/DD/filename.pdf#...">Title</a>
  → href IS the direct PDF URL (no detail page needed)
  → Year is embedded in the href path

Usage:
    # 1. Fill SUPABASE_SERVICE_KEY in .env
    # 2. Run:
    .venv/bin/python3 scrape_adala.py
"""

import httpx
from bs4 import BeautifulSoup
import json, re, time, os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

# ── Supabase ───────────────────────────────────────────────────────────────
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
if not SUPABASE_KEY or not SUPABASE_URL:
    raise SystemExit("❌  Set SUPABASE_URL and SUPABASE_SERVICE_KEY in .env")
sb = create_client(SUPABASE_URL, SUPABASE_KEY)

# ── Config ─────────────────────────────────────────────────────────────────
BASE    = "https://adala.justice.gov.ma"
HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; HaqqiBot/1.0)"}
DELAY   = 0.5

# Category pages — iterate resource IDs 1-30 + known important ones
# We'll auto-discover which pages have laws
KNOWN_CATEGORIES = {
    19: "القانون المدني",
    20: "القانون الجنائي",
    21: "القانون الجنائي",
    22: "قانون الأسرة",
    23: "القانون التجاري",
    24: "المساطر الإدارية",
    25: "الملكية العقارية",
    26: "المساطر الإدارية",
    27: "القانون الجنائي",
    28: "قانون الشغل",
    29: "الحماية الاجتماعية",
    30: "القانون الرقمي",
}

# Keyword-based categorizer for pages not in KNOWN_CATEGORIES
CATEGORY_KEYWORDS = {
    "قانون الشغل":       ["شغل","عمل","أجير","نقابة","تشغيل","مقاولة"],
    "قانون الأسرة":      ["أسرة","زواج","طلاق","حضانة","نفقة","إرث","ميراث"],
    "الملكية العقارية":  ["عقار","ملكية","كراء","تحفيظ","رهن","تجزئة","بناء"],
    "القانون التجاري":   ["تجار","شركة","إفلاس","بنك","سند","شيك","تجارة"],
    "القانون الجنائي":   ["جنائي","عقوبة","جريمة","إرهاب","مخدرات","جنحة","جناية","مسطرة جنائية"],
    "المساطر الإدارية":  ["إداري","جماعة","جهة","وظيفة عمومية","صفقة"],
    "الحماية الاجتماعية":["ضمان اجتماعي","تقاعد","تأمين","CNSS","صندوق","معاش"],
    "القانون الرقمي":    ["رقمي","إلكتروني","معطيات","سيبراني","تقنية","إنترنت"],
}

def categorize(title: str, default: str) -> str:
    for cat, kws in CATEGORY_KEYWORDS.items():
        if any(kw in title for kw in kws):
            return cat
    return default

YEAR_RE    = re.compile(r'/(20\d{2}|19\d{2})/')
LAW_NUM_RE = re.compile(
    r'(ظهير شريف رقم[\s\d\.\-]+|قانون رقم[\s\d\.\-]+|مرسوم رقم[\s\d\.\-]+)',
    re.UNICODE
)

def extract_year(href: str, title: str) -> int | None:
    m = YEAR_RE.search(href)
    if m:
        return int(m.group(1))
    m2 = re.search(r'\b(19|20)\d{2}\b', title)
    return int(m2.group()) if m2 else None

def extract_law_number(title: str) -> str:
    m = LAW_NUM_RE.search(title)
    return m.group(0).strip()[:100] if m else ""

def tags_from(title: str, category: str) -> list[str]:
    words = re.findall(r'[\u0600-\u06FF]{4,}', title)
    result = list(dict.fromkeys(words[:4]))
    result.append(category.split()[0])
    return result[:5]

def clean_pdf_url(href: str) -> str:
    """Strip fragment (#toolbar=0...) and make absolute."""
    url = href.split("#")[0]
    return BASE + url if url.startswith("/") else url

def get(url: str) -> httpx.Response | None:
    for attempt in range(3):
        try:
            r = httpx.get(url, headers=HEADERS, timeout=20, follow_redirects=True)
            if r.status_code == 200:
                return r
            if r.status_code == 404:
                return None
        except Exception as e:
            print(f"  [retry {attempt+1}] {e}")
            time.sleep(1)
    return None

# ── Scrape one resource page (all pages) ──────────────────────────────────
def scrape_resource(resource_id: int, default_category: str) -> list[dict]:
    laws = []
    page = 1

    while True:
        url = f"{BASE}/resources/{resource_id}?page={page}"
        r = get(url)
        if not r:
            break

        soup = BeautifulSoup(r.text, "html.parser")

        # Law links are a[href*='/api/uploads/'] pointing directly to PDFs
        items = soup.select("a[href*='/api/uploads/']")
        if not items:
            break

        for item in items:
            href  = item.get("href", "")
            title = item.get_text(strip=True)
            if not title or len(title) < 5 or not href.lower().endswith((".pdf", ".pdf#")):
                # also accept if '#' is in href and base ends with pdf
                if not any(href.lower().split("#")[0].endswith(ext) for ext in [".pdf"]):
                    continue

            pdf_url    = clean_pdf_url(href)
            year       = extract_year(href, title)
            law_number = extract_law_number(title)
            category   = categorize(title, default_category)

            laws.append({
                "title":       title[:255],
                "description": "",
                "category":    category,
                "pdf_url":     pdf_url,
                "law_number":  law_number,
                "year":        year,
                "tags":        tags_from(title, category),
            })

        # Check if there's a next page
        next_link = soup.select_one("a[rel='next'], li.next a, .pager-next a")
        if not next_link:
            break

        page += 1
        time.sleep(DELAY)

    return laws

# ── Try all resource IDs from 1 to 50 ────────────────────────────────────
def scrape_all_resources() -> list[dict]:
    all_laws = []
    seen_urls = set()

    for rid in range(1, 51):
        default_cat = KNOWN_CATEGORIES.get(rid, "القانون المدني")
        url = f"{BASE}/resources/{rid}?page=1"
        r = get(url)
        if not r:
            time.sleep(DELAY)
            continue

        soup = BeautifulSoup(r.text, "html.parser")
        items = soup.select("a[href*='/api/uploads/']")

        if not items:
            time.sleep(DELAY)
            continue

        print(f"  Resource {rid} ({default_cat}): {len(items)} laws on p1, scraping all pages…")
        laws = scrape_resource(rid, default_cat)

        # Deduplicate by pdf_url
        for law in laws:
            if law["pdf_url"] not in seen_urls:
                seen_urls.add(law["pdf_url"])
                all_laws.append(law)

        print(f"    → {len(laws)} scraped, {len(all_laws)} total unique")
        time.sleep(DELAY)

    return all_laws

# ── Upsert into Supabase ──────────────────────────────────────────────────
def upsert_all(laws: list[dict], batch_size=50):
    total = 0
    for i in range(0, len(laws), batch_size):
        batch = laws[i : i + batch_size]
        try:
            sb.table("law_documents").upsert(batch).execute()
            total += len(batch)
        except Exception as e:
            print(f"  [warn] batch {i}: {e}")
        print(f"  ✓ {min(i + batch_size, len(laws))}/{len(laws)} upserted")
    return total

# ── Main ──────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("Scanning adala.justice.gov.ma resources…\n")
    all_laws = scrape_all_resources()

    print(f"\nTotal unique laws: {len(all_laws)}")

    # Local backup
    with open("laws_scraped.json", "w", encoding="utf-8") as f:
        json.dump(all_laws, f, ensure_ascii=False, indent=2)
    print("Backup saved → laws_scraped.json")

    # Insert into Supabase
    print("\nInserting into Supabase…")
    n = upsert_all(all_laws)
    print(f"\n✅  Done! {n} laws inserted into law_documents.")
