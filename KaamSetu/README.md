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
- Mobile responsive design

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
```

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
