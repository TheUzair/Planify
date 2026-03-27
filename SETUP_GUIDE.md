# Setup Guide - Planify

This guide will walk you through setting up the Planify application from scratch.

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
- **MongoDB** database (local or [MongoDB Atlas](https://www.mongodb.com/atlas) free tier)

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
cd planify
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required dependencies including:

- Next.js 16
- NextAuth.js v5
- Mongoose ODM
- Tailwind CSS
- And more...

---

## Database Configuration

You have two options for setting up your MongoDB database:

### Option 1: MongoDB Atlas (Recommended)

The easiest way to get started with a free cloud-hosted database.

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Sign up for a free account
3. Create a new cluster (M0 Free Tier)
4. Click "Connect" > "Connect your application"
5. Copy the connection string and add to `.env`:

```env
DATABASE_URL="mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/planify?retryWrites=true&w=majority"
```

> **Note:** Replace `<username>`, `<password>`, and the cluster URL with your actual values. Make sure to add your IP to the Atlas Network Access whitelist.

### Option 2: Local MongoDB

If you have MongoDB installed locally:

```bash
# Start MongoDB service (macOS with Homebrew)
brew services start mongodb-community

# Or on Windows, start the MongoDB service
net start MongoDB
```

Then set your `DATABASE_URL` in `.env`:

```env
DATABASE_URL="mongodb://localhost:27017/planify"
```

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

### Step 1: (Optional) Seed the Database

```bash
npm run seed
```

This creates sample users and tasks in your database.

### Step 2: Start the Development Server

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
   - Name it "Planify"
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
     - Application name: "Planify"
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
- MongoDB Atlas database (or local MongoDB)

### Step 1: Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Planify"

# Create a new repository on GitHub
# Then push your code
git remote add origin https://github.com/TheUzair/planify.git
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

- Use MongoDB Atlas for production
- Generate NEW secrets for production (don't reuse dev secrets)
- Update `NEXTAUTH_URL` to your Vercel domain
- Update OAuth redirect URIs to include your Vercel domain

### Step 4: Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Visit your live site!

### Step 5: Run Database Seed (Optional)

After first deployment:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Pull production env and seed
vercel env pull .env.production
npm run seed
```

### Step 6: Update OAuth Redirect URIs

Don't forget to add your production URLs to:

- Google Cloud Console OAuth redirect URIs
- GitHub OAuth App callback URLs

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Error

**Error:** `MongoServerError` or `MongoNetworkError`

**Solution:**

- Verify DATABASE_URL is a valid MongoDB connection string
- Ensure MongoDB server is running (local) or Atlas cluster is active
- Check your IP is whitelisted in MongoDB Atlas Network Access
- Verify username and password are correct

#### 2. NextAuth Error

**Error:** `[next-auth][error][MISSING_SECRET]`

**Solution:**

- Ensure NEXTAUTH_SECRET is set in .env
- Must be at least 32 characters
- Restart the dev server

#### 3. Mongoose Connection Not Found

**Error:** `MongooseError: Operation ... timed out`

**Solution:**

- Verify your `DATABASE_URL` is set correctly in `.env`
- Check that your MongoDB instance is running and reachable
- Restart the dev server after changing `.env`

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
3. Check [Mongoose Documentation](https://mongoosejs.com/docs/)
4. Search [GitHub Discussions](https://github.com/vercel/next.js/discussions)

---

## Development Tips

### VS Code Extensions (Recommended)

- ES7+ React/Redux/React-Native snippets
- MongoDB for VS Code
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
npm run seed       # Seed the database

# Debugging
npm run dev -- --turbo  # Use Turbopack for faster builds
```

### Project Structure Tips

- `/app` - Next.js App Router pages and API routes
- `/components` - Reusable React components
- `/lib` - Utility functions and configurations
- `/lib/models` - Mongoose models (User, Task)
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
