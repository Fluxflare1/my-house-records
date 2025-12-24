my-house-records/
│
├── README.md
│
├── apps/
│   └── web/                        # Next.js app (Admin + Tenant UI)
│       ├── src/
│       │   ├── app/
│       │   │   ├── admin/           # Admin dashboard routes
│       │   │   ├── tenant/          # Tenant portal routes
│       │   │   ├── api/             # API routes (Google adapters, later backend)
│       │   │   └── layout.tsx
│       │   ├── components/
│       │   │   ├── ui/              # shadcn-ui components
│       │   │   ├── admin/
│       │   │   └── tenant/
│       │   ├── lib/
│       │   │   ├── auth/            # auth & role handling
│       │   │   ├── config/          # runtime config (sheet IDs, drive IDs)
│       │   │   ├── adapters/        # Google Sheets / Drive adapters
│       │   │   ├── services/        # domain logic (rent, bills, payments)
│       │   │   └── utils/
│       │   ├── styles/
│       │   └── middleware.ts
│       ├── public/
│       ├── package.json
│       ├── next.config.js
│       └── tailwind.config.js
│
├── scripts/
│   └── google-bootstrap/            # One-time Google setup (Service Account)
│       ├── src/
│       │   ├── index.ts             # entry point
│       │   ├── google.ts            # auth + Google clients
│       │   └── schema.ts            # sheet/tab definitions
│       ├── package.json
│       ├── tsconfig.json
│       └── .env.example
│
├── shared/
│   └── domain/
│       ├── constants.ts             # statuses, enums (rent, bills, payments)
│       ├── types.ts                 # shared domain types
│       └── rules.md                 # non-code business rules
│
├── docs/
│   ├── SRS.md                       # Software Requirements Specification
│   ├── architecture.md              # system architecture decisions
│   ├── setup-google-service-account.md
│   └── operational-notes.md
│
└── .gitignore
