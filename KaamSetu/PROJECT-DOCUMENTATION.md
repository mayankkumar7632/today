# KaamSetu - Project Documentation

> Deprecated: Please use README.md as the main project overview. This file is kept only for reference and is no longer the active source of project information.

## 1. Title
KaamSetu: A Web Platform for Connecting Daily-Wage Workers with Employers

## 2. Abstract
KaamSetu is a web-based platform designed to bridge the gap between daily-wage workers and employers. The platform enables workers to find suitable nearby jobs based on their skills and location, while employers can post jobs and discover verified workers. The system uses smart recommendation algorithms, location-based matching, a multi-level verification system, and two-way ratings to build trust and efficiency in the daily-wage employment market.

## 3. Introduction
Every day, millions of daily-wage workers across India wait at designated spots hoping to find employment. This process is uncertain, inefficient, and often exploitative. KaamSetu aims to digitize and streamline this process by providing a platform where workers can create profiles showcasing their skills, and employers can post jobs that match these skills.

The platform uses modern web technologies including React.js for the frontend, Node.js and Express.js for the backend, and MongoDB for the database. Key features include geolocation-based job matching, a weighted recommendation system, multi-level user verification, and a two-way rating system.

## 4. Problem Statement
Daily-wage workers face the following challenges:
- Uncertainty about finding work each day
- No reliable way to showcase their skills to potential employers
- Dependency on middlemen who take commissions
- No mechanism to build a reputation or trust

Employers face:
- Difficulty finding reliable and skilled workers quickly
- No way to verify worker skills and reliability
- Time-consuming process of finding workers through traditional channels

## 5. Objectives
- Create a digital platform connecting daily-wage workers with employers
- Enable location-based job search and matching
- Implement a smart recommendation system based on skills, distance, and wages
- Establish a multi-level verification system for trust
- Provide two-way rating system for accountability
- Build a mobile-responsive, easy-to-use interface
- Create a scalable architecture suitable for future enhancement

## 6. Existing System
Currently, daily-wage workers find jobs through:
- Physical gathering at specific locations (labour chowks)
- Word of mouth referrals
- Local contractors/middlemen
- Informal social media groups

Problems with existing system:
- No guaranteed work
- Exploitation by middlemen
- No skill-based matching
- No reputation system
- Geographic limitations
- No record of work history

## 7. Proposed System
KaamSetu proposes a web-based solution with:
- User registration with role system (Worker, Employer, Admin)
- Skill-based worker profiles
- Job posting with skill requirements
- Location-based job search using MongoDB geospatial queries
- Smart recommendation engine with weighted scoring
- Multi-level verification system
- Two-way ratings and reviews
- Notification system
- Admin dashboard for oversight

## 8. Scope
### In Scope
- User registration and authentication
- Worker and employer profiles
- Job posting and search
- Job application management
- Location-based matching
- Recommendation engine
- Verification system
- Rating and review system
- Notification system
- Admin dashboard
- Complaint management

### Out of Scope (Future Enhancements)
- Payment integration
- Real-time chat
- Mobile app (native)
- Machine learning recommendations
- Document verification
- Multilingual support

## 9. User Roles

### Worker
- Register and create profile with skills
- Search and apply for jobs
- Receive job recommendations
- View application status
- Give ratings to employers
- Request verification

### Employer
- Register and create business profile
- Post jobs with requirements
- View and manage applications
- Get worker recommendations
- Rate workers after job completion

### Admin
- View system dashboard and statistics
- Manage users (block/unblock)
- Review verification requests
- Manage complaints
- Oversee all platform activity

## 10. Functional Requirements

### Authentication
- User registration with role selection
- Login with email and password
- JWT-based session management
- Role-based access control

### Worker Module
- Create and edit profile (skills, experience, wage, location)
- Search jobs by skill and location
- Apply for jobs
- View application status
- View and give reviews

### Employer Module
- Create and edit business profile
- Post, edit, delete jobs
- View applications
- Accept/reject applications
- Mark jobs as completed
- View worker recommendations

### Admin Module
- View dashboard statistics
- Manage users
- Review verifications
- Handle complaints

## 11. Non-Functional Requirements
- Mobile responsive design
- Secure authentication with bcrypt and JWT
- Environment variables for sensitive data
- Proper error handling
- Clean and modular code structure
- Beginner-friendly and well-commented code

## 12. Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js 18, React Router v6, HTML5, CSS3 |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose ODM |
| Authentication | JWT, bcryptjs |
| Location | GeoJSON, MongoDB 2dsphere |

## 13. System Architecture
```
[React Frontend] --HTTP--> [Express Backend] --Mongoose--> [MongoDB]
                                    |
                         [JWT Auth Middleware]
                         [Role-Based Authorization]
```

The application follows a three-tier architecture:
1. **Presentation Layer** (React.js) - User interface
2. **Business Logic Layer** (Node.js/Express) - API and processing
3. **Data Layer** (MongoDB) - Data storage

## 14. Module Description

### Authentication Module
Handles user registration, login, logout, and JWT token management.

### Profile Module
Manages worker and employer profiles including skills, experience, and location.

### Job Module
Handles job creation, listing, searching, updating, and deletion.

### Application Module
Manages the job application workflow: apply, accept, reject, complete, cancel.

### Recommendation Module
Calculates match scores using weighted factors for smart recommendations.

### Location Module
Provides geospatial queries for finding nearby jobs.

### Verification Module
Manages multi-level verification workflow.

### Review Module
Handles two-way ratings and reviews between workers and employers.

### Notification Module
Manages in-app notifications for platform events.

### Complaint Module
Handles user complaints and reports.

### Admin Module
Provides dashboard and management tools for administrators.

## 15. Database Design

### User Collection
- name, email (unique), phone, password (hashed), role, profilePhoto, location (GeoJSON), isActive, emailVerified, phoneVerified

### WorkerProfile Collection
- user (ref), skills[], experience, yearsOfExperience, expectedWage, availability, location (GeoJSON), bio, averageRating, completedJobs

### EmployerProfile Collection
- user (ref), businessName, ownerName, businessType, phone, location (GeoJSON), description, averageRating, totalJobsPosted

### Job Collection
- employer (ref), title, description, requiredSkills[], requiredExperience, dailyWage, location (GeoJSON), jobDate, workingHours, workersRequired, status

### Application Collection
- job (ref), worker (ref), employer (ref), status, message, completedAt

### Verification Collection
- user (ref), emailVerified, phoneVerified, profileVerified, skillVerified, trustedStatus, status, verificationHistory[]

### Review Collection
- job (ref), reviewee (ref), reviewer (ref), reviewType, ratings{overall, skill, punctuality, workQuality, payment, behaviour}, comment

### Notification Collection
- user (ref), type, title, message, isRead

### Complaint Collection
- reportedBy (ref), reportedUser (ref), job (ref), reason, description, status, adminNotes

## 16. API Design
RESTful API with consistent response format:
```json
{
  "success": true/false,
  "message": "Description",
  "data": {}
}
```

Protected routes use JWT in Authorization header:
```
Authorization: Bearer <token>
```

## 17. Location Matching
- Uses MongoDB 2dsphere index for geospatial queries
- GeoJSON Point format: { type: "Point", coordinates: [longitude, latitude] }
- $nearSphere query finds documents within specified radius
- Haversine formula calculates exact distance between points

## 18. Recommendation Algorithm
Weighted scoring system (0-100):
- Skill Match (35%): Percentage of matching skills
- Distance (20%): Closer = higher score
- Experience (15%): Meets required experience
- Wage Compatibility (15%): Expected vs offered wage
- Availability (10%): Schedule compatibility
- Rating (5%): Worker's average rating

## 19. Verification System
Four-level verification:
1. Phone/Email Verification
2. Profile Verification (admin review)
3. Skill Verification (based on completed jobs)
4. Trusted Worker/Employer status

## 20. Rating System
Two-way ratings after completed jobs:
- Worker ratings: Payment, Behaviour, Work Quality, Overall (1-5)
- Employer ratings: Skill, Punctuality, Behaviour, Overall (1-5)
- Prevents duplicate reviews per job
- Updates average rating in profiles

## 21. Admin Module
- Dashboard with statistics (users, jobs, applications, verification, complaints)
- User management (view, block, unblock)
- Job oversight
- Verification review
- Complaint management

## 22. Security
- bcrypt password hashing (salt rounds: 10)
- JWT tokens with 7-day expiry
- Role-based authorization middleware
- Environment variables for secrets
- No password exposure in API responses
- Input validation on all endpoints

## 23. Testing
Manual testing approach:
1. User registration (worker, employer)
2. Login and logout
3. Profile creation and editing
4. Job posting and searching
5. Application workflow
6. Recommendation accuracy
7. Verification process
8. Rating and review
9. Admin functions
10. Mobile responsiveness

## 24. Limitations
- No real-time notifications (uses polling)
- Location data is approximate
- No file upload for photos/documents
- No email/SMS notifications
- No payment processing
- No machine learning recommendations
- Single-server deployment

## 25. Future Scope
- Socket.IO for real-time notifications
- Payment integration (Razorpay/UPI)
- Document verification
- Machine learning job matching
- Multilingual support (Hindi, regional languages)
- Push notifications
- Geographic heat maps
- Worker skill certification
- Advanced analytics
- Mobile app (React Native)

## 26. Conclusion
KaamSetu provides a comprehensive solution to the daily-wage employment problem. By leveraging modern web technologies, the platform connects workers with employers efficiently, builds trust through verification and ratings, and uses smart recommendations to match the right people with the right jobs. The modular architecture ensures the system can be enhanced with future features while maintaining simplicity and reliability.
