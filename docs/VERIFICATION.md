# Retro desktop and responsive polish verification — September 17, 2026

## Scope

The five polish passes were implemented sequentially: responsive character stage; three-zone desktop and maximize; seasonal scenes; detailed avatar, wardrobe and direct editing; concise First Quest flow. Each pass received type/lint checks, tests, a production build, and viewport checks. The final checkpoint also retains the earlier retro OS, calendar, session-only guest, and practice-dialog fixes.

## Confirmed behavior

- Character and controls remain visible at 320×568, 375×667, 390×844, 768×1024, 1024×768, 1280×720, 1366×768, 1440×900 and 1920×1080. No horizontal document overflow was found. The rendered sprite fits its reserved stage.
- All 16 dock/dashboard combinations were checked at each of the five widths at least 1024 pixels wide (80 combinations). Dashboard and character occupy opposite edges. Mobile temporarily uses a stacked home and bottom dock without overwriting stored preferences.
- Maximize fills measured available workspace around each dock edge, and restore preserves the prior geometry. The shared root layout keeps the desktop mounted during navigation, preventing freshly opened menus from disappearing after a window reset.
- Four original layered SVG scenes load on demand. Settings provides miniature live previews and Apply/Cancel. Bounded pools have Off/Low/Normal intensity; reduced motion disables decoration; hidden tabs and covered maximized desktops pause it.
- The original avatar uses a 128×192 source canvas and 16 ordered painted layers. Front/left/right/back inspection and a stepped idle are available. Native SVG hit testing selects the topmost painted layer. Mouse click, first/second touch, and the keyboard category selector open matching Loadout categories. Unknown stored item IDs retain a built-in fallback silhouette.
- Wardrobe counts: 12 skin tones, 16 hairstyles, 12 hair colors, 12 face/expression choices, 16 tops (14 basic), 10 bottoms, 9 outerwear options, 10 shoes, 11 headwear, 7 face accessories, 9 bags/back items, 18 legacy accessories, and 15 props including at least three per hobby. Ordinary identity choices remain unlocked.
- Get Started → hobby choice opens First Quest within two decisions. Gear, time, action, essential safety and XP appear on the card. Starting marks the introductory node in progress, awards no unearned XP, and does not bypass safety prerequisites. Extended reading is collapsed.
- New profile fields default safely for legacy saves. The authenticated repository mock verifies seasonal/layout/preview-hobby/avatar/maximize state across a fresh read. Local PostgreSQL tests verify private projections, migration/seed integrity, reward restrictions, rollback, revision conflicts and row isolation.

## Practice and progression regression coverage

Practice checks cover all four hobbies, invalid input, safety prerequisites, cancel/close/Escape, refresh persistence, daily XP caps, 15 rapid submissions, and simulated failed storage followed by a retry. The modal explains missing prerequisites, displays save errors inside the dialog, retains the draft, and shows an explicit saved state with Done. Repeat submission uses a stable session ID.

The domain tests complete and master all 72 skills, exercise 100 practice sessions and repeated retries, enforce mandatory safety gates, and verify one-time quest/achievement rewards. Browser scenarios cover all application launchers, window lifecycle, tree filters/zoom, lesson completion/mastery, wardrobe/gear, settings, guest setup/session isolation, calendar plans and practice, and reduced motion. Automated accessibility audits check serious/critical WCAG violations across the primary screens, entry/setup, calendar/display settings and practice dialogs.

## Final checks

- ESLint and TypeScript: passed.
- Unit/component/repository/local PostgreSQL: 51 passed; one external integration test skipped.
- Production build: passed, including the final shared-layout and navigation sequencing corrections.
- Browser regression: 80 unique scenarios pass (78 in the complete run, plus the corrected desktop window sequence and timed-out desktop accessibility audit passing in the final serial rerun). Two platform-specific scenarios are intentionally skipped on the inapplicable project. The serial rerun also passed mobile accessibility/window lifecycle and fully loaded seasonal screenshot checks. The navigation race was fixed by letting route changes open an app once, rather than opening it before the route arrives and reopening it afterward.
- Visual evidence intentionally retained in `docs/screenshots/`; transient screenshots and traces remain in ignored `test-results/`.

## Limits

Live Supabase credentials are not configured. The hosted sign-up/email confirmation/sign-in/save/account-deletion flow and the external two-account isolation test are not certified by local mocks or local PostgreSQL checks. No public deployment has been performed.

The 200% enlargement check uses browser CSS zoom together with the responsive viewport matrix; it is not an OS-level display-scaling certification. Performance Lighthouse numbers from the older pre-retro build are not claimed for this checkpoint. Existing personal browser data was not reset by automated tests; browser tests use isolated sessions.

Guest progress uses sessionStorage and lasts only for its tab session, subject to browser session restoration. Power → Close guest session explicitly deletes it. Legacy localStorage data remains untouched. Guest-to-cloud migration is not implemented; Save Progress explains this limitation. Instructional content remains a curated draft awaiting qualified editorial review.
