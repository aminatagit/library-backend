Library Management Backend
Overview
This is the backend for an online library management platform, built for a university to allow students to search, reserve, and borrow books online. It includes user authentication, book management, ratings/comments, and email notifications for overdue returns.
Technologies

Frontend: (To be implemented: HTML, CSS, JavaScript with React.js or Next.js)
Backend: Node.js (Express)
Database: MySQL
Authentication: JWT
Other: REST API, Git, Nodemailer, Node-cron

Setup

Prerequisites:

Node.js (v16+)
MySQL
Gmail account for email notifications (with app password)


Installation:
git clone <repository-url>
cd backend
npm install


Database Setup:

Create a MySQL database: library_db
Run the SQL schema in database.sql to create tables.
Update .env with your database credentials, JWT secret, and email settings:DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=library_db
JWT_SECRET=your_jwt_secret_key
PORT=3000
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password




Run the Server:
npm start
# or for development with hot reload
npm run dev



API Endpoints

Auth:
POST /api/auth/register - Register a new user
POST /api/auth/login - Login and get JWT


Books:
GET /api/books - Get all books (with filters: title, author, genre)
GET /api/books/:id - Get book by ID
POST /api/books - Add a book (admin only)
PUT /api/books/:id - Update a book (admin only)
DELETE /api/books/:id - Delete a book (admin only)


Ratings:
POST /api/ratings - Add rating/comment (authenticated)
GET /api/ratings/:book_id - Get ratings for a book


Loans:
POST /api/loans/borrow - Borrow a book (authenticated)
POST /api/loans/return - Return a book (authenticated)



Database Schema

users: Stores user info (id, username, email, password, role, created_at)
books: Stores book info (id, title, author, genre, published_year, available, created_at)
loans: Tracks book loans (id, user_id, book_id, borrow_date, due_date, return_date, created_at)
ratings: Stores ratings/comments (id, user_id, book_id, rating, comment, created_at)

Advanced Features

Ratings/Comments: Users can rate books (1-5) and leave comments.
Email Notifications: Overdue loans trigger daily email reminders (cron job at midnight).

Version Control

Initialize a Git repository:git init
git add .
git commit -m "Initial commit"
git remote add origin <repository-url>
git push -u origin main



Deployment

Deploy to a platform like Heroku or Render.
Set up environment variables in the hosting platform.
Ensure MySQL is accessible remotely or hosted alongside the app.

Future Improvements

Implement admin dashboard endpoints.
Add frontend with React.js/Next.js.
Enhance security (e.g., rate limiting, input sanitization).
