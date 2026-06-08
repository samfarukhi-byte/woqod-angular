# WOQOD Total Control — CSP Portal

## Project at a glance

Angular 15 Customer Self-Portal (CSP) for WOQOD (Qatar's national fuel company).
Corporate customers log in, view their profile, submit change requests (profile edits + document uploads),
and track those requests through a Maker → Checker approval workflow.

**Active codebase:** `woqod-angular/` (this folder)
**Design reference:** `../woqod/` (vanilla HTML prototype — read-only reference)

---

## Stack

| Item | Detail |
|---|---|
| Framework | Angular **15.2** — NgModule pattern (NOT standalone components) |
| Language | TypeScript 4.9 — **strict mode ON** |
| Styling | Global `src/assets/css/woqod-styles.css` (Bootstrap 5.3 + WOQOD design system) + per-component SCSS |
| State | `CspService` (BehaviorSubject + localStorage) — no NgRx |
| HTTP | `HttpClientModule` imported — no live API yet, all data is mocked in `CspService` |
| Build | Angular CLI (`ng serve` / `ng build`) |

---

## Commands

```bash
npm install        # install dependencies
ng serve           # dev server → http://localhost:4200
ng build           # production build → dist/woqod-angular/
ng test            # unit tests (Karma/Jasmine)
```

---

## Architecture

```
src/app/
├── core/services/
│   ├── csp.service.ts          # ★ ALL STATE HERE — BehaviorSubjects + localStorage
│   └── navigation.service.ts   # Router helper
├── models/
│   ├── customer.model.ts       # Customer, Address, PrimaryContact, SessionUser
│   ├── document.model.ts       # DocumentType, ExistingDocument, StagedDocument
│   └── request.model.ts        # CspRequest, ProfileChangeDraft, RequestStatus
├── shared/
│   └── components/
│       ├── woqod-shell/        # Sidebar + header + <router-outlet> + footer
│       ├── breadcrumb/         # Page breadcrumb
│       └── profile-dropdown/   # Profile menu (dropdown with toggle logic)
└── modules/csp/
    ├── pages/                  # 7 routed pages
    │   ├── profile/            # Read-only customer profile
    │   ├── edit-profile/       # Reactive form + change tracking
    │   ├── documents/          # Drag-drop document upload staging
    │   ├── review-changes/     # Diff view + submission form
    │   ├── track-requests/     # Filter chips + request list + detail modal
    │   ├── maker-review/       # Internal staff: approve/reject queue
    │   └── checker-approval/   # Internal staff: final approval + ERP sim
    └── components/
        ├── status-badge/       # Inline badge — driven by csp-badge CSS classes
        ├── diff-table/         # Before/after table for profile changes
        ├── document-card/      # Document upload card with drag-drop
        ├── request-card/       # Summary card for a single request
        └── request-modal/      # Full-detail modal for a request
```

---

## Routing

| URL | Component |
|---|---|
| `/` | → redirect `/csp/profile` |
| `/csp/profile` | `ProfileComponent` |
| `/csp/edit-profile` | `EditProfileComponent` |
| `/csp/documents` | `DocumentsComponent` |
| `/csp/review-changes` | `ReviewChangesComponent` |
| `/csp/track-requests` | `TrackRequestsComponent` |
| `/csp/maker-review` | `MakerReviewComponent` |
| `/csp/checker-approval` | `CheckerApprovalComponent` |

---

## Data flow (localStorage chain)

```
edit-profile  → CspService.saveProfileChanges()   → csp.profileChanges
documents     → CspService.saveUploadedDocuments() → csp.uploadedDocuments
                                                       ↓
review-changes → CspService.submitRequest()        → csp.submittedRequests
                 (clears profileChanges + uploadedDocuments)
                                                       ↓
track-requests → CspService.getCombinedRequests()  → saved + 3 mock requests
maker-review  → CspService.updateRequestStatus()
checker-approval → CspService.updateRequestStatus()
```

---

## Design system rules

- **Brand green (primary action):** `#009a33`
- **Text primary:** `#020618` | **Text muted:** `#45556c`
- **Border:** `#e2e8f0` | **Surface:** `#ffffff` / `#f8fafc`
- **Error:** `#e7000b` | **Success badge:** `#10B981` | **Warning badge:** `#F59E0B`
- **Font:** Poppins (loaded in the global CSS from Google Fonts)
- **Bootstrap 5.3.3** loaded from CDN in `src/index.html`
- All CSP-specific classes use the **`csp-` prefix** — never add styles without this prefix
- Component SCSS files are intentionally minimal (`:host { display: block; }`) — all visual styles live in the global CSS
- Full design spec: `../woqod/WOQOD_ARCHITECTURE.md`

---

## Environments

```
src/environments/
├── environment.ts       # development (apiBaseUrl: http://localhost:3000/api)
└── environment.prod.ts  # production  (apiBaseUrl: /api)
```

Replace `apiBaseUrl` values when the real backend is known.

---

## Connecting a real API

1. `HttpClientModule` is already imported in `AppModule`
2. Inject `HttpClient` into `CspService`
3. Replace mock methods (`getCustomer()`, `getMockRequests()`, etc.) with HTTP calls
4. Import `environment.apiBaseUrl` for the base URL

---

## Known limitations (prototype scope)

- No authentication — session is mocked in `CspService.initializeMockSession()`
- No real file upload — files are staged in localStorage (filename + size only, no binary)
- No real ERP write — `CheckerApprovalComponent.approveAndUpdateErp()` simulates it
- RTL layout is stubbed (`body.rtl` toggle exists, full testing needed)
- No unit tests beyond the default `app.component.spec.ts`
