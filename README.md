# Gold Coast Financial Partners

**Institutional Holding Company Website**

Corporate website for Gold Coast Financial Partners LLC — the parent holding company of Heritage Life Solutions and affiliated insurance brands.

**Production:** [heritagels.org](https://heritagels.org)

---

## About

Gold Coast Financial Partners LLC is a financial services holding company specializing in life insurance distribution. The company operates through its primary brand, **Heritage Life Solutions**, providing insurance products, agent recruitment, training, and commission management.

### Brands & Subsidiaries

- **Heritage Life Solutions** — Full-service insurance agency (primary operating brand)
- **Legacy Life Financial Group (LLFG)** — Specialized insurance distribution

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, Tailwind CSS v4, shadcn/ui |
| **Backend** | Node.js, Express 4, TypeScript |
| **Database** | PostgreSQL (Neon serverless), Drizzle ORM |
| **Deployment** | Railway.app |

---

## Getting Started

### Prerequisites

- Node.js 22+
- PostgreSQL (or Neon account)

### Installation

```bash
git clone git@github.com:guy4carbs/goldcoastfinancial.git
cd goldcoastfinancial
npm install
```

### Environment Setup

```bash
cp .env.example .env
# Configure DATABASE_URL and other required variables
```

### Development

```bash
npm run dev          # Development server (port 4500)
npm run build        # Production build
npm run start        # Start production server
```

---

## Branches

| Branch | Purpose |
|--------|---------|
| `main` | Gold Coast Financial institutional site |
| `heritage-app` | Heritage Life Solutions full insurance platform (266 pages, 37 AI agents, 8 portals) |

**For the full Heritage Life platform**, switch to the `heritage-app` branch:

```bash
git checkout heritage-app
```

---

## Deployment

Deployed on **Railway.app** with NIXPACKS builder.

- **Health check:** `/api/health`
- **Build:** `npm run build`
- **Start:** `npm run start`

---

## License

MIT

---

**Gold Coast Financial Partners LLC**
