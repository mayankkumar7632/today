# KaamSetu

> This is the single official project overview for KaamSetu. The file PROJECT-DOCUMENTATION.md is kept only as a legacy reference and should not be treated as the active project description.

## Project Description

KaamSetu is a web application that connects daily-wage workers with employers. Many daily-wage workers wait every morning to find work, but sometimes they do not get a job. KaamSetu helps them find suitable nearby jobs. Employers can also find suitable workers for their requirements.

## Problem Statement

Daily-wage workers face uncertainty every morning about finding work. They often gather at specific locations hoping to be hired, with no guarantee of finding employment. Employers, on the other hand, struggle to find reliable workers quickly. KaamSetu bridges this gap through smart job matching, location-based search, and a trust system built on verification and reviews.

## Features

### Worker Features
- Register and create a profile with skills and experience
- Search for nearby jobs with filters
- Apply for jobs with one click
- Receive smart job recommendations based on skills, location, and wages
- View application status (pending, accepted, rejected, completed)
- Give ratings to employers after job completion
- Request verification for trust badge

### Employer Features
- Register and create a business profile
- Post jobs with required skills, wage, and location
- Receive applications from workers
- Accept or reject applications
- Get worker recommendations for their jobs
- Rate workers after job completion
- View worker profiles and verification status

### Admin Features
- Dashboard with system statistics
- Manage users (block/unblock)
- Review verification requests
- Manage complaints
- View all jobs and applications

### System Features
- JWT authentication with role-based access control
- Location-based job matching using MongoDB geospatial queries
- Smart recommendation engine with weighted scoring
- Multi-level verification system
- Two-way rating and review system
- Notification system
- Complaint/report system
- Rule-based chatbot for common questions and live job/application information
- Profile photo upload and display for worker and employer accounts (JPG, PNG, or WEBP, up to 2 MB)
- Mobile responsive design

### Chatbot
Signed-in users can ask the AI-powered KaamSetu Assistant about jobs, applications, verification, ratings, and complaints. The protected `POST /api/chatbot` endpoint accepts a message and optional conversation history. The server supplies the latest five open jobs from MongoDB as context to Google's Gemini API, retries once after a transient network error or HTTP 503, and falls back to the existing keyword-based replies if the AI service is unavailable. The assistant is instructed to stay within KaamSetu topics and not invent jobs or wages.

To enable AI replies, create a Gemini API key in [Google AI Studio](https://aistudio.google.com/app/apikey) and copy the settings from `server/.env.example` into `server/.env` (preserve any existing MongoDB and JWT values). Set `AI_API_KEY` to your key and `AI_MODEL` to a Gemini model available to your account (the tested default is `gemini-3.1-flash-lite`; friendly names such as `Gemini 2.5 Flash` are normalized). Keep the key private: `server/.env` is ignored by Git and the key is only used by the backend. Without a valid key, the rule-based fallback continues to work.

The chat widget also supports microphone input and optional spoken replies in English (India), Hindi, or Tamil, using the browser's built-in Web Speech APIs. Browser support and microphone permission are required.

## Email Notifications

1. Enable 2-Step Verification on the Gmail account that will send KaamSetu emails.
2. Open Google's App Password page (`https://myaccount.google.com/apppasswords`), create an app password, and copy the 16-character password.
3. Add these values to `server/.env`:

```env
EMAIL_USER=your-gmail-address@gmail.com
EMAIL_PASS=your-16-character-app-password
```

Use a Gmail App Password instead of the normal Gmail password because Google blocks direct sign-in by many apps. Restart the server; a successful connection prints `Email service ready`.

In development, an authenticated user can send a test email to their own registered address:

```text
POST /api/notifications/test-email
Authorization: Bearer <JWT_TOKEN>
```

The endpoint is disabled when `NODE_ENV=production`.

## Technology Stack

### Frontend
- React.js 18
- React Router v6
- JavaScript (ES6+)
- HTML5
- CSS3 (Mobile-first responsive design)

### Backend
- Node.js
- Express.js
- JWT (JSON Web Tokens)
- bcryptjs (Password hashing)

### Database
- MongoDB
- Mongoose ODM

### Authentication & Security
- JWT tokens
- bcrypt password hashing
- Role-based authorization middleware
- Environment variables for secrets

## Project Structure

```
KaamSetu/
|
+-- client/                        # React Frontend
|   +-- public/                   # Static files
|   +-- src/
|   |   +-- components/          # Reusable components
|   |   |   +-- Navbar.js
|   |   |   +-- Footer.js
|   |   |   +-- ProtectedRoute.js
|   |   |   +-- StarRating.js
|   |   +-- context/
|   |   |   +-- AuthContext.js   # Authentication state
|   |   +-- pages/
|   |   |   +-- auth/            # Login, Register
|   |   |   +-- worker/          # Worker pages
|   |   |   +-- employer/        # Employer pages
|   |   |   +-- admin/           # Admin pages
|   |   |   +-- public/          # Home page
|   |   +-- services/
|   |   |   +-- api.js           # API communication
|   |   +-- App.js
|   |   +-- App.css
|   |   +-- index.js
|   +-- package.json
|
+-- server/                        # Node.js Backend
|   +-- config/
|   |   +-- db.js                # MongoDB connection
|   +-- controllers/             # Route handlers
|   |   +-- authController.js
|   |   +-- workerController.js
|   |   +-- employerController.js
|   |   +-- jobController.js
|   |   +-- applicationController.js
|   |   +-- verificationController.js
|   |   +-- reviewController.js
|   |   +-- notificationController.js
|   |   +-- complaintController.js
|   |   +-- adminController.js
|   |   +-- recommendationController.js
|   |   +-- locationController.js
|   |   +-- userController.js
|   +-- middleware/
|   |   +-- auth.js              # JWT & role middleware
|   +-- models/                  # Database models
|   |   +-- User.js
|   |   +-- WorkerProfile.js
|   |   +-- EmployerProfile.js
|   |   +-- Job.js
|   |   +-- Application.js
|   |   +-- Verification.js
|   |   +-- Review.js
|   |   +-- Notification.js
|   |   +-- Complaint.js
|   +-- routes/                  # API routes
|   |   +-- authRoutes.js
|   |   +-- workerRoutes.js
|   |   +-- employerRoutes.js
|   |   +-- jobRoutes.js
|   |   +-- applicationRoutes.js
|   |   +-- verificationRoutes.js
|   |   +-- reviewRoutes.js
|   |   +-- notificationRoutes.js
|   |   +-- complaintRoutes.js
|   |   +-- adminRoutes.js
|   |   +-- recommendationRoutes.js
|   |   +-- locationRoutes.js
|   |   +-- userRoutes.js
|   +-- services/
|   |   +-- recommendationService.js
|   |   +-- locationService.js
|   +-- utils/
|   |   +-- seed.js              # Seed data script
|   +-- .env                     # Environment variables
|   +-- server.js                # Main server file
|   +-- package.json
|
+-- prompts/
+-- README.md
+-- .gitignore
```

## MongoDB Setup

### Prerequisites
- MongoDB must be installed and running on your machine
- The database name used is `kaamsetu`

### Configuration
- The MongoDB connection string is stored in `server/.env`
- **Never hard-code database credentials in source code**
- The `.env` file is included in `.gitignore`

### Starting MongoDB
```bash
# If using MongoDB Community Edition
mongod

# Or if using MongoDB Atlas, ensure your connection string is correct in .env
```

## Environment Variables

Create `server/.env` file:

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/kaamsetu
JWT_SECRET=your-secret-key-here
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMS_API_KEY=
NOTIFY_MODE=mock
```

### Email and SMS Notifications

The backend records one `Notification` document for each email/SMS channel attempt (`sent`, `failed`, or `skipped`). User notification preferences default to enabled. For a no-cost demo, leave `NOTIFY_MODE=mock`; both messages are printed in the backend console and logged as skipped. To send email, configure all four SMTP variables. `SMS_API_KEY` is the credential slot for the SMS provider adapter; the provider call belongs in `server/services/notificationService.js` (`sendSms`). Until that adapter is implemented, an API key without mock mode is accurately logged as failed rather than as sent.

Install the backend notification dependencies from the `server` folder:

```bash
npm install nodemailer node-cron
```

Send a test notification to the authenticated user's enabled channels:

```http
GET /api/notifications/test
Authorization: Bearer <JWT>
```

The endpoint returns immediately; inspect the server console in mock mode and the `notifications` collection for the per-channel delivery log.
For an authenticated API view limited to the current user's delivery records, use `GET /api/notifications/logs`.

The notification triggers are in the application controller (worker applies; employer accepts/rejects), complaint controller (complaint creation/admin status update), job controller (new skill-and-city matches), and `server/services/reminderScheduler.js` (accepted workers and their employer for jobs scheduled tomorrow). The scheduler runs at 6 PM in the server's local timezone.

## Installation & Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd KaamSetu
```

### 2. Install Backend Dependencies
```bash
cd server
npm install
```

### 3. Install Frontend Dependencies
```bash
cd ../client
npm install
```

### 4. Start MongoDB
```bash
mongod
```

### 5. Start Backend
```bash
cd server
npm start
# Or for development with auto-reload:
npm run dev
```

### 6. Start Frontend
```bash
cd client
npm start
```

### 7. Seed Sample Data (Optional)
```bash
cd server
node utils/seed.js
```

## Creating an Admin Account

Admin accounts cannot be created through public registration. Use one of these methods:

### Method 1: Use Seed Script
```bash
cd server
node utils/seed.js
# Admin: admin@kaamsetu.com / admin123
```

### Method 2: Direct MongoDB
```javascript
// In MongoDB shell
use kaamsetu
db.users.insertOne({
  name: "Admin",
  email: "admin@kaamsetu.com",
  phone: "9999999999",
  password: "$2a$10$hashedPasswordHere",
  role: "admin",
  isActive: true
})
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register a new user |
| POST | /api/auth/login | Login |
| POST | /api/auth/logout | Logout |
| GET | /api/auth/me | Get current user |

### Worker Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/workers/profile | Create/update profile |
| GET | /api/workers/profile | Get own profile |
| GET | /api/workers/search | Search workers |

### Employer Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/employers/profile | Create/update profile |
| GET | /api/employers/profile | Get own profile |

### Jobs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/jobs | Get all open jobs |
| POST | /api/jobs | Create a job (employer) |
| GET | /api/jobs/:id | Get job details |
| PUT | /api/jobs/:id | Update job (owner) |
| DELETE | /api/jobs/:id | Delete job (owner) |

### Applications
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/applications | Apply for a job |
| GET | /api/applications/worker | Worker's applications |
| GET | /api/applications/employer | Employer's applications |
| PUT | /api/applications/:id/accept | Accept application |
| PUT | /api/applications/:id/reject | Reject application |
| PUT | /api/applications/:id/complete | Mark completed |
| PUT | /api/applications/:id/cancel | Cancel application |

### Recommendations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/recommendations/jobs | Job recommendations for worker |
| GET | /api/recommendations/workers/:jobId | Worker recommendations for job |

### Location
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/location/nearby-jobs | Find jobs near coordinates |
| PUT | /api/location/update | Update worker location |

### Verification
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/verifications/status | Get verification status |
| POST | /api/verifications/request | Request verification |

### Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/reviews | Create a review |
| GET | /api/reviews/user/:userId | Get user's reviews |
| GET | /api/reviews/my-reviews | Get my reviews |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/notifications | Get notifications |
| GET | /api/notifications/test | Send test email/SMS to current user |
| GET | /api/notifications/logs | Get current user's email/SMS delivery logs |
| PUT | /api/notifications/:id/read | Mark as read |
| PUT | /api/notifications/read-all | Mark all as read |

### Complaints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/complaints | File a complaint |
| GET | /api/complaints/my | Get my complaints |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/stats | Dashboard statistics |
| GET | /api/admin/users | Get all users |
| PUT | /api/admin/users/:id/toggle-active | Block/unblock user |

### System
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | / | Welcome message |
| GET | /api/test | Backend test |
| GET | /api/health | Health check |

## User Roles

| Role | Can Do |
|------|--------|
| Worker | Create profile, search jobs, apply, give ratings |
| Employer | Post jobs, view applications, accept/reject, rate workers |
| Admin | Manage users, jobs, verification, complaints |

## Verification System

| Level | Description |
|-------|-------------|
| Level 1 | Phone/Email Verification |
| Level 2 | Profile Verification (admin review) |
| Level 3 | Skill Verification (completed jobs) |
| Level 4 | Trusted Worker/Employer status |

## Recommendation Algorithm

Match score is calculated using weighted factors:
- Skill Match: 35%
- Distance: 20%
- Experience: 15%
- Wage Compatibility: 15%
- Availability: 10%
- Rating: 5%

## Testing the Application

### Backend API Testing
1. Start MongoDB and backend server
2. Open browser and visit `http://localhost:5000/api/test`
3. Visit `http://localhost:5000/api/health` to check database connection

### Frontend Testing
1. Open `http://localhost:3000`
2. Register as worker or employer
3. Login and test role-specific features

### Complete Flow Testing
1. Register as employer, create profile, post a job
2. Register as worker, create profile, find and apply for jobs
3. Employer reviews and accepts application
4. Employer marks job as completed
5. Both parties rate each other

## Known Limitations

- Location coordinates are approximate (using city-level coordinates)
- No real-time notifications (uses polling)
- No file upload for profile photos
- No email/SMS notifications
- No payment integration
- Seed data uses default Delhi coordinates

## Future Scope

- Machine learning based job recommendation
- Real-time notifications with Socket.IO
- Payment integration
- Document verification
- Multilingual support
- Push notifications
- Geographic heat maps for job demand
- Worker skill certification
- Advanced analytics dashboard

## Project Information

- **Project Name:** KaamSetu
- **Type:** MCA Academic Project (3rd Semester)
- **Status:** Complete
- **License:** Educational purposes only
