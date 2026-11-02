# KaamSetu - Viva Preparation Notes

## Common Viva Questions and Answers

### 1. Why did you choose this project?
Daily-wage workers face uncertainty finding work every day. They gather at specific locations hoping to be hired with no guarantee. Employers also struggle to find reliable workers quickly. KaamSetu solves this by creating a digital platform that connects them efficiently using skill matching, location search, and trust building through verification and ratings.

### 2. What problem does it solve?
- Workers: Find jobs based on their skills and location, build reputation through ratings
- Employers: Find verified, skilled workers quickly for their needs
- System: Creates transparency, reduces exploitation by middlemen, builds trust

### 3. Why React.js for frontend?
- Component-based architecture makes code reusable and organized
- Virtual DOM provides fast rendering and good user experience
- Large ecosystem with libraries like React Router
- Easy to learn and widely used in industry
- Excellent mobile responsiveness support

### 4. Why Node.js for backend?
- JavaScript on both frontend and backend (full-stack JavaScript)
- Non-blocking, event-driven architecture handles many concurrent requests
- Huge package ecosystem via npm
- Fast development cycle
- Easy to learn for students familiar with JavaScript

### 5. Why Express.js?
- Minimal and flexible Node.js web framework
- Simple routing system
- Built-in middleware support (body parsing, CORS)
- Large community and documentation
- Easy to create RESTful APIs

### 6. Why MongoDB?
- Document-based (JSON-like) storage fits JavaScript naturally
- Schema flexibility allows rapid development
- Built-in support for geospatial queries (2dsphere index)
- Easy to set up and use
- Scales well for web applications

### 7. What is Mongoose?
Mongoose is an ODM (Object Data Modeling) library for MongoDB and Node.js. It:
- Defines schemas for MongoDB documents
- Provides data validation
- Adds middleware hooks (pre-save, etc.)
- Creates models from schemas
- Simplifies database queries

### 8. How does JWT work?
JSON Web Token (JWT) authentication flow:
1. User logs in with email and password
2. Server verifies credentials
3. Server creates a JWT containing user ID and role
4. Token is sent to client and stored in localStorage
5. Client includes token in Authorization header for protected requests
6. Server middleware verifies token and attaches user to request

JWT has three parts: Header.Payload.Signature
- Header: Algorithm used (HS256)
- Payload: User data (id, role, expiry)
- Signature: Ensures token hasn't been tampered with

### 9. Why bcrypt?
- Passwords must never be stored in plain text
- bcrypt uses salted hashing - adds random data (salt) before hashing
- Even if database is compromised, passwords cannot be easily reversed
- Salt rounds (10) determine how slow the hashing is
- Built-in comparison function for login verification

### 10. How does location matching work?
1. Worker/Job stores location as GeoJSON: { type: "Point", coordinates: [longitude, latitude] }
2. MongoDB creates a 2dsphere index on the location field
3. When searching nearby jobs, we use $nearSphere query with a max distance
4. MongoDB returns results sorted by distance
5. Haversine formula calculates exact distance between two points on Earth

### 11. How does recommendation work?
Rule-based weighted scoring system:
- Compare worker skills with job required skills (35% weight)
- Calculate distance between worker and job location (20%)
- Compare experience levels (15%)
- Compare expected wage vs offered wage (15%)
- Check availability (10%)
- Factor in worker's rating (5%)
- Final score: 0-100%, higher = better match

### 12. How does verification work?
Four-level system:
- Level 1: Phone/Email verification
- Level 2: Profile completeness verified by admin
- Level 3: Skill verification based on completed jobs
- Level 4: Trusted Worker/Employer status

Each level adds a badge. Admin reviews verification requests.

### 13. How does two-way rating work?
After a job is marked completed:
- Worker can rate employer (Payment, Behaviour, Overall)
- Employer can rate worker (Skill, Punctuality, Work Quality, Overall)
- Ratings are 1-5 stars
- System prevents duplicate reviews for the same job
- Average rating is calculated and displayed on profiles

### 14. What is the role of admin?
- Manages the platform
- Reviews verification requests
- Blocks/unblocks users
- Handles complaints
- Views system statistics
- Ensures platform safety and quality

### 15. How does frontend communicate with backend?
- Frontend uses fetch API to make HTTP requests
- API service (api.js) centralizes all API calls
- JWT token is sent in Authorization header
- CORS is enabled on backend to allow frontend requests
- JSON is used for data exchange

### 16. How does backend communicate with MongoDB?
- Mongoose connects to MongoDB using connection string from .env
- Models define schema and provide query methods
- Controllers use model methods to CRUD data
- Connection is established before server starts listening
- 2dsphere indexes enable geospatial queries

### 17. What are the limitations?
- No real-time notifications (polling based)
- Location is approximate (city level)
- No file uploads yet
- SMS provider adapter and real SMS delivery are not configured by default
- No payment integration
- No machine learning
- Single server deployment

### 18. How can this become a major project?
- Add Socket.IO for real-time notifications
- Integrate payment gateways (Razorpay, UPI)
- Implement ML-based recommendations
- Add document verification
- Support multiple languages
- Create a mobile app with React Native
- Add geographic heat maps for demand forecasting
- Implement advanced analytics

### 19. How does the KaamSetu chatbot work?
The backend sends the user's message and recent conversation to the Gemini `generateContent` API. It includes trusted KaamSetu data, such as the latest open jobs from MongoDB, and instructs the assistant to answer only KaamSetu questions. If the AI request fails, the existing keyword-based chatbot returns a fallback reply.

### 20. Which endpoint does the chatbot use?
The frontend sends an authenticated `POST` request to `/api/chatbot` with a JSON message. The backend validates the message, gets a reply from the chatbot service, and returns it as JSON.

### 21. Does the chatbot use an AI or paid API?
When configured, it uses Google's Gemini API with a Google AI Studio API key. Usage limits or charges depend on the account and model. If the key is missing or the API fails, the rule-based fallback still works.

### 22. How does the chatbot handle different user roles?
The backend includes the authenticated user's name and role in the assistant instructions. It also supplies worker application counts when the user is a worker. The fallback provides role-specific replies for worker and employer features.

### 23. Why is the AI API key kept on the server?
The API key is a secret credential. Keeping it in the backend environment file prevents the browser from exposing it to users. The server file is excluded by `.gitignore`.

### 24. How does the AI use database data?
Before calling the AI, the backend queries MongoDB for up to five latest open jobs and passes their titles, daily wages, and cities as context. The assistant is told to use only the provided data and not invent job details.

### 25. Why is there a rule-based fallback?
The fallback keeps the chatbot useful if the API key is missing, the external service is unavailable, or an AI request fails. The backend logs the AI error and tries the existing keyword-based replies.

### 26. What is the Web Speech API used for?
The browser's Web Speech API converts speech to text for microphone input and can read chatbot replies aloud. The selected language (English India, Hindi, or Tamil) configures speech recognition and spoken responses. It does not require another npm package.

### 27. How do email and SMS notifications work?
The controllers call `notifyUser(userId, event, data)` after application, complaint, and job events. The service loads the user's channel preferences, formats content through the centralized templates, sends configured SMTP email, and calls the provider-independent `sendSms` adapter point. Each channel outcome is stored in the Notification collection as sent, failed, or skipped; errors are contained so notification delivery does not fail the original API request.

### 28. How can notifications be demonstrated without paid services?
Set `NOTIFY_MODE=mock` in `server/.env` and call the authenticated `GET /api/notifications/test` endpoint. Email and SMS content is printed to the backend console and each channel is logged as skipped, demonstrating the notification workflow without sending or charging for messages.

### 29. When are job reminders sent?
The `node-cron` scheduler runs daily at 6 PM server-local time. It finds jobs dated tomorrow and sends reminders to each accepted worker and once to the employer for each job with accepted applications.

### 30. Why does KaamSetu use a Gmail App Password?
A Gmail App Password lets Nodemailer sign in to Gmail without storing or using the account's normal password. It is safer because Google provides a separate 16-character password that can be revoked, and it works only for accounts with 2-Step Verification enabled.

### 31. Why are notification emails sent asynchronously?
Emails wait for an external Gmail server, so sending them synchronously could delay the job, application, or completion API response. KaamSetu starts the send promise in the background and immediately returns its normal application result.

### 32. Why are email errors swallowed?
An email delivery failure is a notification problem, not a reason to fail database actions such as posting a job or accepting a worker. `sendEmail` catches and logs delivery errors, returns false, and background callers use a catch handler so the API remains available.

### 33. What does the development email test endpoint do?
In non-production environments, an authenticated `POST /api/notifications/test-email` request sends a test message to the logged-in user's email address. The protection middleware verifies the JWT first, and the route returns whether Nodemailer succeeded.

## Data Flow Diagram

```
User (Worker/Employer/Admin)
        |
        v
[React Frontend] -- HTTP Request --> [Express Backend]
                                          |
                                   [JWT Middleware]
                                          |
                                   [Controller Logic]
                                          |
                                   [Mongoose Model]
                                          |
                                   [MongoDB Database]
```

## Architecture Diagram

```
+------------------+     +------------------+     +------------------+
|                  |     |                  |     |                  |
|  React.js        | --> |  Node.js +       | --> |  MongoDB         |
|  (Frontend)      |     |  Express.js      |     |  (Database)      |
|                  |     |  (Backend)       |     |                  |
+------------------+     +------------------+     +------------------+
        |                        |
        |                   [JWT Auth]
        |                   [bcrypt]
        v
  Browser / Mobile
```

## Technology Comparison (Why this stack?)

| Feature | Our Choice | Alternative | Why We Chose |
|---------|-----------|-------------|-------------|
| Frontend | React.js | Angular, Vue | Simpler learning curve, large community |
| Backend | Node.js + Express | Django, Spring | JavaScript everywhere, fast development |
| Database | MongoDB | MySQL, PostgreSQL | Flexible schema, geospatial support |
| Auth | JWT | Session-based | Stateless, scalable, mobile-friendly |
| Password | bcrypt | argon2 | Well-tested, widely used |

## Key Code Concepts

### Middleware Pattern
```javascript
// Request -> Middleware -> Controller -> Response
app.get('/api/jobs', protect, authorize('worker'), getJobs);
```

### Mongoose Schema
```javascript
// Defines structure of database documents
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, enum: ['worker', 'employer', 'admin'] }
});
```

### GeoJSON Query
```javascript
// Find documents near a location
Job.find({
  location: {
    $nearSphere: {
      $geometry: { type: "Point", coordinates: [77.1, 28.6] },
      $maxDistance: 10000  // 10km in meters
    }
  }
});
```

## Tips for Viva
1. Know your project structure - be able to explain each folder
2. Understand the authentication flow end to end
3. Explain the recommendation algorithm clearly
4. Be honest about limitations
5. Know the difference between JWT and session-based auth
6. Understand MongoDB geospatial queries
7. Be able to explain the two-way rating system
8. Know the verification levels
9. Practice explaining data flow from frontend to database
10. Have examples of future improvements ready
