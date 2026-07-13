# Exotic — Fashion E-Commerce Platform

A premium, production-ready e-commerce platform built for **Exotic**, a fashion and accessories brand.

## Project Structure

```
exotic/
├── frontend/          # React + Vite + TypeScript + Tailwind CSS
├── backend/           # FastAPI + Python + Async SQLAlchemy
└── supabase/          # SQL schema for Supabase Postgres
```

## Design Philosophy

- **Dark editorial aesthetic**: Deep charcoal base, gold accent, Cormorant Garamond + Inter typography
- **Motion language**: Framer Motion — fade/slide reveals, crossfade on hover, animated cart drawer
- **Boutique feel**: Full-bleed imagery, generous whitespace, no marketplace clutter

---

## Quick Start

### 1. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in the SQL editor
3. Create storage buckets (public): `product-images`, `lookbook-images`, `category-images`

### 2. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate       # Windows
pip install -r requirements.txt

# Create .env from template
copy .env.example .env
# Fill in SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL, SECRET_KEY

# Create your first admin user
python create_superadmin.py

# Start dev server
uvicorn main:app --reload --port 8000
```

API docs available at: `http://localhost:8000/api/docs`

### 3. Frontend

```bash
cd frontend

# Create .env from template
copy .env.example .env
# Fill in VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_WHATSAPP_NUMBER

npm install
npm run dev
```

App available at: `http://localhost:5173`
Admin panel at: `http://localhost:5173/admin`

---

## Key Features

### Storefront
- **Animated hero carousel** — full-screen with crossfade transitions
- **Category grid** — large editorial tiles with hover zoom
- **New arrivals** — horizontal scroll on mobile, grid on desktop  
- **Product detail** — zoom-on-hover gallery, variant selector, animated add-to-cart
- **Lookbook** — magazine-style editorial with product hotspot pins
- **Cart drawer** — animated slide-in with quantity controls
- **WhatsApp checkout** — saves order to DB, redirects to pre-filled WhatsApp message

### Admin Panel
- **Dashboard** — stat cards + recharts visualizations
- **Products** — full CRUD with drag-and-drop image upload to Supabase Storage
- **Orders** — status management with WhatsApp quick-link
- **Lookbook** — collection and editorial image management
- **Content** — hero banner and category management

---

## Deployment

### Frontend (Vercel/Netlify)

```bash
cd frontend
npm run build
# Deploy dist/ to Vercel or Netlify
# Set environment variables in dashboard
```

### Backend (Render/Railway)

```bash
# Set environment variables in your hosting dashboard
# Start command:
gunicorn main:app -k uvicorn.workers.UvicornWorker -w 4 --bind 0.0.0.0:$PORT
```

---

## Environment Variables

See `frontend/.env.example` and `backend/.env.example` for all required variables.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS v4 + CSS custom properties |
| Animation | Framer Motion |
| State | Zustand (cart, auth) + TanStack Query |
| Backend | FastAPI + Python |
| ORM | SQLAlchemy (async) + asyncpg |
| Database | Supabase Postgres |
| Storage | Supabase Storage |
| Auth | JWT (access + refresh tokens) |

---

## ⚠️ Before Going Live

- [ ] Replace all placeholder images with actual product photography
- [ ] Set correct WhatsApp business number in `VITE_WHATSAPP_NUMBER`
- [ ] Generate a strong `SECRET_KEY` for JWT signing
- [ ] Configure CORS to allow only your production frontend URL
- [ ] Set up automated Supabase database backups
- [ ] Test WhatsApp checkout on both mobile and desktop
- [ ] Add Google Analytics / Plausible tracking
- [ ] Review and update legal pages (Privacy, Terms, Shipping)
