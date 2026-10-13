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