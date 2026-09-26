# GramUdyam Saathi — SIH 2026 PS 26091 prototype

**लोन लेने से पहले, सही फ़ैसला।** Voice-first rural business advisory and loan-structuring assistant for MoSJE (NSFDC / NBCFDC / NSKFDC beneficiaries). Tells a first-time entrepreneur how much they *should* borrow, for which business, in their own village.

Prototype runs fully in the browser on **demo data** (Barabanki district, UP). The finance and feasibility engines are real, deterministic code.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # SRS golden cases T1–T10 + personas
npm run build
```

## Surfaces

| Route | Who | What |
|---|---|---|
| `/` | Judges | Pitch page; Sunita's naive ₹9 L vs right-sized ₹2.9 L, computed live |
| `/saathi` | Beneficiary | 12 questions, one per screen, Hindi/English, mic (Web Speech) + tap, read-back of amounts, live engine trace panel, demo personas |
| `/plan/:id` | Beneficiary | Verdict stamp, recommended vs 10%-formula loan, quarterly instalment in rupees/day and local units; tabs: Market (catchment map, demand vs break-even, seasonality, price band, sourced facts), Money (3-way compare, rule flags, moratorium toggle, cash runway, DSCR, Monte Carlo, what-if, schedule, P&L), Risks (Founder-Fit, SWOT with fact IDs), Other ideas, Next steps (DPR, documents, PM-SURAJ, WhatsApp) |
| `/operator` | VLE / CRP-EP | Dense keyboard form, live result, 10-minute timer, print DPR, send to SCA |
| `/officer` | SCA officer | Case queue, KPIs, case detail with evidence + rule version + remarks, ready / needs-revision, district saturation heatmap |
| `/engine` | Judges | Golden tests run in-browser, scheme-router playground (edge cases), numeric-guard playground, versioned rule table |
| `/dpr/:id` | All | Bilingual bank-format DPR, print / save as PDF |

## Engine (`src/engine`)

- `rules.ts` — versioned scheme rules as data (NSFDC MFS/TL, NBCFDC, NSKFDC). Conflicting terms flagged "SCA to confirm".
- `router.ts` — pure router + edge cases A1–A5 (₹1.25 L cap, ₹1.40 L boundary compare, >₹50 L cap, plantation moratorium, income ineligibility).
- `amortise.ts` — quarterly annuity after moratorium, serviced vs capitalised. Golden: ₹9 L @ 8% → ₹44,729 / ₹46,536.
- `business.ts` — 5–7 yr P&L, DSCR, break-even, NPV/IRR, 24-month cash walk ("moneylender month"), seeded 1,000-run Monte Carlo.
- `feasibility.ts` — 5/10 km road-distance catchment, competitor range (EC-6 prior × growth, OSM floor, user count), saturation vs district median, Huff capture (β 1.5–2.0), seasonality, threats, facts with confidence labels.
- `founderFit.ts` — weights from MoSJE NSFDC evaluation.
- `plan.ts` — naive vs chosen vs recommended (largest unit with DSCR ≥ 1.5 and P(default) ≤ 15%), verdict, SWOT, alternatives.
- `narrate.ts` + `guard.ts` — template narrator (Sarvam-30B slot in production); numeric guard rejects any number not in the facts.

## What is mocked

Village, market, price and unit-cost numbers (shapes follow Census 2011 PCA, Mission Antyodaya, EC-6, HCES, Agmarknet, NABARD PLP). Bhashini → browser Web Speech API. Sarvam-30B → template narration. DigiLocker, PM-SURAJ API, WhatsApp API → links / stubs. Storage → browser localStorage.
