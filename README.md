# WOQOD Total Control · Angular 15

Angular 15 port of the vanilla WOQOD CSP portal at [`../woqod/`](../woqod/).

## Project layout

```
src/app/
├── core/                       # singleton services (provided in root)
│   ├── services/
│   │   ├── csp.service.ts      # state + localStorage data chain
│   │   └── navigation.service.ts
│   └── core.module.ts
├── shared/                     # cross-feature presentational pieces
│   ├── components/
│   │   ├── woqod-shell/        # sidebar + header + footer + router-outlet
│   │   ├── breadcrumb/         # in-page breadcrumb wrapper
│   │   └── profile-dropdown/   # placeholder slot component
│   └── shared.module.ts
├── modules/
│   └── csp/
│       ├── pages/              # 7 routed feature pages
│       │   ├── profile/, edit-profile/, documents/,
│       │   ├── review-changes/, track-requests/,
│       │   └── maker-review/, checker-approval/
│       ├── components/         # status-badge, diff-table, request-card, …
│       ├── csp.module.ts
│       └── csp-routing.module.ts
├── models/                     # customer, request, document interfaces
├── app.module.ts
└── app-routing.module.ts       # lazy-loads /csp via WoqodShellComponent
```

`src/assets/css/woqod-styles.css` is a verbatim copy of the vanilla design system
(`woqod/assets/css/style.css`). It is imported once globally from `src/styles.scss`
so the `csp-*` classes used in templates resolve everywhere with WOQOD's own
palette (`#009a33`, `#020618`, `#e2e8f0`, …).

## Run

```bash
npm install        # already done by ng new
ng serve           # http://localhost:4200
ng build           # production build into dist/
```

## Routing

| Path                       | Component                  | Notes                          |
| -------------------------- | -------------------------- | ------------------------------ |
| `/`                        | redirect to `/csp/profile` | landing                        |
| `/csp/profile`             | ProfileComponent           | 8 read-only cards              |
| `/csp/edit-profile`        | EditProfileComponent       | reactive form, change tracking |
| `/csp/documents`           | DocumentsComponent         | drag-drop upload staging       |
| `/csp/review-changes`      | ReviewChangesComponent     | diff + submission form         |
| `/csp/track-requests`      | TrackRequestsComponent     | filter chips + details modal   |
| `/csp/maker-review`        | MakerReviewComponent       | internal staff queue + drawer  |
| `/csp/checker-approval`    | CheckerApprovalComponent   | internal staff queue + ERP sim |

The CSP module is lazy-loaded.

## State & data flow

`CspService` (provided in root) holds three BehaviorSubjects mirroring the
vanilla localStorage keys:

```
saveProfileChanges()    → csp.profileChanges     (Edit Profile)
saveUploadedDocuments() → csp.uploadedDocuments  (Documents staging)
submitRequest()         → csp.submittedRequests  (Review Changes consumes & clears)
```

`updateRequestStatus()` is used by Maker Review and Checker Approval to mutate
status + append an `ApprovalTrailEntry`. Three baked-in mock requests are merged
with localStorage entries by `getCombinedRequests()` for demo continuity.

## Style system

- `assets/css/woqod-styles.css` ships the WOQOD shell + Bootstrap-style
  `.dashboard.versionthree` markup.
- The CSP-specific selectors are all `csp-` prefixed (added at the bottom of
  that file).
- No Angular Material. No CSS-in-JS. ViewEncapsulation.Emulated by default;
  global styles still apply because they are loaded via `styles.scss`, not
  per-component.

## Manual test path

1. `ng serve` → http://localhost:4200
2. Profile dropdown (top-right) → **View Profile**
3. **Edit Profile** → change email + phone → green "Changed" flags appear
4. **Save Changes** → redirected to **Documents**
5. Drop a file in any zone → **Next → Review**
6. Review diff table + staged docs → pick a reason + tick confirm → **Submit**
7. Track Requests → new card appears with **Submitted** status
8. (Internal) `/csp/maker-review` → approve → status flips to *Maker-Approved*
9. (Internal) `/csp/checker-approval` → approve → ERP write toast, status *Approved*

localStorage keys (`csp.profileChanges`, `csp.uploadedDocuments`,
`csp.submittedRequests`) survive page reloads.
