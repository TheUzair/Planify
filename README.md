# Planify 🚀

Scalable REST API + frontend testing UI built with Next.js, MongoDB, Mongoose, JWT auth, and role-based access control (USER / ADMIN).

## 🌐 Live & Repo

- Live URL: https://planify-sable.vercel.app/
- GitHub Repository: https://github.com/TheUzair/planify

## ✅ Scope

### Backend (Primary)

- ✅ User registration & login APIs with bcrypt password hashing
- ✅ JWT authentication (Bearer token) + NextAuth session support
- ✅ Role-based access control (USER vs ADMIN)
- ✅ Full CRUD APIs for secondary entity (`tasks`)
- ✅ API versioning under `/api/v1/*`
- ✅ Validation + structured error handling with Zod + proper status codes
- ✅ MongoDB database schema with Mongoose ODM
- ✅ API documentation via Postman collection

### Frontend (Supportive)

- ✅ Next.js UI for signup/signin
- ✅ Protected dashboard UI for authenticated users
- ✅ CRUD UI for tasks (create/view/edit/delete)
- ✅ Admin panel UI for role-based admin actions
- ✅ Toast-based success/error feedback from API responses

### Security & Scalability

- ✅ JWT signing/verification (`jose`)
- ✅ Password hashing (`bcryptjs`)
- ✅ Input validation/sanitization with Zod
- ✅ Encrypted task descriptions at rest (AES via `crypto-js`)
- ✅ Modular project structure ready for new domains/modules
- ⚪ Optional (not implemented): Redis caching / Docker / centralized logging

## 🧱 Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, Framer Motion
- **Backend:** Next.js Route Handlers (REST APIs)
- **Database:** MongoDB (Atlas or local) + Mongoose v8
- **Authentication:** NextAuth v5 + custom JWT for API v1
- **Validation:** Zod
- **Security:** bcryptjs, jose, AES encryption
- **Deployment:** Vercel

## 🗂️ Project Structure (Key Paths)

```bash
planify/
├── app/
│   ├── api/
│   │   ├── auth/                         # Legacy auth/session routes
│   │   └── v1/                           # Versioned REST API
│   │       ├── auth/                     # register/login/me
│   │       ├── tasks/                    # tasks CRUD
│   │       └── admin/                    # users/tasks/stats (admin-only)
│   ├── auth/                             # signin/signup pages
│   ├── dashboard/                        # user dashboard
│   ├── admin/                            # admin control panel
│   └── layout.tsx
├── components/
│   ├── tasks/                            # task cards + CRUD modals
│   └── ui/                               # shadcn ui primitives
├── lib/
│   ├── auth.ts                           # NextAuth config
│   ├── jwt.ts                            # custom JWT utilities
│   ├── api-auth.ts                       # token/session user extraction
│   ├── rbac.ts                           # requireAuth/requireAdmin
│   ├── validations.ts                    # Zod schemas
│   ├── encryption.ts                     # AES encrypt/decrypt
│   ├── db.ts                             # Mongoose connection
│   └── models/                           # Mongoose models (User, Task)
└── public/
    └── Planify.postman_collection.json
```

## 🗄️ Database Design

### User model (RBAC)

- `role` enum: `USER | ADMIN`
- Relationship: one user to many tasks

### Task model

- Fields: `title`, `description`, `status`, timestamps
- `status` enum: `TODO | IN_PROGRESS | COMPLETED`
- Indexed by `user_id` and `status` for filtering/pagination

## 📘 API Documentation

### Versioning

- Base path: `/api/v1`

### Authentication (v1)

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`

### Tasks (v1)

- `GET /api/v1/tasks` (pagination, search, status filter)
- `POST /api/v1/tasks`
- `GET /api/v1/tasks/:id`
- `PUT /api/v1/tasks/:id`
- `DELETE /api/v1/tasks/:id`

### Admin (v1, ADMIN only)

- `GET /api/v1/admin/stats`
- `GET /api/v1/admin/users`
- `GET /api/v1/admin/users/:id`
- `PATCH /api/v1/admin/users/:id` (role update)
- `DELETE /api/v1/admin/users/:id`
- `GET /api/v1/admin/tasks`
- `DELETE /api/v1/admin/tasks/:id`

### Auth Modes Supported

- **Bearer JWT** from `/api/v1/auth/login`
- **NextAuth session** (cookie)

### Postman

- Import: `public/Planify.postman_collection.json`
- Uses variables:
  - `{{baseUrl}}` (default: `http://localhost:3000`)
  - `{{token}}` (auto-set by login request scripts)

## 🚀 Local Setup

### 1) Install

```bash
npm install
```

### 2) Configure environment

Create `.env.local` (or `.env`) with:

```env
DATABASE_URL="mongodb+srv://<user>:<password>@cluster.mongodb.net/<dbname>?retryWrites=true&w=majority"
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"
JWT_SECRET="..."
ENCRYPTION_KEY="your-32-char-key.............."

# Optional OAuth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GITHUB_ID="..."
GITHUB_SECRET="..."
```

### 3) Seed (optional)

```bash
npm run seed
```

### 4) Run app

```bash
npm run dev
```

Open: `http://localhost:3000`

## 👤 Seed Accounts

- Admin: `admin@planify.com` / `Admin@123456`
- User: `alice@example.com` / `User@123456`
- User: `bob@example.com` / `User@123456`
- User: `carol@example.com` / `User@123456`

## 🧪 Functional Frontend Coverage

- Register + login forms
- Authenticated dashboard
- Task CRUD with modal workflows
- Status/search/pagination controls
- Admin panel for users/tasks/stats
- Error/success toasts

## 🔐 Security Practices Implemented

- bcrypt password hashing (12 rounds)
- JWT token signing/verification (jose)
- RBAC checks on protected APIs
- Zod request validation
- Encrypted task descriptions in DB
- ✅ Mongoose ODM (schema validation prevents injection patterns by default)

## 📈 Scalability Notes

Current structure is monolithic but modular and ready to scale:

1. **Versioned APIs** (`/api/v1`) allow non-breaking future iterations (`/api/v2`)
2. **RBAC + auth abstraction** (`lib/api-auth.ts`, `lib/rbac.ts`) reusable across modules
3. **Domain separation** (`auth`, `tasks`, `admin`) supports extraction into services later
4. **Database indexes** on high-frequency query columns (`user_id`, `status`)
5. **Next steps for high scale:** Redis caching, queue-based background jobs, centralized logging, containerized deployment

## ✅ Evaluation Criteria Mapping

- ✅ API design: REST endpoints, status codes, modular route structure, versioning
- ✅ Database design: MongoDB schema with Mongoose ODM + seed data
- ✅ Security: JWT, hashing, RBAC, validation, encrypted sensitive fields
- ✅ Frontend integration: auth + protected dashboard + CRUD + admin management
- ✅ Deployment readiness: production deploy on Vercel + Postman API docs

## 📝 Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run seed
```

## 👤 Author

- GitHub: [@TheUzair](https://github.com/TheUzair)
- Email: mohujer90@gmail.com

---

Built with Next.js, TypeScript, MongoDB, and Mongoose.
