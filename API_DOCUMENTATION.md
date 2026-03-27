# API Documentation - Planify

## Base URL

```
Development: http://localhost:3000/api
Production: https://your-app.vercel.app/api
```

## Authentication

All task-related endpoints require authentication via session cookies. Authentication is handled automatically by NextAuth.js after login.

## Endpoints

### Authentication

#### 1. Register User

Create a new user account.

**Endpoint:** `POST /auth/register`

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Validation Rules:**

- `name`: Minimum 2 characters
- `email`: Valid email format
- `password`:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number

**Success Response (201 Created):**

```json
{
  "message": "User registered successfully",
  "user": {
    "id": "clxxx123456",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2026-03-14T10:30:00.000Z"
  }
}
```

**Error Responses:**

400 Bad Request - Validation Error:

```json
{
  "error": "Validation failed",
  "details": [
    {
      "path": ["password"],
      "message": "Password must contain at least one uppercase letter"
    }
  ]
}
```

400 Bad Request - User Exists:

```json
{
  "error": "User with this email already exists"
}
```

500 Internal Server Error:

```json
{
  "error": "Internal server error"
}
```

---

#### 2. Sign In

Sign in with email and password using NextAuth.

**Endpoint:** `POST /api/auth/signin`

**Note:** This endpoint is handled by NextAuth. Use the frontend sign-in form or call `signIn()` from next-auth/react.

---

### Tasks

#### 3. Create Task

Create a new task for the authenticated user.

**Endpoint:** `POST /tasks`

**Authentication:** Required (Session Cookie)

**Request Body:**

```json
{
  "title": "Complete project documentation",
  "description": "Write comprehensive README and API docs",
  "status": "TODO"
}
```

**Field Details:**

- `title` (required): String, 1-255 characters
- `description` (optional): String, any length - will be encrypted
- `status` (optional): Enum - `TODO`, `IN_PROGRESS`, `COMPLETED` (default: `TODO`)

**Success Response (201 Created):**

```json
{
  "message": "Task created successfully",
  "task": {
    "id": "clxxx123456",
    "title": "Complete project documentation",
    "description": "U2FsdGVkX1...", // Encrypted
    "status": "TODO",
    "createdAt": "2026-03-14T10:30:00.000Z",
    "updatedAt": "2026-03-14T10:30:00.000Z"
  }
}
```

**Error Responses:**

401 Unauthorized:

```json
{
  "error": "Unauthorized"
}
```

400 Bad Request:

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

---

#### 4. List Tasks

Get a paginated list of tasks with optional filtering and search.

**Endpoint:** `GET /tasks`

**Authentication:** Required (Session Cookie)

**Query Parameters:**

- `page` (optional): Integer, default: 1
- `limit` (optional): Integer, max: 100, default: 10
- `status` (optional): Enum - `TODO`, `IN_PROGRESS`, `COMPLETED`
- `search` (optional): String - searches in task title (case-insensitive)

**Example Requests:**

```
GET /tasks
GET /tasks?page=2&limit=20
GET /tasks?status=TODO
GET /tasks?search=documentation
GET /tasks?page=1&limit=10&status=IN_PROGRESS&search=project
```

**Success Response (200 OK):**

```json
{
  "tasks": [
    {
      "id": "clxxx123456",
      "title": "Complete project documentation",
      "description": "U2FsdGVkX1...", // Encrypted
      "status": "TODO",
      "createdAt": "2026-03-14T10:30:00.000Z",
      "updatedAt": "2026-03-14T10:30:00.000Z"
    },
    {
      "id": "clxxx789012",
      "title": "Deploy to Vercel",
      "description": null,
      "status": "IN_PROGRESS",
      "createdAt": "2026-03-14T11:00:00.000Z",
      "updatedAt": "2026-03-14T11:30:00.000Z"
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

**Error Responses:**

401 Unauthorized:

```json
{
  "error": "Unauthorized"
}
```

400 Bad Request:

```json
{
  "error": "Invalid query parameters",
  "details": [...]
}
```

---

#### 5. Get Single Task

Get detailed information about a specific task.

**Endpoint:** `GET /tasks/:id`

**Authentication:** Required (Session Cookie)

**URL Parameters:**

- `id`: Task ID (cuid)

**Example Request:**

```
GET /tasks/clxxx123456
```

**Success Response (200 OK):**

```json
{
  "task": {
    "id": "clxxx123456",
    "title": "Complete project documentation",
    "description": "Write comprehensive README and API docs", // Decrypted
    "status": "TODO",
    "createdAt": "2026-03-14T10:30:00.000Z",
    "updatedAt": "2026-03-14T10:30:00.000Z"
  }
}
```

**Error Responses:**

401 Unauthorized:

```json
{
  "error": "Unauthorized"
}
```

403 Forbidden (not task owner):

```json
{
  "error": "Forbidden"
}
```

404 Not Found:

```json
{
  "error": "Task not found"
}
```

---

#### 6. Update Task

Update an existing task. Only the task owner can update their tasks.

**Endpoint:** `PUT /tasks/:id`

**Authentication:** Required (Session Cookie)

**URL Parameters:**

- `id`: Task ID (cuid)

**Request Body:**
All fields are optional. Only include fields you want to update.

```json
{
  "title": "Updated task title",
  "description": "Updated description",
  "status": "IN_PROGRESS"
}
```

**Success Response (200 OK):**

```json
{
  "message": "Task updated successfully",
  "task": {
    "id": "clxxx123456",
    "title": "Updated task title",
    "description": "Updated description", // Decrypted in response
    "status": "IN_PROGRESS",
    "createdAt": "2026-03-14T10:30:00.000Z",
    "updatedAt": "2026-03-14T12:00:00.000Z"
  }
}
```

**Error Responses:**

401 Unauthorized:

```json
{
  "error": "Unauthorized"
}
```

403 Forbidden:

```json
{
  "error": "Forbidden"
}
```

404 Not Found:

```json
{
  "error": "Task not found"
}
```

400 Bad Request:

```json
{
  "error": "Validation failed",
  "details": [...]
}
```

---

#### 7. Delete Task

Permanently delete a task. Only the task owner can delete their tasks.

**Endpoint:** `DELETE /tasks/:id`

**Authentication:** Required (Session Cookie)

**URL Parameters:**

- `id`: Task ID (cuid)

**Example Request:**

```
DELETE /tasks/clxxx123456
```

**Success Response (200 OK):**

```json
{
  "message": "Task deleted successfully"
}
```

**Error Responses:**

401 Unauthorized:

```json
{
  "error": "Unauthorized"
}
```

403 Forbidden:

```json
{
  "error": "Forbidden"
}
```

404 Not Found:

```json
{
  "error": "Task not found"
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Description                    |
| ---- | ------------------------------ |
| 200  | Success                        |
| 201  | Created                        |
| 400  | Bad Request (validation error) |
| 401  | Unauthorized (not logged in)   |
| 403  | Forbidden (no permission)      |
| 404  | Not Found                      |
| 500  | Internal Server Error          |

### Error Response Format

All error responses follow this format:

```json
{
  "error": "Error message",
  "details": [] // Optional: validation errors
}
```

---

## Security Features

### Authentication

- JWT-based session management
- HTTP-only cookies prevent XSS attacks
- Secure flag enabled in production
- CSRF protection via NextAuth

### Authorization

- Row-level security (users can only access their own tasks)
- Every request validates task ownership
- Server-side session validation

### Data Protection

- Password hashing with bcrypt (12 salt rounds)
- Task descriptions encrypted with AES-256
- Environment variables for sensitive keys
- NoSQL injection prevention via Mongoose ODM

### Input Validation

- Zod schemas for type-safe validation
- Client and server-side validation
- Sanitized error messages

---

## Rate Limiting

Currently no rate limiting is implemented. In production, consider implementing:

- Rate limiting per IP address
- Rate limiting per user account
- DDoS protection via your hosting provider

---

## Testing with cURL

### Register a new user

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

### Create a task (requires authentication)

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "title": "Test Task",
    "description": "This is a test",
    "status": "TODO"
  }'
```

### Get all tasks

```bash
curl -X GET "http://localhost:3000/api/tasks?page=1&limit=10" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

### Update a task

```bash
curl -X PUT http://localhost:3000/api/tasks/TASK_ID \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "status": "COMPLETED"
  }'
```

### Delete a task

```bash
curl -X DELETE http://localhost:3000/api/tasks/TASK_ID \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

---

## Testing with Postman

1. **Import Collection**: Create a new Postman collection
2. **Set Base URL**: Create an environment variable `base_url` = `http://localhost:3000/api`
3. **Authentication**:
   - Sign in through the web UI first
   - Copy the `next-auth.session-token` cookie
   - Add it to your Postman requests

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- Task descriptions are automatically encrypted/decrypted
- Date fields: `createdAt` and `updatedAt` are managed automatically
- Pagination starts at page 1
- Maximum items per page: 100
- Default items per page: 10

---

**Last Updated:** March 14, 2026
