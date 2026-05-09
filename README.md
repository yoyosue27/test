# Instagram Login Page - Vue 3 + Vite + Backend

A modern Instagram-style login page built with Vue 3, Vite, and a serverless backend with user authentication.

## 📁 Project Structure

```
├── api/
│   ├── auth.js                 # Authentication logic
│   ├── login.js                # Login/Register endpoint
│   └── openai.js               # OpenAI API endpoint
├── src/
│   ├── components/
│   │   └── LoginForm.vue       # Main login form component
│   ├── App.vue                 # Root component
│   ├── main.js                 # Application entry point
│   └── style.css               # Global styles
├── data/
│   └── users.json              # User storage (auto-created)
├── index.html                  # HTML entry point
├── vite.config.js              # Vite configuration
├── package.json                # Dependencies and scripts
└── README.md                   # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Setup environment variables:
```bash
cp .env.example .env
```
Edit `.env` and add your keys:
```
OPENAI_API_KEY=sk-...
JWT_SECRET=your-super-secret-key
```

3. Start the development server:
```bash
npm run dev
```

The application will open automatically at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

This creates an optimized build in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

## 🔐 User Authentication & Backend

### How It Works
- Users register/login via the Vue form
- Credentials are sent to `/api/login` (serverless function)
- Passwords are hashed with `bcryptjs` before storage
- JWT tokens are generated for authenticated sessions
- Users are stored in `data/users.json` (local file storage for demo)
- Auth token is stored in `localStorage` for session persistence

### User Storage Architecture
Currently uses a simple JSON file: `data/users.json`

**For production:** Replace with:
- MongoDB
- PostgreSQL
- Firebase Realtime Database
- DynamoDB

### API Endpoints

#### Login
```bash
POST /api/login
Content-Type: application/json

{
  "action": "login",
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "token": "jwt-token-here",
  "user": {
    "id": "1234567890",
    "email": "user@example.com",
    "username": "john_doe"
  }
}
```

#### Register
```bash
POST /api/login
Content-Type: application/json

{
  "action": "register",
  "email": "user@example.com",
  "username": "john_doe",
  "password": "password123"
}

Response:
{
  "token": "jwt-token-here",
  "user": {
    "id": "1234567890",
    "email": "user@example.com",
    "username": "john_doe"
  }
}
```

### Security Features
- ✅ Passwords hashed with bcryptjs (10 salt rounds)
- ✅ JWT tokens expire after 24 hours
- ✅ API key stored in environment variables
- ✅ Never commit `.env` file (in `.gitignore`)
- ✅ Passwords never sent in plain text responses

## 🚀 How Vercel Detects & Runs This Project

Vercel automatically detects and deploys this project with zero configuration:

### 1. Framework Auto-Detection
Vercel reads your `package.json` and identifies:
- `vite` in devDependencies → Vite project
- `vue` in dependencies → Vue framework

### 2. Build Process
Vercel automatically:
- Runs: `npm install`
- Runs: `npm run build` (from package.json)
- Outputs to: `dist/` folder
- Serves static files from `dist/`

### 3. Serverless Functions
Any file in the `api/` folder becomes a serverless function:
- `api/login.js` → POST `/api/login`
- `api/openai.js` → POST `/api/openai`
- Each function runs in its own Node.js environment
- Environment variables are injected at runtime

### 4. Environment Variables
In Vercel Dashboard:
1. Go to Settings → Environment Variables
2. Add `OPENAI_API_KEY` and `JWT_SECRET`
3. These are automatically available in your serverless functions

### 5. Continuous Deployment
When you push to GitHub:
```bash
git push origin master
```
Vercel automatically:
- Clones your repo
- Detects the framework
- Builds and deploys
- No additional configuration needed!

### What Vercel Needs (Already Configured)
✅ `package.json` with `"type": "module"` and build script  
✅ `vite.config.js` for Vite configuration  
✅ `src/` folder with Vue components  
✅ `api/` folder with serverless functions  
✅ `index.html` as entry point  

**Zero additional setup required** — Vercel just works! 🎉

## 🤖 OpenAI LLM Integration

This project includes a serverless route at `api/openai.js` for securely calling the OpenAI API.

### Setup
1. Add OpenAI package (already in dependencies):
```bash
npm install
```

2. Set your OpenAI API key in `.env`:
```
OPENAI_API_KEY=sk-...
```

3. Call from your Vue component:
```js
const response = await fetch('/api/openai', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ prompt: 'Write a caption' })
})
const data = await response.json()
```

### Security
- API key stays on the server
- Frontend never sees your OpenAI key
- Perfect for Vercel deployment

## ✨ Features

- **Instagram-style design** with gradient background
- **Responsive layout** that works on mobile and desktop
- **Vue 3 Components** with reactive data binding
- **User Authentication** with real backend
- **Password Hashing** with bcryptjs
- **JWT Tokens** for session management
- **Social login** buttons (Facebook, Google)
- **Form validation** and error handling
- **Loading states** with disabled button during auth
- **Success/Error messages** with smooth animations
- **Remember me** checkbox
- **Forgot password** and signup links
- **Serverless Backend** ready for production

## 🛠️ Technologies Used

- **Vue 3** - Progressive JavaScript framework
- **Vite** - Next generation frontend tooling
- **Node.js** - Backend runtime
- **Bcryptjs** - Password hashing
- **JWT** - JSON Web Tokens for authentication
- **CSS 3** - Modern styling with gradients and flexbox
- **JavaScript ES6+** - Modern JavaScript features

## 📝 Main Components

### LoginForm.vue
- Form inputs (username, password)
- Real authentication with backend
- Error and success message displays
- Token management
- Remember me functionality

### App.vue
- Root component that renders LoginForm

### auth.js (Backend)
- User registration logic
- Login verification
- Password hashing and verification
- JWT token generation
- File-based user storage

### login.js (API Route)
- Express-like handler for `/api/login`
- Routes register/login actions
- Validates request data
- Returns tokens and user info

## 🎨 Styling

- Scoped CSS in components
- Instagram-inspired gradient design
- Mobile-first responsive layout
- Smooth transitions and animations

## 🔄 State Management

Vue 3 reactive data:
- Form data (username, password, rememberMe)
- UI states (isLoading, errorMessage, successMessage)
- Auth token in localStorage

## 📦 Deployment

### Deploy to Vercel
1. Push code to GitHub:
```bash
git push origin master
```

2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Add environment variables:
   - `OPENAI_API_KEY`
   - `JWT_SECRET`
5. Click Deploy — Vercel handles the rest!

### Local Testing
```bash
npm install
npm run dev
```

Visit http://localhost:5173 and test login/register

## 🤝 Contributing

Feel free to modify and extend this project for your needs!

## 📄 License

MIT License - feel free to use this project for personal or commercial use.
