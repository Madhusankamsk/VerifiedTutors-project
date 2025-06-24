# VerifiedTutors Project

A tutoring platform that connects students with verified tutors.

## Setup Without Docker

### Prerequisites

- Node.js (v18 or later recommended)
- npm (v9 or later recommended)

### Installation and Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd VerifiedTutors-project
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
cd backend
npm install
cd ..
```

4. Create a `.env` file in the `backend` directory with the following environment variables:
```
NODE_ENV=production
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### Building and Running

#### Development Mode

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. In a separate terminal, start the frontend development server:
```bash
npm run dev
```

3. Access the frontend at http://localhost:5173 and the backend at http://localhost:5000

#### Production Mode

1. Build the frontend and copy to backend:
```bash
cd backend
npm run deploy
```

2. Access the full application at http://localhost:5000

## Development Setup

### Frontend Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

### Backend Development

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Run development server
npm run dev
```

## Project Structure

- `src/` - React frontend code
- `backend/` - Node.js backend code
  - `controllers/` - API controllers
  - `models/` - MongoDB models
  - `routes/` - API routes
  - `middleware/` - Express middleware
  - `config/` - Configuration files
  - `services/` - Additional services
  - `server.js` - Main server file 