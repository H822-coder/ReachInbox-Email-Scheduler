# ReachInbox – Email Scheduler

A full-stack email scheduling application that allows users to compose emails, schedule them for future delivery, and monitor email delivery status through a dashboard.

Built using React, Node.js, Express, MongoDB, Redis, BullMQ, and Nodemailer.

## Features

- **Email Scheduling:** Schedule emails for a specific future date and time.
- **Delayed Job Processing:** Uses BullMQ and Redis to manage scheduled email jobs.
- **Persistent Job Queue:** Scheduled jobs are stored in Redis and can survive application restarts.
- **Email Status Tracking:** Monitor scheduled, processing, sent, failed, and cancelled emails.
- **Dashboard:** View email statistics and manage email activity.
- **Search and Filters:** Search emails by recipient or subject and filter by delivery status.
- **Email Preview:** View test emails through Ethereal Email preview links.
- **MongoDB Integration:** Store email records and delivery information.

## Tech Stack

| Technology | Purpose |
|---|---|
| React + Vite | Frontend |
| JavaScript | Application development |
| Node.js | Backend runtime |
| Express.js | REST API |
| MongoDB | Database |
| Mongoose | MongoDB object modeling |
| Redis | Job queue storage |
| BullMQ | Delayed job scheduling |
| Nodemailer | Email sending |
| Ethereal Email | Email testing |
| Axios | API communication |
| Lucide React | Icons |
| Docker | Redis containerization |

## Project Structure

```text
email-scheduler/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js
│   │   │   └── redis.js
│   │   │
│   │   ├── controllers/
│   │   │   └── emailController.js
│   │   │
│   │   ├── models/
│   │   │   └── Email.js
│   │   │
│   │   ├── queues/
│   │   │   └── emailQueue.js
│   │   │
│   │   ├── routes/
│   │   │   └── emailRoutes.js
│   │   │
│   │   ├── services/
│   │   │   └── emailService.js
│   │   │
│   │   ├── workers/
│   │   │   └── emailWorker.js
│   │   │
│   │   └── server.js
│   │
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   └── package.json
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

## Prerequisites

Make sure the following are installed:

- Node.js and npm
- MongoDB
- Docker Desktop
- Redis (through Docker)
- Git

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/ReachInbox-Email-Scheduler.git
cd ReachInbox-Email-Scheduler
```

### 2. Configure the Backend

Navigate to the backend directory:

```bash
cd backend
npm install
```

Create a `.env` file inside the backend directory.

Add the following configuration:

```env
PORT=5000

MONGO_URI=mongodb://127.0.0.1:27017/email_scheduler

REDIS_HOST=127.0.0.1
REDIS_PORT=6380

ETHEREAL_HOST=smtp.ethereal.email
ETHEREAL_PORT=587
ETHEREAL_USER=your_ethereal_username
ETHEREAL_PASS=your_ethereal_password
```

Replace the Ethereal credentials with your own test account credentials.

### 3. Start MongoDB

Ensure your MongoDB service is running.

On Windows PowerShell:

```powershell
Start-Service MongoDB
```

If MongoDB is already running, continue to the next step.

### 4. Start Redis

Start Docker Desktop and run Redis.

If using an existing Redis container:

```bash
docker start email-redis
```

Verify the connection:

```bash
docker exec email-redis redis-cli ping
```

Expected output:

```text
PONG
```

Redis must be accessible at `127.0.0.1:6380` with the configuration above.

### 5. Start the Backend API

From the backend directory:

```bash
npm run dev
```

The backend API will run at:

```text
http://localhost:5000
```

### 6. Start the Email Worker

Open a separate terminal:

```bash
cd backend
node src/workers/emailWorker.js
```

The worker connects to MongoDB, Redis, and the Ethereal SMTP service and processes scheduled email jobs.

Keep this process running while using the application.

### 7. Configure and Start the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the application:

```text
http://localhost:5173
```

## API Documentation

Base URL:

```text
http://localhost:5000/api
```

### Schedule an Email

**Endpoint:**

```http
POST /api/emails/schedule
```

**Request Body:**

```json
{
  "recipient": "recipient@example.com",
  "subject": "Meeting Reminder",
  "body": "This is a scheduled email.",
  "scheduledAt": "2026-12-20T10:30:00.000Z"
}
```

**Success Response:**

```json
{
  "success": true,
  "message": "Email scheduled successfully",
  "data": {
    "recipient": "recipient@example.com",
    "subject": "Meeting Reminder",
    "status": "scheduled"
  }
}
```

### Get All Emails

**Endpoint:**

```http
GET /api/emails
```

Returns all stored email records.

### Filter Emails by Status

**Scheduled Emails:**

```http
GET /api/emails?status=scheduled
```

**Sent Emails:**

```http
GET /api/emails?status=sent
```

**Failed Emails:**

```http
GET /api/emails?status=failed
```

## Application Workflow

1. The user enters the recipient, subject, message, and scheduled date.
2. The frontend sends the request to the Express API.
3. The backend validates the request and stores the email in MongoDB.
4. BullMQ creates a delayed job in Redis.
5. The worker waits until the scheduled execution time.
6. Nodemailer sends the email through Ethereal SMTP.
7. MongoDB is updated with the delivery status and preview URL.
8. The frontend displays the updated email information.

## Email Testing

This project uses **Ethereal Email** as a test SMTP service.

Ethereal captures test emails and provides preview URLs for viewing their contents.

Note: Ethereal is a testing service. Emails are not delivered to actual recipient inboxes.

## Environment Variables and Security

- Never commit your actual `.env` file.
- Keep SMTP credentials private.
- Use `.env.example` to document the required configuration.
- Ensure `node_modules/` and generated build files are excluded from Git.

## Future Improvements

- User authentication and authorization.
- Email cancellation and rescheduling.
- Bulk email scheduling.
- Improved retry and failure management.
- Email analytics and reporting.
- Production SMTP provider integration.
- Deployment using cloud infrastructure.

## Author

**Harsh Pillai**

Information Science and Engineering

GitHub: https://github.com/YOUR_USERNAME

---

**ReachInbox – Email Scheduling Made Simple.**
