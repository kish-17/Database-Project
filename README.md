# Community Social Media Platform

A full-stack social media application focused on community-based interactions, built with React, FastAPI, and PostgreSQL.

## Features

### Core Functionality
- **User Authentication**: Secure signup/login using Supabase Auth
- **Communities**: Create, join, and manage communities
- **Posts**: Create, edit, and delete posts with optional media attachments
- **Comments**: Add and remove comments on posts
- **Likes**: Like/unlike posts with real-time counts
- **Chat Rooms**: Real-time community chat functionality
- **User Profiles**: Edit display name and bio
- **Role Management**: Assign member/moderator roles in communities

### Key Features
- **Cascade Deletion**: Deleting a community automatically removes all associated posts, comments, likes, and chat rooms
- **Audit Logging**: Automatic tracking of post/comment deletions with full data snapshots
- **Member Management**: Track community members and their roles
- **Owner Privileges**: Community creators have automatic access to all content
- **Real-time Updates**: Optimistic UI updates for better user experience
- **Database Triggers**: Automated audit logging via PostgreSQL triggers
- **Stored Procedures**: Complex queries and statistics via database functions

## Tech Stack

### Frontend
- **React 18** with Vite
- **React Router** for navigation
- **Axios** for API calls
- **Tailwind CSS** for styling
- **Shadcn UI** components

### Backend
- **FastAPI** (Python web framework)
- **SQLAlchemy** ORM
- **PostgreSQL** database via Supabase
- **Supabase Auth** for authentication
- **Pydantic** for data validation

## Project Structure

```
Database Project/
├── backend/
│   ├── config/
│   │   └── db.py              # Database configuration
│   ├── models.py              # SQLAlchemy models
│   ├── dependencies.py        # FastAPI dependencies
│   ├── main.py                # Application entry point
│   ├── routers/               # API endpoints
│   │   ├── auth/
│   │   ├── communities/
│   │   ├── posts/
│   │   ├── comments/
│   │   ├── likes/
│   │   ├── chat/
│   │   ├── memberships/
│   │   └── users/
│   ├── services/              # Business logic
│   └── schemas/               # Pydantic schemas
└── frontend/
    ├── src/
    │   ├── api/               # API client functions
    │   ├── components/        # Reusable components
    │   ├── pages/             # Page components
    │   └── routes/            # Route configuration
    └── public/

```

## Database Schema

### Tables (9 total - 3NF normalized)
- **users**: User accounts (managed by Supabase Auth)
- **communities**: Community information
- **memberships**: User-community relationships with roles
- **posts**: Community posts with media support
- **comments**: Post comments
- **likes**: Post likes
- **chat_rooms**: Community chat rooms
- **messages**: Chat messages
- **audit_log**: Deletion audit trail with JSONB snapshots

### Database Features
- **Primary & Foreign Keys**: All tables have proper PKs and FKs with referential integrity
- **Integrity Constraints**: 
  - ON DELETE: CASCADE (most tables), SET NULL (messages.sender_id, audit_log.deleted_by)
  - ON UPDATE: CASCADE (all foreign keys)
  - CHECK constraints: role validation, message type validation
  - UNIQUE constraints: username, community name, composite uniques
- **Triggers (2)**:
  - `posts_delete_audit_trigger` - Automatically logs post deletions
  - `comments_delete_audit_trigger` - Automatically logs comment deletions
- **Functions/Procedures (5)**:
  - `handle_new_user()` - Auto-creates user profile on signup
  - `log_post_deletion()` - Trigger function for post audit logging
  - `log_comment_deletion()` - Trigger function for comment audit logging
  - `get_audit_logs()` - Query audit logs with filters (table, user, date range)
  - `get_user_deletion_stats()` - Get deletion statistics by user
- **Secondary Indexes (4)** - Optimized for common queries:
  - `idx_audit_log_table_name` - Filter logs by table type
  - `idx_audit_log_deleted_by` - Filter logs by user
  - `idx_audit_log_deleted_at` - Time-based log queries
  - `idx_audit_log_table_time` - Composite index for table+time queries

### Key Relationships
- Communities → Posts (CASCADE DELETE, CASCADE UPDATE)
- Posts → Comments (CASCADE DELETE, CASCADE UPDATE)
- Posts → Likes (CASCADE DELETE, CASCADE UPDATE)
- Communities → Chat Rooms (CASCADE DELETE, CASCADE UPDATE)
- Chat Rooms → Messages (CASCADE DELETE, CASCADE UPDATE)
- Users → All content (CASCADE DELETE/SET NULL based on context)

## Local Development Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL (via Supabase)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create `.env` file:
```env
DB_URL=postgresql://user:password@host:port/database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

5. Run the server:
```bash
uvicorn main:app --reload --port 8000
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Update API URL in `src/api/axios.js` if needed:
```javascript
const API_URL = 'http://localhost:8000';
```

4. Run the development server:
```bash
npm run dev
```

5. Open browser to `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /auth/signup` - Register new user
- `POST /auth/login` - Login user

### Communities
- `GET /communities/` - List all communities
- `POST /communities/` - Create community
- `GET /communities/{id}` - Get community details
- `PUT /communities/{id}` - Update community
- `DELETE /communities/{id}` - Delete community (cascade)

### Posts
- `GET /posts/community/{id}` - Get community posts
- `POST /posts/` - Create post
- `PUT /posts/{id}` - Edit post
- `DELETE /posts/{id}` - Delete post

### Comments
- `GET /comments/post/{id}` - Get post comments
- `POST /comments/` - Add comment
- `DELETE /comments/{id}` - Delete comment

### Likes
- `POST /likes/toggle/{post_id}` - Toggle like on post

### Chat
- `GET /chat/rooms/{community_id}` - Get chat rooms
- `POST /chat/rooms` - Create chat room
- `GET /chat/messages/{chat_id}` - Get messages
- `POST /chat/messages` - Send message

### Users
- `GET /users/profile` - Get current user profile
- `PUT /users/profile` - Update user profile

### Memberships
- `POST /memberships/join/{community_id}` - Join community
- `DELETE /memberships/leave/{community_id}` - Leave community
- `GET /memberships/members/{community_id}` - Get community members
- `PUT /memberships/role/{membership_id}` - Update member role

## Testing

### Test User Credentials
```
Email: lakshman.k@northeastern.edu
Password: password123
```

### API Testing with curl
See `test_all_endpoints.sh` for comprehensive API tests.

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions on Render.

## License

Academic project for Northeastern University.

