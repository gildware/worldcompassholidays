# Bookings desk — QA plan & fix list

Date: 2026-10-23  
Goal: One Bookings hub for all types; no duplicate car/bike nav; full A–Z lifecycle works for customer + admin with correct badges/status.

---

## Phase 0 — Steps (do in order)

1. **Audit nav** — find why Cars/Bikes bookings appear twice; keep only under **Bookings**.
2. **Map lifecycles** — document status paths for tour, hotel, visa, assist, car, bike.
3. **Fix gaps** — badges, revalidation paths, redirects, permission gates, compact UI regressions.
4. **Customer flows** — create/update one booking per type (or use seeds where create UI is heavy).
5. **Admin flows** — open each desk, change status start→end, assign owner, confirm badges update.
6. **Rate** — score each desk + overall; list improvements.
7. **Apply improvements** — implement high-impact fixes from the rating.
8. **Re-verify** — spot-check badges + one full status path per type.

---

## Phase 1 — Known issue: duplicate car/bike bookings

**Result:** Fixed. Car/Bike rental menus no longer list Bookings; only under Bookings hub.

---

## Phase 2 — Status lifecycles exercised

| Type | Path tested | Result |
|------|-------------|--------|
| Tour / Hotel / Visa / Assist | enquiry → … → completed | Pass |
| Car / Bike | docs → confirm → … → completed | Pass |

---

## Phase 3 — Notifications / badges

- Nav badges: Pass
- Customer account status: Pass
- **Status emails:** Implemented (`lib/mail.ts` + `lib/booking-notify.ts`). With `RESEND_API_KEY` sends via Resend; otherwise logs to the server console.

---

## Phase 4 — Rating (after improvements)

| Area | Score | Notes |
|------|-------|-------|
| Nav clarity | 5 | Single Bookings hub |
| List UX | 4 | Compact desks |
| Detail desk | 5 | Timeline + verify-all docs + primary CTAs |
| Lifecycle | 4 | Full pipelines |
| Badges | 5 | Correct through status changes |
| Cross-role | 4 | Account pills + status emails (Resend or console) |
| Compactness | 4 | Dense overview |
| **Overall** | **4.4** | |

---

## Phase 5 — Results log

### Nav
- [x] Duplicate car/bike removed
- [x] Detail pages highlight the correct desk (`?desk=` + `BookingDeskHint`)

### Customer
- [x] Fresh bookings per type via `npm run db:seed-fresh-bookings`
- [x] Account status pills + activity “Updates” list
- [x] Hotel/rental completed status verified earlier

### Admin status A–Z
- [x] Tour / Hotel / Visa / Assist / Car / Bike

### Improvements applied (round 2)
- Status change emails for enquiry + rental bookings
- Enquiry activity timeline stored in `details.activity` (admin + account)
- Create paths seed “Enquiry received” activity
- Rental desk **Verify all documents** action
- Fresh booking seed script for all desks

### Configure live email
```bash
# .env
RESEND_API_KEY=re_xxx
MAIL_FROM="World Compass Holidays <bookings@yourdomain.com>"
```

### Seed fresh sample bookings
```bash
npm run db:seed-fresh-bookings
```
