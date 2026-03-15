# Task Manager Pro 🚀

A production-ready task management application built with Next.js, featuring enterprise-grade security, authentication, and a modern UI.

## 🌐 Live Demo

**Live URL:** (https://task-manager-pro-sable.vercel.app/)

**GitHub Repository:** (https://github.com/TheUzair/Task-Manager-Pro)

## ✨ Features

### Core Functionality

- ✅ **Full CRUD Operations** - Create, Read, Update, and Delete tasks
- 🔍 **Advanced Search** - Search tasks by title with real-time filtering
- 📊 **Status Filtering** - Filter tasks by TODO, IN_PROGRESS, or COMPLETED
- 📱 **Pagination** - Efficient task listing with pagination support
- 🌙 **Dark Mode** - Beautiful dark/light theme toggle
- 🎨 **Modern UI** - Clean, responsive design with Framer Motion animations

### Security Features

- 🔐 **JWT Authentication** - Secure token-based authentication
- 🍪 **HTTP-only Cookies** - Access tokens stored securely
- 🔒 **Password Hashing** - bcrypt with salt rounds for password security
- 🛡️ **AES Encryption** - Sensitive data encrypted at rest
- ✅ **Input Validation** - Zod schemas for robust validation
- 🚫 **SQL Injection Prevention** - Prisma ORM prevents SQL injection
- 👤 **Authorization** - Users can only access their own tasks
- 🌐 **Social Auth** - Google and GitHub OAuth integration

### Technical Highlights

- ⚡ **Next.js 15** - Latest App Router with Server Components
- 💾 **PostgreSQL** - Robust relational database
- 🔧 **Prisma ORM** - Type-safe database access
- 🎯 **TypeScript** - Full type safety throughout
- 🎨 **Tailwind CSS** - Modern utility-first styling
- 🧩 **Shadcn UI** - Beautiful, accessible components
- 🎭 **Framer Motion** - Smooth animations and transitions

## 🏗️ Architecture

### Tech Stack

- **Frontend:** Next.js 15, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** NextAuth.js v5 (Auth.js)
- **UI Components:** Shadcn UI, Heroicons
- **Animations:** Framer Motion
- **Validation:** Zod
- **Encryption:** crypto-js (AES-256)
- **Deployment:** Vercel

### Project Structure

```
task-manager-pro/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts  # NextAuth handler
│   │   │   └── register/route.ts        # User registration
│   │   └── tasks/
│   │       ├── route.ts                 # List & create tasks
│   │       └── [id]/route.ts            # Get, update, delete task
│   ├── auth/
│   │   ├── signin/page.tsx              # Sign in page
│   │   └── signup/page.tsx              # Sign up page
│   ├── dashboard/page.tsx               # Main dashboard
│   ├── layout.tsx                       # Root layout
│   ├── page.tsx                         # Landing page
│   └── globals.css                      # Global styles
├── components/
│   ├── tasks/
│   │   ├── create-task-modal.tsx        # Create modal
│   │   ├── edit-task-modal.tsx          # Edit modal
│   │   ├── view-task-modal.tsx          # View modal
│   │   ├── delete-task-modal.tsx        # Delete confirmation
│   │   └── task-card.tsx                # Task card component
│   ├── ui/                              # Shadcn UI components
│   ├── auth-provider.tsx                # NextAuth session provider
│   ├── theme-provider.tsx               # Theme context provider
│   └── theme-toggle.tsx                 # Dark mode toggle
├── lib/
│   ├── auth.ts                          # NextAuth configuration
│   ├── prisma.ts                        # Prisma client singleton
│   ├── encryption.ts                    # AES encryption utilities
│   ├── validations.ts                   # Zod validation schemas
│   └── utils.ts                         # Utility functions
├── prisma/
│   └── schema.prisma                    # Database schema
├── types/
│   └── next-auth.d.ts                   # NextAuth type extensions
└── .env                                 # Environment variables
```

### Database Schema

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  password      String?
  tasks         Task[]
  accounts      Account[]
  sessions      Session[]
}

model Task {
  id          String     @id @default(cuid())
  title       String
  description String?    @db.Text
  status      TaskStatus @default(TODO)
  userId      String
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  user        User       @relation(fields: [userId], references: [id], onDelete: Cascade)
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  COMPLETED
}
```

## 📋 API Documentation

### Authentication Endpoints

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response (201):**

```json
{
  "message": "User registered successfully",
  "user": {
    "id": "clxxx...",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2026-03-14T..."
  }
}
```

#### Sign In

```http
POST /api/auth/signin
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

### Task Endpoints (Protected)

All task endpoints require authentication via session cookie.

#### Create Task

```http
POST /api/tasks
Content-Type: application/json

{
  "title": "Complete project documentation",
  "description": "Write comprehensive README",
  "status": "TODO"
}
```

**Response (201):**

```json
{
  "message": "Task created successfully",
  "task": {
    "id": "clxxx...",
    "title": "Complete project documentation",
    "description": "encrypted_string",
    "status": "TODO",
    "createdAt": "2026-03-14T...",
    "updatedAt": "2026-03-14T..."
  }
}
```

#### List Tasks (with pagination & filters)

```http
GET /api/tasks?page=1&limit=10&status=TODO&search=project
```

**Response (200):**

```json
{
  "tasks": [
    {
      "id": "clxxx...",
      "title": "Complete project documentation",
      "description": "encrypted_string",
      "status": "TODO",
      "createdAt": "2026-03-14T...",
      "updatedAt": "2026-03-14T..."
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### Get Single Task

```http
GET /api/tasks/{taskId}
```

**Response (200):**

```json
{
  "task": {
    "id": "clxxx...",
    "title": "Complete project documentation",
    "description": "Write comprehensive README",
    "status": "TODO",
    "createdAt": "2026-03-14T...",
    "updatedAt": "2026-03-14T..."
  }
}
```

#### Update Task

```http
PUT /api/tasks/{taskId}
Content-Type: application/json

{
  "title": "Updated title",
  "description": "Updated description",
  "status": "IN_PROGRESS"
}
```

**Response (200):**

```json
{
  "message": "Task updated successfully",
  "task": {
    "id": "clxxx...",
    "title": "Updated title",
    "description": "Updated description",
    "status": "IN_PROGRESS",
    "createdAt": "2026-03-14T...",
    "updatedAt": "2026-03-14T..."
  }
}
```

#### Delete Task

```http
DELETE /api/tasks/{taskId}
```

**Response (200):**

```json
{
  "message": "Task deleted successfully"
}
```

### Error Responses

**401 Unauthorized:**

```json
{
  "error": "Unauthorized"
}
```

**403 Forbidden:**

```json
{
  "error": "Forbidden"
}
```

**404 Not Found:**

```json
{
  "error": "Task not found"
}
```

**400 Bad Request:**

```json
{
  "error": "Validation failed",
  "details": [
    {
      "path": ["title"],
      "message": "Title is required"
    }
  ]
}
```

**500 Internal Server Error:**

```json
{
  "error": "Internal server error"
}
```

## 🚀 Setup Instructions

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- npm or yarn package manager

### Installation Steps

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd task-manager-pro
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:

   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/taskmanager"

   # NextAuth
   NEXTAUTH_SECRET="your-super-secret-nextauth-key-minimum-32-characters"
   NEXTAUTH_URL="http://localhost:3000"

   # JWT
   JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters"

   # Encryption (must be 32 characters for AES-256)
   ENCRYPTION_KEY="your-32-character-encryption-key!"

   # Google OAuth (optional)
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"

   # GitHub OAuth (optional)
   GITHUB_ID="your-github-app-id"
   GITHUB_SECRET="your-github-app-secret"
   ```

4. **Generate Prisma Client**

   ```bash
   npx prisma generate
   ```

5. **Run database migrations**

   ```bash
   npx prisma migrate dev --name init
   ```

6. **Start the development server**

   ```bash
   npm run dev
   ```

7. **Open your browser**

   Navigate to `http://localhost:3000`

### Database Setup Options

#### Option 1: Local PostgreSQL

```bash
# Install PostgreSQL locally
# Create a database
createdb taskmanager

# Update DATABASE_URL in .env
DATABASE_URL="postgresql://postgres:password@localhost:5432/taskmanager"
```

#### Option 2: Prisma Postgres (Recommended for quick start)

```bash
npx prisma dev
# This will start a local Prisma Postgres instance
```

#### Option 3: Cloud Database (Neon, Supabase, Railway, etc.)

- Create a PostgreSQL database on your preferred cloud provider
- Copy the connection string to `.env`

## 🔒 Security Implementation

### 1. Authentication & Authorization

- **JWT Tokens:** Signed with HS256 algorithm
- **HTTP-only Cookies:** Prevents XSS attacks
- **Secure Flag:** Enabled in production
- **Password Hashing:** bcrypt with 12 salt rounds
- **Session Validation:** Server-side session checks

### 2. Data Encryption

- **Algorithm:** AES-256-CBC
- **Implementation:** Task descriptions encrypted at rest
- **Key Management:** Environment variables

### 3. Input Validation

- **Zod Schemas:** Type-safe validation
- **SQL Injection:** Prevented by Prisma parameterized queries
- **XSS Prevention:** React's built-in escaping
- **CSRF Protection:** NextAuth CSRF tokens

### 4. Authorization

- **Row-level Security:** Users can only access their own tasks
- **Ownership Verification:** Every API call verifies task ownership
- **Session-based Auth:** Server-side session validation

## 🎨 UI/UX Features

- **Responsive Design:** Mobile-first approach
- **Dark Mode:** System preference detection with manual toggle
- **Loading States:** Spinners on all async operations
- **Error Handling:** User-friendly error messages
- **Animations:** Smooth transitions with Framer Motion
- **Modals:** Centered, scrollable, accessible
- **Form Validation:** Real-time client-side validation
- **Toast Notifications:** Success/error feedback

## 📝 Development Scripts

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm run start        # Start production server

# Database
npx prisma generate  # Generate Prisma Client
npx prisma migrate dev  # Run migrations
npx prisma studio    # Open Prisma Studio
npx prisma db push   # Push schema changes

# Code Quality
npm run lint         # Run ESLint
```

## 🚀 Deployment to Vercel

1. **Push code to GitHub**

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo>
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure environment variables
   - Deploy!

3. **Environment Variables on Vercel**

   Add all variables from your `.env` file:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (set to your Vercel URL)
   - `JWT_SECRET`
   - `ENCRYPTION_KEY`
   - Add OAuth credentials if using social login

4. **Database Connection**
   - Use a cloud PostgreSQL provider (Neon, Supabase, Railway)
   - Update `DATABASE_URL` in Vercel environment variables

## 🧪 Testing the Application

### Manual Testing Checklist

- [ ] User registration with validation
- [ ] User login with credentials
- [ ] Social login (Google/GitHub)
- [ ] Create task with all fields
- [ ] View task details in modal
- [ ] Edit task with prefilled values
- [ ] Delete task with confirmation
- [ ] Search tasks by title
- [ ] Filter tasks by status
- [ ] Pagination navigation
- [ ] Dark/light theme toggle
- [ ] Responsive design on mobile
- [ ] Loading states on all actions
- [ ] Error handling and messages

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👤 Author

**Your Name**

- GitHub: [@TheUzair](https://github.com/TheUzair)
- Email: mohujer90@gmail.com

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Vercel for hosting
- Shadcn for beautiful UI components
- Prisma for the excellent ORM

---

**Built with ❤️ using Next.js, TypeScript, and modern web technologies**
