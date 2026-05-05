# LendIt

**LendIt** is a community resource-sharing mobile app. Create or join a group (neighborhood, building, coworking, university), share tools and objects with your community, and manage loans with full lifecycle tracking.

Built with **React Native (Expo)** + **Node.js / Express** + **MongoDB**.

---

## Features

- **Community groups** — create private groups with a join code; owner and collaborator roles
- **Resource catalog** — add items with rich descriptions, photos, availability schedule, and delivery/return points
- **Loan management** — request, approve, and track loans (pending → in progress → completed / overdue)
- **Automated state transitions** — a cron job runs hourly to mark overdue loans automatically
- **Rating system** — rate users and resources after each completed loan
- **Map integration** — set and visualize delivery/return locations on a map
- **JWT authentication** — secure login and protected routes throughout the app

---

## Tech Stack

| Layer | Technologies |
|---|---|
| Mobile frontend | React Native 0.76, Expo SDK 52, React Navigation |
| State management | React Context API, AsyncStorage |
| Backend | Node.js, Express 4 |
| Database | MongoDB Atlas, Mongoose |
| Auth | JWT, bcryptjs |
| Scheduled tasks | node-cron |

---

## Project Structure

```
lendit-master/
├── backend/          # Express REST API
│   ├── config/       # DB connection
│   ├── controllers/  # Business logic (user, group, resource, loan)
│   ├── middlewares/  # JWT auth middleware
│   ├── models/       # Mongoose schemas
│   ├── routes/       # API routes
│   ├── utils/        # Cron tasks
│   └── server.js
└── frontend/         # Expo mobile app
    ├── assets/       # Icons and splash images
    ├── screens/      # All UI screens (17 screens)
    ├── src/
    │   ├── context/  # GroupContext (global state)
    │   └── navigation/ # Stack and tab navigators
    └── utils/        # API base URL config
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npm install -g expo-cli`)
- [Expo Go](https://expo.dev/client) app on your phone (or an emulator)
- A [MongoDB Atlas](https://www.mongodb.com/atlas) account (free tier works)

---

## Setup & Running

### 1. Clone the repository

```bash
git clone https://github.com/your-username/lendit.git
cd lendit
```

### 2. Backend

```bash
cd backend
npm install
```

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

```env
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/lendit?retryWrites=true&w=majority
PORT=5000
JWT_SECRET=your_super_secret_key_here
```

Start the server:

```bash
# Production
npm start

# Development (auto-reload with nodemon)
npm run dev
```

The API will be available at `http://localhost:5000`.

---

### 3. Frontend

```bash
cd frontend
npm install
```

Copy the example env file:

```bash
cp .env.example .env
```

```env
# If running on a physical device, use your machine's LAN IP instead of localhost
EXPO_PUBLIC_API_URL=http://localhost:5000
```

Start the Expo dev server:

```bash
npm start
```

Scan the QR code with **Expo Go** on your phone, or press `a` for Android emulator / `i` for iOS simulator.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT |
| GET | `/api/users/:id` | Get user profile |
| PATCH | `/api/users/:id` | Update user profile |
| POST | `/api/groups` | Create a group |
| GET | `/api/groups/:id` | Get group details |
| POST | `/api/groups/:id/members` | Add member to group |
| DELETE | `/api/groups/:id/members/:userId` | Remove member |
| POST | `/api/resources` | Create a resource |
| GET | `/api/resources/:id` | Get resource details |
| PATCH | `/api/resources/:id` | Update resource |
| DELETE | `/api/resources/:id` | Delete resource |
| POST | `/api/loans` | Request a loan |
| GET | `/api/loans/:id` | Get loan details |
| PATCH | `/api/loans/:id` | Update loan status |
| GET | `/api/loans` | List user's loans |
| POST | `/api/resources/:id/reviews` | Rate a resource |
| POST | `/api/users/:id/reviews` | Rate a user |

---

## Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGO_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret key for signing JWT tokens | Yes |
| `PORT` | Port the server listens on (default: 5000) | No |
| `CLIENT_URL` | Allowed CORS origin (default: `*`) | No |

### Frontend (`frontend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `EXPO_PUBLIC_API_URL` | Backend base URL | `http://localhost:5000` |

> **Note:** When testing on a **physical device**, replace `localhost` with your computer's local IP address (e.g. `http://192.168.1.x:5000`). Both devices must be on the same Wi-Fi network.

---

## License

MIT
