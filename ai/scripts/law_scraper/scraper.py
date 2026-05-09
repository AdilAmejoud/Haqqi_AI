"""
Moroccan Law Scraper — scrapes sgg.gov.ma (Bulletin Officiel)
Usage:
    pip install -r requirements.txt
    python scraper.py
Output:
    scraped_laws.sql  (append to moroccan_laws.sql before running in Supabase)
"""

import requests
from bs4 import BeautifulSoup
import uuid, re, time, json

SESSION = requests.Session()
SESSION.headers.update({"User-Agent": "Mozilla/5.0 (compatible; LawBot/1.0)"})

CATEGORY_KEYWORDS = {
    "قانون الشغل":        ["شغل","عمل","أجر","نقابة","مقاولة","تشغيل","عامل","مهني"],
    "قانون الأسرة":       ["أسرة","زواج","طلاق","حضانة","نفقة","إرث","ميراث","ولاية"],
    "الملكية العقارية":   ["عقار","ملكية","كراء","تحفيظ","رهن","تجزئة","بناء"],
    "القانون التجاري":    ["تجار","شركة","إفلاس","بنك","مالي","سند","شيك","تجارة"],
    "القانون الجنائي":    ["جنائي","عقوبة","جريمة","إرهاب","اختطاف","جنحة","جناية","مسطرة جنائية"],
    "المساطر الإدارية":  ["إداري","جماعة","جهة","مسطرة مدنية","محكمة إدارية","وصاية","ميزانية"],
    "الحماية الاجتماعية":["ضمان اجتماعي","تقاعد","تأمين","CNSS","CNOPS","صندوق","معاش"],
    "القانون الرقمي":    ["رقمي","إلكتروني","معطيات","أمن معلوماتي","تقنية","إنترنت","سيبراني"],
}

def categorize(title: str, description: str = "") -> str:
    text = title + " " + description
    for cat, kws in CATEGORY_KEYWORDS.items():
        if any(kw in text for kw in kws):
            return cat
    return "القانون التجاري"

def tags_from(title: str, category: str) -> list:
    tags = []
    words = re.findall(r'[\u0600-\u06FF]{4,}', title)
    tags.extend(words[:4])
    tags.append(category.split()[0])
    return list(dict.fromkeys(tags))[:5]

def escape(s: str) -> str:
    return s.replace("'", "''") if s else ""

def to_sql_row(law: dict) -> str:
    uid     = str(uuid.uuid4())
    title   = escape(law.get("title",""))
    desc    = escape(law.get("description",""))
    cat     = escape(law.get("category",""))
    pdf     = escape(law.get("pdf_url",""))
    law_num = escape(law.get("law_number",""))
    year    = law.get("year") or "NULL"
    tags    = law.get("tags", [])
    tags_pg = "ARRAY[" + ",".join(f"'{escape(t)}'" for t in tags) + "]"
    return (
        f"INSERT INTO law_documents (id,title,description,category,pdf_url,law_number,year,tags) VALUES "
        f"('{uid}','{title}','{desc}','{cat}','{pdf}','{law_num}',{year},{tags_pg});"
    )

# ── Scrape SGG Bulletin Officiel (Arabic) ──────────────────────────────────
BASE = "https://www.sgg.gov.ma"

def get_bo_list(year: int):
    """Return list of {title, url} for a given year from the BO index."""
    url = f"{BASE}/BO/ar/{year}"
    try:
        r = SESSION.get(url, timeout=15)
        soup = BeautifulSoup(r.text, "lxml")
        links = []
        for a in soup.select("a[href*='/BO/ar/']"):
            href = a.get("href","")
            text = a.get_text(strip=True)
            if text and href and year in href:
                links.append({"title": text, "url": BASE + href if href.startswith("/") else href})
        return links
    except Exception as e:
        print(f"  [WARN] {year}: {e}")
        return []

def scrape_bo_page(entry: dict) -> dict | None:
    """Extract a law record from a single BO entry page."""
    try:
        r = SESSION.get(entry["url"], timeout=15)
        soup = BeautifulSoup(r.text, "lxml")
        # Try to find PDF link
        pdf_url = ""
        for a in soup.select("a[href$='.pdf']"):
            href = a.get("href","")
            if "ar" in href.lower():
                pdf_url = BASE + href if href.startswith("/") else href
                break
        title = entry["title"]
        year_m = re.search(r'20\d{2}|19\d{2}', title + entry["url"])
        year = int(year_m.group()) if year_m else None
        desc = ""
        p = soup.find("p")
        if p:
            desc = p.get_text(" ", strip=True)[:300]
        cat = categorize(title, desc)
        return {
            "title": title,
            "description": desc,
            "category": cat,
            "pdf_url": pdf_url,
            "law_number": "",
            "year": year,
            "tags": tags_from(title, cat),
        }
    except Exception as e:
        print(f"  [WARN] {entry['url']}: {e}")
        return None

def run_scraper(years=range(2000, 2025), max_per_year=20):
    laws = []
    for year in years:
        print(f"Scraping year {year}…")
        entries = get_bo_list(year)[:max_per_year]
        for entry in entries:
            law = scrape_bo_page(entry)
            if law:
                laws.append(law)
            time.sleep(0.3)
        print(f"  → {len(entries)} entries")
    return laws

if __name__ == "__main__":
    print("Starting scraper (this may take several minutes)…")
    laws = run_scraper(years=range(2000, 2025), max_per_year=15)
    out = "scraped_laws.sql"
    with open(out, "w", encoding="utf-8") as f:
        f.write("-- Auto-scraped from sgg.gov.ma\n")
        for law in laws:
            f.write(to_sql_row(law) + "\n")
    print(f"\nDone! {len(laws)} laws written to {out}")
