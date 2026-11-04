# LaundryMate

LaundryMate is a hostel laundry management application built on the root Next.js 14 App Router. The Next.js app owns the pages, API routes, authentication, and MongoDB models. Start it from this project root; the old `client/` and `server/` folders are prototype code and are not part of the supported application path.

## Requirements and environment

Use Node.js 18.17 or newer and a MongoDB Atlas database. In the root `.env.local`, configure:

```dotenv
MONGODB_URI=mongodb+srv://<db-user>:<url-encoded-password>@<cluster-host>/<database>?retryWrites=true&w=majority
JWT_SECRET=<random-secret-at-least-32-characters>
```

Keep `.env.local` private. The app accepts `MONGO_URI` as a fallback name, but `MONGODB_URI` is preferred. The app connects with Mongoose's normal `mongodb+srv` resolution; do not replace SRV hostnames with hand-built host lists.

## Run the application

From the project root:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Do not start the Vite prototype on port 3000. Its development port is 5173, while the root Next.js application uses port 3000.

## Create the one admin account

Add the following temporary setup values to `.env.local`:

```dotenv
ADMIN_NAME=Your Name
ADMIN_EMAIL=admin@example.edu
ADMIN_PASSWORD=<unique-password-of-at-least-12-characters>
```

Then run this once from the project root:

```bash
npm run setup:admin
```

The setup command connects to Atlas, creates the user indexes, refuses to create a second admin, and stores the password as a bcrypt hash. It does not print the password. Remove `ADMIN_PASSWORD` from `.env.local` after successful setup. The admin logs in through `/login` with the configured email and password. There is no public staff registration route.

## Student accounts

Students use **Student Register** on `/login`. The form requires name, registration number, email, password and confirmation, hostel, block, and room number. The server normalizes email and registration number, checks duplicates, validates input, hashes passwords with bcrypt, and stores the student in MongoDB. Student accounts and laundry data persist in Atlas after logout and server restarts.

Students sign in with their email or registration number and password. Authentication uses a seven-day JWT in an HTTP-only cookie. The token is signed with `JWT_SECRET`; protected API handlers verify it and enforce roles. Logout expires the cookie.

## API routes

| Method | Route | Access |
|---|---|---|
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/register` | Public; always creates a student |
| POST | `/api/auth/logout` | Public |
| GET | `/api/auth/me` | Authenticated |
| GET, POST | `/api/orders` | Authenticated; students see/create their own orders |
| GET, PATCH | `/api/orders/[id]` | Authenticated; staff/admin may update |
| PATCH | `/api/orders/[id]/status` | Staff/admin |
| PATCH | `/api/orders/[id]/collection` | Staff/admin |
| GET | `/api/collections` | Staff/admin |
| GET, POST | `/api/payments` | Authenticated / staff-admin for recording |
| GET, POST | `/api/complaints` | Authenticated |
| PATCH | `/api/complaints/[id]/respond` | Staff/admin |
| GET | `/api/dashboard` | Authenticated, role-scoped |
| GET | `/api/hostels` | Public lookup |
| POST | `/api/upload` | Authenticated |

Unknown `/api/*` paths return JSON 404 responses.

## Cloudinary uploads

To store clothing photos in Cloudinary, configure these optional root `.env.local` values:

```dotenv
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Restart Next.js after changing environment variables.

## Main project structure

```text
src/middleware.js             JWT verification and page role redirects
src/app/                      Next.js pages and App Router API handlers
src/app/api/auth/             Login, registration, logout, and session routes
src/app/api/orders/            MongoDB-backed laundry orders and status routes
src/app/student/               Student portal
src/app/staff/                 Staff portal
src/components/                Shared portal UI
src/lib/auth.js                JWT signing, verification, and route authorization
src/lib/mongodb.js             MongoDB Atlas connection
src/models/                    Mongoose schemas and indexes
scripts/setup-admin.js         One-time environment-driven admin setup
```
