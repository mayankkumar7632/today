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
- No email/SMS notifications
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
