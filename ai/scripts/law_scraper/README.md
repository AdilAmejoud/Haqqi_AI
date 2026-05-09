# Moroccan Law Scraper

Tools to build and grow the `law_documents` Supabase table.

## Files

| File | Purpose |
|------|---------|
| `generate_seed.py` | Generates `moroccan_laws.sql` with 65+ curated real laws |
| `scraper.py` | Scrapes sgg.gov.ma to discover additional laws automatically |
| `moroccan_laws.sql` | **Ready-to-run SQL** — paste into Supabase SQL Editor |
| `scraped_laws.sql` | Output of `scraper.py` (generated after running it) |

## Quick Start

### 1 — Load the curated seed (65 laws, instant)
```bash
cd scripts/law_scraper
python3 generate_seed.py        # creates moroccan_laws.sql
```
Then open Supabase → SQL Editor → paste `moroccan_laws.sql` → Run.

### 2 — Scrape more laws from sgg.gov.ma (optional, ~10 min)
```bash
pip install -r requirements.txt
python3 scraper.py              # creates scraped_laws.sql
```
Then paste `scraped_laws.sql` into Supabase SQL Editor too.

## Categories (match DB values exactly)
- `قانون الشغل`
- `قانون الأسرة`
- `الملكية العقارية`
- `القانون التجاري`
- `القانون الجنائي`
- `المساطر الإدارية`
- `الحماية الاجتماعية`
- `القانون الرقمي`

## Table Schema expected
```sql
CREATE TABLE law_documents (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  description text,
  category    text,
  pdf_url     text,
  law_number  text,
  year        int,
  tags        text[]
);
```
