# KaamSetu - Phase 1: Project Setup

I am an MCA 3rd semester student.

I want to build a web application called "KaamSetu".

## Project Idea

KaamSetu is a platform that connects daily-wage workers with employers.

Many daily-wage workers wait every morning to find work, but sometimes they do not get a job. KaamSetu will help them find suitable nearby jobs.

Employers will also be able to find suitable workers for their requirements.

## Main Users

There will be three types of users:

1. Worker
2. Employer
3. Admin

## Technology Stack

Frontend:
- React.js
- JavaScript
- HTML5
- CSS3

Backend:
- Node.js
- Express.js

Database:
- MongoDB
- Mongoose

Later features:
- JWT authentication
- bcrypt
- Geolocation API
- MongoDB geospatial queries
- Leaflet/OpenStreetMap
- Smart recommendation system
- Verification system
- Rating and review system
- Notifications
- Admin dashboard

## Important Requirement

This is an MCA academic project.

Keep the code:
- Simple
- Clean
- Modular
- Beginner-friendly
- Well commented
- Easy to understand
- Easy to explain during viva

Do not over-engineer the project.

Do not use unnecessary libraries.

## Phase 1 Task

For this phase ONLY, create the basic project structure.

Create:

KaamSetu/
│
├── client/
│
├── server/
│
├── prompts/
│
├── README.md
│
└── .gitignore

The client folder will contain the React frontend.

The server folder will contain the Node.js and Express backend.

## Frontend Setup

Inside client:

- Create a React application.
- Create a basic home page.
- Display "Welcome to KaamSetu".
- Use a clean and simple responsive design.

## Backend Setup

Inside server:

- Initialize Node.js.
- Install Express.
- Create server.js.
- Create a basic Express server.
- Use JSON middleware.
- Add a simple test route:

GET /api/test

It should return:

{
  "message": "KaamSetu backend is working"
}

## Database

Do NOT implement the database yet.

Do NOT create authentication yet.

Do NOT create jobs yet.

Do NOT create profiles yet.

Do NOT create recommendation features yet.

## Folder Structure

Prepare the backend so it can later contain:

server/
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── services/
├── utils/
└── server.js

Do not create complicated code in these folders yet.

## Environment

Create an appropriate .gitignore.

Do not put passwords, API keys or database credentials directly into source code.

We will create the .env file in the next phase.

## Documentation

Create a basic README.md containing:

- Project name
- Project description
- Technology stack
- Current development phase
- How to start the frontend
- How to start the backend

## Very Important

Do NOT implement any feature beyond Phase 1.

Do NOT implement:
- Login
- Registration
- MongoDB
- Job posting
- Job applications
- Location matching
- Recommendation
- Verification
- Ratings
- Notifications
- Admin dashboard

Only complete the basic project setup.

After completing the work, explain:

1. What files you created
2. What each folder is for
3. How to start the React frontend
4. How to start the Node.js backend
5. How to test /api/test
6. What we will build in Phase 2

Wait for my instruction before moving to Phase 2.

# KaamSetu - Phase 2: MongoDB Database Connection

We have completed Phase 1 of the KaamSetu project.

Now implement ONLY Phase 2.

Do not implement authentication, registration, profiles, jobs, recommendations, verification, ratings, notifications, or admin features yet.

The only goal of this phase is to connect the Node.js + Express backend to MongoDB using Mongoose.

==================================================
PROJECT
==================================================

Project name: KaamSetu

KaamSetu is a platform that connects daily-wage workers with employers.

Technology stack:

Frontend:
- React.js
- JavaScript
- HTML5
- CSS3

Backend:
- Node.js
- Express.js

Database:
- MongoDB
- Mongoose

==================================================
1. INSTALL MONGOOSE
==================================================

Inside the server folder, install Mongoose if it is not already installed.

Do not install unnecessary packages.

Use the existing backend setup from Phase 1.

==================================================
2. CREATE ENVIRONMENT FILE
==================================================

Create:

server/.env

Use:

PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/kaamsetu

Do NOT hard-code the MongoDB connection string inside server.js.

Make sure .env is included in .gitignore.

Never expose passwords, API keys, or database credentials.

==================================================
3. CREATE DATABASE CONNECTION
==================================================

Create:

server/config/db.js

Use Mongoose.

Create a reusable function called connectDB.

It should:

1. Connect to MongoDB.
2. Display a clear success message when MongoDB connects.
3. Display a clear error message when connection fails.
4. Handle connection errors properly.

Success message can be:

MongoDB connected successfully

==================================================
4. UPDATE SERVER.JS
==================================================

Update the existing server.js.

It should:

1. Load environment variables.
2. Connect to MongoDB.
3. Start the Express server after a successful database connection.
4. Handle startup errors properly.

Do not remove the existing Phase 1 functionality.

Keep the existing:

GET /api/test

route.

It should still return:

{
  "message": "KaamSetu backend is working"
}

==================================================
5. CREATE DATABASE HEALTH CHECK
==================================================

Create:

GET /api/health

The response should contain information similar to:

{
  "status": "OK",
  "database": "connected"
}

The database status should represent the actual MongoDB connection status.

If MongoDB is disconnected, return an appropriate status.

==================================================
6. PROJECT STRUCTURE
==================================================

The backend should now have a structure similar to:

server/
│
├── config/
│   └── db.js
│
├── controllers/
│
├── middleware/
│
├── models/
│
├── routes/
│
├── services/
│
├── utils/
│
├── .env
├── .gitignore
├── server.js
└── package.json

Do not create unnecessary files.

==================================================
7. DO NOT CREATE DATABASE MODELS YET
==================================================

Do NOT create:

User model
Worker model
Employer model
Job model
Application model
Review model
Notification model
Verification model

Those will be created in later phases.

==================================================
8. ERROR HANDLING
==================================================

Handle:

- MongoDB connection failure
- Invalid MongoDB URI
- Server startup errors

Use simple and understandable error messages.

Do not hide important errors.

==================================================
9. README UPDATE
==================================================

Update README.md with a section called:

MongoDB Setup

Explain:

1. MongoDB is required.
2. MongoDB must be running before starting the backend.
3. The database name is kaamsetu.
4. The MongoDB connection is stored in .env.
5. How to start the backend.
6. How to test the database connection.

Do not expose secrets in README.md.

==================================================
10. TESTING
==================================================

After implementation, explain exactly how I should test Phase 2.

I should be able to:

1. Start MongoDB.
2. Start the backend.
3. See a successful MongoDB connection message.
4. Open:

http://localhost:5000/api/test

5. Open:

http://localhost:5000/api/health

The test endpoint should work.

The health endpoint should show that MongoDB is connected.

==================================================
11. IMPORTANT FOR MY MCA PROJECT
==================================================

Keep the implementation beginner-friendly.

I need to understand this code for my MCA project and viva.

After completing the implementation, explain in simple language:

1. What is MongoDB?
2. What is Mongoose?
3. Why are we using MongoDB?
4. What is server/.env?
5. Why should we not put the MongoDB connection string directly in server.js?
6. What does config/db.js do?
7. How does Node.js connect to MongoDB?
8. What happens when server.js starts?
9. What is the purpose of /api/test?
10. What is the purpose of /api/health?

Also explain the complete flow:

Node.js
   ↓
Mongoose
   ↓
MongoDB
   ↓
kaamsetu database

==================================================
IMPORTANT
==================================================

ONLY complete Phase 2.

Do NOT implement:

- Registration
- Login
- JWT
- bcrypt
- User authentication
- Worker profile
- Employer profile
- Job posting
- Job application
- Location matching
- Smart recommendation
- Verification
- Ratings and reviews
- Notifications
- Admin dashboard

After completing Phase 2, stop and wait for my next instruction.
# KaamSetu - Phase 3: User Model and Role System

Phase 1 and Phase 2 are completed.

Now implement ONLY Phase 3.

The purpose of this phase is to create the User model and establish the three user roles of KaamSetu:

1. Worker
2. Employer
3. Admin

Do NOT implement registration or login yet.

==================================================
PROJECT
==================================================

Project name: KaamSetu

KaamSetu connects daily-wage workers with employers.

Technology:

Frontend:
- React.js
- JavaScript
- HTML5
- CSS3

Backend:
- Node.js
- Express.js

Database:
- MongoDB
- Mongoose

==================================================
1. CREATE USER MODEL
==================================================

Create:

server/models/User.js

Use Mongoose.

The User model should contain the following fields:

name
email
phone
password
role
profilePhoto
location
isActive
emailVerified
phoneVerified
createdAt
updatedAt

==================================================
2. FIELD REQUIREMENTS
==================================================

name:

- String
- Required
- Trim whitespace
- Minimum reasonable length

email:

- String
- Required
- Unique
- Lowercase
- Trim whitespace

phone:

- String
- Required
- Trim whitespace

password:

- String
- Required

IMPORTANT:

Do NOT hash the password yet.

Password hashing with bcrypt will be implemented in the authentication phase.

role:

Allowed values:

worker
employer
admin

Default role:

worker

profilePhoto:

- String
- Optional

location:

Prepare this field for future location-based matching.

Use GeoJSON Point structure:

{
    type: "Point",
    coordinates: [longitude, latitude]
}

The field should be optional for now.

isActive:

- Boolean
- Default true

emailVerified:

- Boolean
- Default false

phoneVerified:

- Boolean
- Default false

createdAt:

- Date

updatedAt:

- Date

Use Mongoose timestamps if appropriate.

==================================================
3. LOCATION INDEX
==================================================

Prepare the location field for future location-based job matching.

Create a 2dsphere index on the location field.

Do NOT implement location searching yet.

Location matching will be implemented in a later phase.

==================================================
4. ROLE SYSTEM
==================================================

The application has three roles:

WORKER

A worker can eventually:

- Create a worker profile
- Search for jobs
- Apply for jobs
- Receive job recommendations
- Receive employer recommendations
- Complete jobs
- Receive ratings
- Give ratings
- Complete verification

EMPLOYER

An employer can eventually:

- Create an employer profile
- Post jobs
- View applications
- Find suitable workers
- Receive worker recommendations
- Accept workers
- Complete jobs
- Rate workers

ADMIN

An admin can eventually:

- Manage users
- Manage jobs
- Manage verification
- Manage reports
- Manage reviews
- Block/unblock users
- View system statistics

Do NOT implement these features yet.

Only create the role system.

==================================================
5. DATABASE VALIDATION
==================================================

Add proper Mongoose validation.

For example:

- Required fields
- Unique email
- Valid role
- Proper data types

Use clear validation messages where appropriate.

==================================================
6. USER CONTROLLER
==================================================

Create:

server/controllers/userController.js

For this phase, create only a basic function to test that the User model works.

For example:

getUserModelTest

It should return a simple response confirming that the User model is available.

Do NOT create registration or login controllers.

==================================================
7. USER ROUTE
==================================================

Create:

server/routes/userRoutes.js

Add a simple test route:

GET /api/users/test

Response:

{
    "message": "User model is working"
}

This is only for testing.

Do NOT create:

POST /register
POST /login

Those will be created later.

==================================================
8. CONNECT ROUTES TO SERVER
==================================================

Connect userRoutes to server.js.

The route should be:

/api/users

Therefore:

GET /api/users/test

should work.

Do not break:

GET /api/test

or:

GET /api/health

from previous phases.

==================================================
9. DO NOT CREATE USERS YET
==================================================

Do NOT insert any users into MongoDB automatically.

Do NOT create sample users unless I specifically ask for them.

We will create users through the registration system in the next phase.

==================================================
10. SECURITY
==================================================

Do not:

- Store passwords in plain text in sample data
- Add hard-coded passwords
- Add API keys
- Add database credentials
- Expose .env

Do not implement authentication yet.

==================================================
11. PROJECT STRUCTURE
==================================================

The backend should now look approximately like:

server/
│
├── config/
│   └── db.js
│
├── controllers/
│   └── userController.js
│
├── middleware/
│
├── models/
│   └── User.js
│
├── routes/
│   └── userRoutes.js
│
├── services/
│
├── utils/
│
├── .env
├── server.js
└── package.json

Keep the existing Phase 1 and Phase 2 files.

==================================================
12. TESTING
==================================================

After implementation, explain exactly how to test.

Start the backend.

Then open:

http://localhost:5000/api/test

It must still work.

Open:

http://localhost:5000/api/health

It must still work.

Open:

http://localhost:5000/api/users/test

It should return:

{
    "message": "User model is working"
}

Also verify that the server starts without errors.

==================================================
13. EXPLANATION FOR MCA VIVA
==================================================

After completing the implementation, explain in simple language:

1. What is a MongoDB model?
2. What is a Mongoose schema?
3. What is the User model?
4. Why do we need a User model?
5. Why do we need different roles?
6. What is the difference between Worker, Employer and Admin?
7. What is GeoJSON?
8. Why are coordinates stored as [longitude, latitude]?
9. What is a 2dsphere index?
10. Why will we need it later?
11. Why are we not implementing authentication yet?

Explain the data flow:

User Model
     ↓
Mongoose Schema
     ↓
MongoDB
     ↓
kaamsetu database

==================================================
IMPORTANT
==================================================

ONLY implement Phase 3.

Do NOT implement:

- Registration
- Login
- JWT
- bcrypt
- Authentication
- Worker profile
- Employer profile
- Job posting
- Job applications
- Location matching
- Smart recommendations
- Verification
- Ratings
- Notifications
- Admin dashboard

After completing Phase 3, stop and wait for my next instruction.
The endpoint /api/users/test returns:
{"error":"Route not found","message":"The requested endpoint does not exist"}

Diagnose the Phase 3 implementation.

Check:
1. server/routes/userRoutes.js
2. server/controllers/userController.js
3. server.js
4. Whether userRoutes is imported correctly
5. Whether userRoutes is mounted correctly at /api/users
6. Whether GET /api/users/test is defined correctly

Fix the problem without changing or breaking the existing /api/test and /api/health endpoints.

Do not implement registration, login, JWT, bcrypt, or any Phase 4 features.

After fixing it, explain exactly what was wrong and what you changed.

# KAAMSETU - COMPLETE MCA PROJECT

You are working on an MCA 3rd semester project called "KaamSetu".

KaamSetu is a web platform that connects daily-wage workers with employers.

The main problem is that many daily-wage workers wait every morning to find work, but sometimes they do not get a suitable job. Employers also have difficulty finding reliable workers quickly.

KaamSetu should help workers find suitable nearby jobs and help employers find suitable workers.

==================================================
IMPORTANT DEVELOPMENT RULES
==================================================

This is an academic MCA project.

The code must be:

- Clean
- Modular
- Beginner-friendly
- Easy to understand
- Easy to explain in viva
- Properly commented where necessary
- Mobile responsive
- Secure for a student-level project

Do NOT unnecessarily over-engineer the application.

Use simple solutions wherever possible.

Do not replace working code unnecessarily.

Before modifying an existing file, inspect the existing implementation.

Preserve all working functionality from previous phases.

If something is already implemented correctly, reuse it.

If something is broken, fix it before continuing.

Do not create duplicate models, routes, controllers or components.

==================================================
TECHNOLOGY STACK
==================================================

Frontend:

- React.js
- JavaScript
- HTML5
- CSS3
- React Router

Backend:

- Node.js
- Express.js

Database:

- MongoDB
- Mongoose

Authentication:

- JWT
- bcrypt

Location:

- Browser Geolocation API
- GeoJSON
- MongoDB 2dsphere queries
- Leaflet
- OpenStreetMap

Charts:

- Recharts or Chart.js

Optional real-time functionality:

- Socket.IO

Do not add unnecessary technologies.

==================================================
CURRENT PROJECT STRUCTURE
==================================================

The project already has:

KaamSetu/
│
├── client/
├── server/
├── prompts/
├── README.md
└── .gitignore

Backend should follow a modular structure:

server/
│
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── services/
├── utils/
├── .env
└── server.js

Frontend should be organized into:

client/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── layouts/
│   ├── services/
│   ├── context/
│   ├── hooks/
│   ├── utils/
│   ├── App.jsx
│   └── main.jsx
│
└── package.json

Adapt the structure if the existing project already uses a slightly different organization.

==================================================
USER ROLES
==================================================

There are three main roles:

1. WORKER
2. EMPLOYER
3. ADMIN

==================================================
WORKER FUNCTIONALITY
==================================================

Workers should be able to:

- Register
- Login
- Logout
- Create profile
- Edit profile
- Add skills
- Add experience
- Add expected daily wage
- Add availability
- Add location
- Search jobs
- View nearby jobs
- Apply for jobs
- View applications
- Cancel pending application where appropriate
- Receive job recommendations
- View employer information
- View job details
- Complete accepted jobs
- Give employer ratings
- Receive employer ratings
- View their own ratings
- Request verification
- View verification status
- Receive notifications

==================================================
EMPLOYER FUNCTIONALITY
==================================================

Employers should be able to:

- Register
- Login
- Logout
- Create employer profile
- Edit employer profile
- Post jobs
- Edit own jobs
- Delete own jobs
- View applications
- Accept applications
- Reject applications
- View suitable workers
- Receive worker recommendations
- View worker profiles
- View worker verification status
- Complete jobs
- Rate workers
- Review workers
- Receive worker ratings
- Receive notifications

==================================================
ADMIN FUNCTIONALITY
==================================================

Admin should be able to:

- Login
- View dashboard
- View total users
- View workers
- View employers
- View jobs
- View applications
- View verification requests
- Approve verification
- Reject verification
- Block users
- Unblock users
- Manage inappropriate reviews
- View complaints
- View system statistics

Admin must have protected access.

Workers and employers must NOT be able to access admin APIs.

==================================================
PHASE 4 - AUTHENTICATION
==================================================

Implement:

Registration
Login
Logout
JWT authentication
bcrypt password hashing
Authentication middleware
Role-based authorization

Registration fields:

name
email
phone
password
role

Only these roles may be selected during normal registration:

worker
employer

Admin accounts must NOT be created through public registration.

Create admin through a secure seed/setup method.

Password requirements:

- Never store plain-text passwords.
- Hash passwords using bcrypt.
- Never return password hashes in API responses.

JWT should contain:

user ID
role

Create protected API middleware.

==================================================
PHASE 5 - WORKER PROFILE
==================================================

Create WorkerProfile model.

Fields:

userId
profilePhoto
skills
experience
expectedWage
availability
location
bio

Skills can be an array.

Location should use GeoJSON:

{
  type: "Point",
  coordinates: [longitude, latitude]
}

Create:

POST /api/workers/profile

GET /api/workers/profile

PUT /api/workers/profile

Worker can only edit their own profile.

==================================================
PHASE 6 - EMPLOYER PROFILE
==================================================

Create EmployerProfile model.

Fields:

userId
businessName
ownerName
businessType
phone
location
description
profileImage

Create APIs for:

Create profile
Get profile
Update profile

Employer can only edit their own profile.

==================================================
PHASE 7 - JOB MANAGEMENT
==================================================

Create Job model.

Fields:

employerId
title
description
requiredSkills
requiredExperience
dailyWage
location
jobDate
workingHours
workersRequired
status
createdAt
updatedAt

Job status:

open
closed
in-progress
completed
cancelled

Employers can:

Create
Read
Update
Delete

their own jobs.

Workers can view open jobs.

Workers must not be able to create, edit or delete jobs.

==================================================
PHASE 8 - APPLICATION SYSTEM
==================================================

Create Application model.

Fields:

jobId
workerId
employerId
status
appliedAt
updatedAt

Status:

pending
accepted
rejected
completed
cancelled

Workflow:

Worker
↓
Views job
↓
Applies
↓
Pending
↓
Employer reviews
↓
Accept / Reject
↓
If accepted
↓
Work completed
↓
Application becomes completed

Prevent duplicate applications for the same worker and job.

Only the appropriate worker/employer can modify an application.

==================================================
PHASE 9 - LOCATION BASED JOB MATCHING
==================================================

Implement location-based matching.

Use:

Browser Geolocation API
GeoJSON
MongoDB 2dsphere index
Leaflet
OpenStreetMap

Workers can allow browser location access.

Store:

latitude
longitude

using GeoJSON coordinates.

Jobs also contain coordinates.

Create an API to find jobs within a specified radius.

Default radius:

10 km

Allow worker to select:

5 km
10 km
20 km
50 km

Display:

Job title
Daily wage
Location
Distance
Required skills

Example:

Construction Helper
₹700/day
3.2 km away

Use MongoDB geospatial queries.

Do NOT continuously track users.

Only use location when required for matching.

==================================================
PHASE 10 - SMART JOB RECOMMENDATION
==================================================

Do NOT use machine learning initially.

Implement a transparent rule-based recommendation system.

Calculate a match score from 0 to 100.

Suggested weights:

Skill Match = 35%
Distance = 20%
Experience = 15%
Wage Compatibility = 15%
Availability = 10%
Rating = 5%

The system should compare:

Worker skills
Job required skills
Worker experience
Job required experience
Worker location
Job location
Worker expected wage
Job wage
Worker availability
Worker rating

Display:

Match Score: 92%

Also display simple reasons:

✓ Skills match
✓ Nearby
✓ Experience matches
✓ Wage compatible

Sort recommendations by highest score.

Create a reusable recommendation service.

==================================================
PHASE 11 - EMPLOYER TO WORKER RECOMMENDATION
==================================================

When an employer opens a job, recommend suitable workers.

Use:

Skill
Experience
Distance
Availability
Expected wage
Rating
Verification status
Completed jobs

Calculate a score from 0 to 100.

Display:

Worker name
Skills
Experience
Rating
Verification badges
Distance
Match score

Example:

Ramesh Kumar
Match: 94%

Do not expose private information.

==================================================
PHASE 12 - VERIFICATION SYSTEM
==================================================

Implement a multi-level verification system.

Do NOT make verification only an admin checkbox.

Use these levels:

LEVEL 1:
Phone / Email Verification

LEVEL 2:
Profile Verification

LEVEL 3:
Skill and Work Verification

LEVEL 4:
Trusted Worker / Trusted Employer

Create Verification model.

Fields:

userId
emailVerified
phoneVerified
profileVerified
skillVerified
trustedStatus
verificationStatus
verificationHistory
verifiedAt
reviewedBy

Verification status:

pending
under_review
verified
rejected

For workers:

Completed jobs confirmed by employers should contribute to work verification.

For employers:

Completed jobs and positive worker feedback can contribute to trust status.

Admins can review verification requests.

Display badges:

✓ Phone Verified
✓ Profile Verified
✓ Skill Verified
🏆 Trusted Worker

Keep verification separate from ratings.

Do not implement fake government-ID verification.

If document upload is implemented later, store only secure references and never expose sensitive documents publicly.

==================================================
PHASE 13 - TWO WAY RATING AND REVIEW
==================================================

Implement two-way reviews.

After a job is completed:

Worker can rate Employer.

Employer can rate Worker.

Rating:

1 to 5

Worker rating categories:

Payment
Behaviour
Job Accuracy
Overall

Employer rating categories:

Skill
Punctuality
Behaviour
Work Quality
Overall

Allow written review.

Prevent duplicate reviews for the same completed job.

Calculate average rating.

Display:

Average rating
Number of reviews
Recent reviews

Users should only be able to review people involved in their completed job.

==================================================
PHASE 14 - NOTIFICATION SYSTEM
==================================================

Create Notification model.

Fields:

userId
type
title
message
isRead
createdAt

Create notifications for:

New application
Application accepted
Application rejected
Job invitation
Job completed
New review
Verification approved
Verification rejected

Implement:

Get notifications
Mark notification as read
Mark all as read

Display unread count.

Use MongoDB notifications initially.

Socket.IO may be added only if it can be implemented cleanly.

==================================================
PHASE 15 - ADMIN DASHBOARD
==================================================

Create responsive admin dashboard.

Show:

Total workers
Total employers
Total jobs
Active jobs
Completed jobs
Pending applications
Pending verification
Total reviews
Complaints

Use charts for:

Users
Jobs
Applications
Completed jobs

Admin can:

Manage users
Block/unblock users
Manage jobs
Review verification
Approve/reject verification
Manage inappropriate reviews
View complaints

Use protected admin routes.

==================================================
PHASE 16 - COMPLAINT / REPORT SYSTEM
==================================================

Add a basic complaint system.

Users can report:

Worker
Employer
Job
Review

Complaint fields:

reportedBy
reportedUser
jobId
reason
description
status
createdAt

Status:

pending
reviewed
resolved
dismissed

Admin can review complaints.

==================================================
PHASE 17 - FRONTEND DESIGN
==================================================

Create a professional but simple UI.

The website should feel like a real employment platform.

Main pages:

PUBLIC:

Home
About
How It Works
Login
Register

WORKER:

Worker Dashboard
Find Jobs
Job Details
My Applications
Recommended Jobs
Notifications
Worker Profile
Verification
Ratings

EMPLOYER:

Employer Dashboard
Post Job
My Jobs
Applications
Find Workers
Recommended Workers
Notifications
Employer Profile
Verification
Ratings

ADMIN:

Admin Dashboard
Users
Jobs
Applications
Verification
Reviews
Complaints
Statistics

==================================================
PHASE 18 - HOME PAGE
==================================================

Create an attractive landing page.

Main heading:

"Find Work. Find Workers. Build Better Opportunities."

Explain KaamSetu simply.

Buttons:

Find Work
Hire Workers

Show:

How KaamSetu Works

For Workers:

Create Profile
Find Jobs
Apply
Work
Get Rated

For Employers:

Post Job
Find Workers
Hire
Complete Job
Rate Worker

Show benefits:

Nearby jobs
Smart matching
Verified users
Two-way ratings

==================================================
PHASE 19 - MOBILE RESPONSIVENESS
==================================================

The entire application must be mobile-friendly.

Use mobile-first responsive CSS.

Test:

Mobile
Tablet
Laptop
Desktop

Worker mobile navigation:

Home
Jobs
Applications
Notifications
Profile

Employer:

Dashboard
Post Job
Applicants
Workers
Notifications
Profile

Admin:

Dashboard
Users
Jobs
Verification
Reports

Convert large tables into responsive cards on small screens.

Buttons must be touch-friendly.

Forms must work properly on mobile.

==================================================
PHASE 20 - SECURITY
==================================================

Implement basic security practices.

Use:

bcrypt
JWT
Protected routes
Role-based authorization
Environment variables
Input validation
Error handling

Prevent:

Unauthorized API access
Users modifying other users' profiles
Workers modifying employer jobs
Employers modifying other employers' jobs
Unauthorized reviews
Duplicate applications
Duplicate reviews

Do not expose:

Passwords
JWT secrets
MongoDB credentials
Private verification documents

Use appropriate HTTP status codes.

==================================================
PHASE 21 - ERROR HANDLING
==================================================

Create consistent API error responses.

Example:

{
  "success": false,
  "message": "Job not found"
}

Success:

{
  "success": true,
  "message": "Job created successfully",
  "data": {}
}

Handle:

400
401
403
404
409
500

Create centralized error handling if appropriate.

==================================================
PHASE 22 - DATABASE MODELS
==================================================

The final application should have models approximately for:

User
WorkerProfile
EmployerProfile
Job
Application
Verification
Review
Notification
Complaint

Use references between related documents.

Do not duplicate large amounts of data unnecessarily.

Create indexes where useful.

==================================================
PHASE 23 - API ORGANIZATION
==================================================

Organize APIs approximately as:

/api/auth
/api/users
/api/workers
/api/employers
/api/jobs
/api/applications
/api/recommendations
/api/location
/api/verifications
/api/reviews
/api/notifications
/api/admin
/api/complaints

Use controllers and services rather than putting all logic into server.js.

==================================================
PHASE 24 - FRONTEND API COMMUNICATION
==================================================

Create a reusable API service.

Do not hard-code fetch logic everywhere.

Handle:

Loading
Success
Error
Unauthorized

Redirect users to login when appropriate.

Store authentication state appropriately.

Do not expose JWT secrets.

==================================================
PHASE 25 - VALIDATION
==================================================

Validate:

Registration
Login
Profile forms
Job forms
Applications
Reviews
Complaints
Verification requests

Display user-friendly validation messages.

==================================================
PHASE 26 - TESTING
==================================================

After implementation, test every major feature.

Test:

1. Worker registration
2. Employer registration
3. Login
4. Logout
5. Worker profile
6. Employer profile
7. Job creation
8. Job update
9. Job deletion
10. Job search
11. Job application
12. Application acceptance
13. Application rejection
14. Job completion
15. Location matching
16. Job recommendation
17. Worker recommendation
18. Verification
19. Ratings
20. Notifications
21. Complaints
22. Admin dashboard
23. Blocking users
24. Mobile responsiveness

Fix bugs before declaring the project complete.

==================================================
PHASE 27 - SEED DATA
==================================================

Create an optional development seed script.

It may create:

Admin
Sample workers
Sample employers
Sample jobs

Do NOT use real people's personal information.

Clearly label seed data as demo data.

Do not automatically run seed data every time the server starts.

==================================================
PHASE 28 - README
==================================================

Create a complete README.md.

Include:

Project title
Project description
Problem statement
Features
Technology stack
Folder structure
Installation
MongoDB setup
Environment variables
Frontend setup
Backend setup
How to run
API overview
User roles
Verification system
Recommendation system
Testing
Future scope

==================================================
PHASE 29 - PROJECT DOCUMENTATION
==================================================

Create a documentation file:

PROJECT-DOCUMENTATION.md

Include:

1. Title
2. Abstract
3. Introduction
4. Problem Statement
5. Objectives
6. Existing System
7. Proposed System
8. Scope
9. User Roles
10. Functional Requirements
11. Non-Functional Requirements
12. Technology Stack
13. System Architecture
14. Module Description
15. Database Design
16. API Design
17. Location Matching
18. Recommendation Algorithm
19. Verification System
20. Rating System
21. Admin Module
22. Security
23. Testing
24. Limitations
25. Future Scope
26. Conclusion

Write in simple MCA-level language.

==================================================
PHASE 30 - VIVA PREPARATION
==================================================

Create:

VIVA-NOTES.md

Explain in simple language:

1. Why did we choose this project?
2. What problem does it solve?
3. Why React?
4. Why Node.js?
5. Why Express?
6. Why MongoDB?
7. What is Mongoose?
8. How does JWT work?
9. Why bcrypt?
10. How does location matching work?
11. How does recommendation work?
12. How does verification work?
13. How does two-way rating work?
14. What is the role of admin?
15. How does frontend communicate with backend?
16. How does backend communicate with MongoDB?
17. What are the limitations?
18. How can this become a major project?

==================================================
PHASE 31 - FUTURE MAJOR PROJECT SCOPE
==================================================

Design the architecture so KaamSetu can later become a major project.

Possible future enhancements:

- Machine learning job recommendation
- Demand prediction
- Wage prediction
- Worker reliability prediction
- Advanced fraud detection
- Document verification
- Digital identity verification
- Payment integration
- Multilingual support
- SMS notifications
- Push notifications
- Advanced analytics
- Worker skill certification
- Employer trust scoring
- Geographic heat maps
- Job demand forecasting

Do NOT implement all future features now.

Only keep the architecture extensible.

==================================================
FINAL QUALITY CHECK
==================================================

Before declaring the project complete:

1. Check all imports.
2. Check all routes.
3. Check all controllers.
4. Check all models.
5. Check database connection.
6. Check environment variables.
7. Check frontend routing.
8. Check API communication.
9. Check authentication.
10. Check authorization.
11. Check mobile responsiveness.
12. Check error handling.
13. Check validation.
14. Check duplicate applications.
15. Check duplicate reviews.
16. Check verification permissions.
17. Check admin permissions.
18. Check location queries.
19. Check recommendation calculations.
20. Check notifications.
21. Check README.
22. Check documentation.
23. Remove unused code.
24. Remove duplicate files.
25. Do not expose secrets.

==================================================
VERY IMPORTANT DEVELOPMENT INSTRUCTION
==================================================

DO NOT simply generate the entire application blindly.

First inspect the existing project.

Then implement the missing functionality systematically.

If an existing feature is broken, fix it.

After each major module:

1. Implement it.
2. Test it.
3. Check for errors.
4. Explain what was changed.
5. Continue.

Do not delete working functionality.

Do not change the technology stack.

Do not introduce unnecessary frameworks.

Keep the implementation suitable for an MCA student.

==================================================
FINAL OUTPUT
==================================================

When everything is completed, provide:

1. Final project structure
2. List of all implemented features
3. List of all API endpoints
4. List of all database models
5. How to start MongoDB
6. How to start backend
7. How to start frontend
8. How to create an admin
9. How to test the complete application
10. Known limitations
11. Future major-project enhancements
12. MCA viva explanation

The final project must be a complete working KaamSetu application.

Do not stop after creating documentation.

Actually implement and test the required functionality.