# Setup Guide - Task Manager Pro

This guide will walk you through setting up the Task Manager Pro application from scratch.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Database Configuration](#database-configuration)
4. [Environment Variables](#environment-variables)
5. [Running the Application](#running-the-application)
6. [Social Authentication Setup](#social-authentication-setup)
7. [Deployment to Vercel](#deployment-to-vercel)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **npm** (comes with Node.js) or **yarn**
- **Git** ([Download](https://git-scm.com/))
- **PostgreSQL** database (local or cloud)

Verify installations:

```bash
node --version  # Should be v18.0.0 or higher
npm --version   # Should be v9.0.0 or higher
git --version
```

---

## Local Development Setup

### Step 1: Clone the Repository

```bash
git clone <your-repository-url>
cd task-manager-pro
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required dependencies including:

- Next.js 16
- NextAuth.js v5
- Prisma ORM
- Tailwind CSS
- And more...

---

## Database Configuration

You have three options for setting up your database:

### Option 1: Prisma Postgres (Recommended for Quick Start)

The easiest way to get started. Prisma will run a local PostgreSQL instance for you.

```bash
# Start Prisma Postgres
npx prisma dev
```

This will:

- Start a local PostgreSQL server
- Automatically configure your `DATABASE_URL`
- Keep running in the background

### Option 2: Local PostgreSQL

If you have PostgreSQL installed locally:

```bash
# Create a new database
createdb taskmanager

# Or using psql
psql -U postgres
CREATE DATABASE taskmanager;
\q
```

Then set your `DATABASE_URL` in `.env`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/taskmanager"
```

### Option 3: Cloud Database (Recommended for Production)

Use a cloud PostgreSQL provider:

**Neon** (Recommended - Free tier available):

1. Go to [neon.tech](https://neon.tech)
2. Sign up and create a new project
3. Copy the connection string
4. Add to `.env`

**Supabase**:

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Project Settings > Database
4. Copy the connection string
5. Add to `.env`

**Railway**:

1. Go to [railway.app](https://railway.app)
2. Create a new project
3. Add PostgreSQL service
4. Copy the connection string
5. Add to `.env`

---

## Environment Variables

### Step 1: Copy the Example File

```bash
cp .env.example .env
```

### Step 2: Configure Required Variables

Open `.env` and update the following:

```env
# Database Connection
DATABASE_URL="your-database-url-here"

# Generate secure secrets
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
JWT_SECRET="$(openssl rand -base64 32)"

# Must be exactly 32 characters
ENCRYPTION_KEY="your-32-character-key-here!!!!!"

# Local development URL
NEXTAUTH_URL="http://localhost:3000"
```

#### Generating Secure Secrets

**On macOS/Linux:**

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate JWT_SECRET
openssl rand -base64 32

# Generate ENCRYPTION_KEY (32 characters)
openssl rand -hex 16
```

**On Windows (PowerShell):**

```powershell
# Generate random secrets
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

**Or use an online generator:**

- https://generate-secret.vercel.app/32

---

## Running the Application

### Step 1: Generate Prisma Client

```bash
npx prisma generate
```

### Step 2: Run Database Migrations

```bash
npx prisma migrate dev --name init
```

This creates all necessary tables in your database.

### Step 3: (Optional) Seed the Database

You can manually create a user through the UI or use Prisma Studio:

```bash
npx prisma studio
```

This opens a GUI at `http://localhost:5555` where you can manually add data.

### Step 4: Start the Development Server

```bash
npm run dev
```

The application will be available at:

```
http://localhost:3000
```

### Step 5: Create Your First User

1. Navigate to `http://localhost:3000`
2. Click "Get Started" or "Sign Up"
3. Fill in your details
4. Click "Sign Up"
5. You'll be automatically redirected to the dashboard!

---

## Social Authentication Setup

Social login is optional but recommended for better UX.

### Google OAuth Setup

1. **Go to Google Cloud Console**
   - Visit [console.cloud.google.com](https://console.cloud.google.com)
2. **Create a New Project**
   - Click "Select Project" > "New Project"
   - Name it "Task Manager Pro"
3. **Enable Google+ API**
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click "Enable"
4. **Create OAuth Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URI:
     ```
     http://localhost:3000/api/auth/callback/google
     ```
   - For production, also add:
     ```
     https://your-domain.vercel.app/api/auth/callback/google
     ```
5. **Add to .env**
   ```env
   GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="your-client-secret"
   ```

### GitHub OAuth Setup

1. **Go to GitHub Developer Settings**
   - Visit [github.com/settings/developers](https://github.com/settings/developers)
2. **Create a New OAuth App**
   - Click "New OAuth App"
   - Fill in details:
     - Application name: "Task Manager Pro"
     - Homepage URL: `http://localhost:3000`
     - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
3. **Generate Client Secret**
   - After creating, click "Generate a new client secret"
4. **Add to .env**
   ```env
   GITHUB_ID="your-github-client-id"
   GITHUB_SECRET="your-github-client-secret"
   ```

### Restart the Server

After adding OAuth credentials:

```bash
# Stop the server (Ctrl+C)
# Start it again
npm run dev
```

Now you'll see Google and GitHub login buttons on the sign-in page!

---

## Deployment to Vercel

### Prerequisites

- GitHub account
- Vercel account (free at [vercel.com](https://vercel.com))
- Cloud PostgreSQL database

### Step 1: Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Task Manager Pro"

# Create a new repository on GitHub
# Then push your code
git remote add origin https://github.com/TheUzair/task-manager-pro.git
git branch -M main
git push -u origin main
```

### Step 2: Import to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" > "Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js

### Step 3: Configure Environment Variables

In Vercel project settings, add all environment variables:

```env
DATABASE_URL="your-production-database-url"
NEXTAUTH_SECRET="your-production-secret"
NEXTAUTH_URL="https://your-app.vercel.app"
JWT_SECRET="your-jwt-secret"
ENCRYPTION_KEY="your-32-char-key"
GOOGLE_CLIENT_ID="your-google-id"
GOOGLE_CLIENT_SECRET="your-google-secret"
GITHUB_ID="your-github-id"
GITHUB_SECRET="your-github-secret"
```

**Important Notes:**

- Use a cloud PostgreSQL database for production
- Generate NEW secrets for production (don't reuse dev secrets)
- Update `NEXTAUTH_URL` to your Vercel domain
- Update OAuth redirect URIs to include your Vercel domain

### Step 4: Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Visit your live site!

### Step 5: Run Database Migrations

After first deployment:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Run migrations
vercel env pull .env.production
npx prisma migrate deploy
```

### Step 6: Update OAuth Redirect URIs

Don't forget to add your production URLs to:

- Google Cloud Console OAuth redirect URIs
- GitHub OAuth App callback URLs

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Error

**Error:** `Can't reach database server`

**Solution:**

- Verify DATABASE_URL is correct
- Ensure database server is running
- Check network connectivity
- For local PostgreSQL, ensure service is started

#### 2. NextAuth Error

**Error:** `[next-auth][error][MISSING_SECRET]`

**Solution:**

- Ensure NEXTAUTH_SECRET is set in .env
- Must be at least 32 characters
- Restart the dev server

#### 3. Prisma Client Not Found

**Error:** `Cannot find module '@/lib/generated/prisma'`

**Solution:**

```bash
npx prisma generate
```

#### 4. OAuth Not Working

**Error:** OAuth login fails or redirects incorrectly

**Solution:**

- Verify OAuth credentials are correct
- Check redirect URIs match exactly
- Ensure NEXTAUTH_URL is correct
- Clear browser cookies and try again

#### 5. Build Errors on Vercel

**Error:** Build fails with TypeScript errors

**Solution:**

- Run `npm run build` locally first
- Fix any errors locally
- Commit and push fixes
- Vercel will auto-deploy

#### 6. Can't See Environment Variables

**Error:** Environment variables return undefined

**Solution:**

- Restart the dev server after changing .env
- For Vercel, check Environment Variables in project settings
- Ensure variable names match exactly (case-sensitive)

### Getting Help

If you encounter issues:

1. Check the [Next.js Documentation](https://nextjs.org/docs)
2. Review [NextAuth.js Docs](https://next-auth.js.org)
3. Check [Prisma Documentation](https://www.prisma.io/docs)
4. Search [GitHub Discussions](https://github.com/vercel/next.js/discussions)

---

## Development Tips

### VS Code Extensions (Recommended)

- ES7+ React/Redux/React-Native snippets
- Prisma
- Tailwind CSS IntelliSense
- ESLint
- Prettier

### Useful Commands

```bash
# Development
npm run dev        # Start dev server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint

# Database
npx prisma studio  # Open Prisma Studio GUI
npx prisma migrate dev  # Create migration
npx prisma generate     # Generate Prisma Client
npx prisma db push      # Push schema to database

# Debugging
npm run dev -- --turbo  # Use Turbopack for faster builds
```

### Project Structure Tips

- `/app` - Next.js App Router pages and API routes
- `/components` - Reusable React components
- `/lib` - Utility functions and configurations
- `/prisma` - Database schema and migrations
- `/public` - Static assets

### Best Practices

1. **Never commit .env files** - They're in .gitignore
2. **Use environment variables** for all secrets
3. **Test locally before deploying**
4. **Keep dependencies updated** regularly
5. **Use TypeScript** for type safety
6. **Follow the existing code style**

---

## Next Steps

Now that your app is set up:

1. ✅ Create your first task
2. ✅ Test all CRUD operations
3. ✅ Try dark mode
4. ✅ Test on mobile devices
5. ✅ Set up OAuth social logins
6. ✅ Deploy to Vercel
7. ✅ Share your live URL!

---

**Need More Help?**

- 📖 Read the [README.md](./README.md)
- 📚 Check [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- 🐛 Report issues on GitHub
- 💬 Ask questions in discussions

---

**Last Updated:** March 14, 2026
