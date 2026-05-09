# Instagram Login Page - Vue 3 + Vite

A modern Instagram-style login page built with Vue 3 and Vite.

## 📁 Project Structure

```
├── src/
│   ├── components/
│   │   └── LoginForm.vue      # Main login form component
│   ├── App.vue                 # Root component
│   ├── main.js                 # Application entry point
│   └── style.css               # Global styles
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

2. Start the development server:
```bash
npm run dev
```

The application will open automatically in your browser at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

This creates an optimized build in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

## 🔐 Demo Credentials

**Username:** `demo@instagram.com`  
**Password:** `password123`

## ✨ Features

- **Instagram-style design** with gradient background
- **Responsive layout** that works on mobile and desktop
- **Vue 3 Composition** with reactive data binding
- **Social login** buttons (Facebook, Google)
- **Form validation** and error handling
- **Loading states** with disabled button during authentication
- **Success/Error messages** with smooth animations
- **Remember me** checkbox
- **Forgot password** and signup links

## 🛠️ Technologies Used

- **Vue 3** - Progressive JavaScript framework
- **Vite** - Next generation frontend tooling
- **CSS 3** - Modern styling with gradients and flexbox
- **JavaScript ES6+** - Modern JavaScript features

## 📝 Components

### LoginForm.vue
The main login component containing:
- Form inputs (username, password)
- Social login buttons
- Error and success message displays
- Login logic with simulated API calls
- Remember me functionality

### App.vue
Root component that renders the LoginForm

## 🎨 Styling

The component uses scoped CSS for style isolation. All styles are defined within the component for easy maintenance and portability.

## 🔄 State Management

Uses Vue 3's reactive `data()` function for simple state management:
- Form data (username, password, rememberMe)
- UI states (isLoading, errorMessage, successMessage)

## � OpenAI LLM Integration

This project includes a serverless route at `api/openai.js` for securely calling the OpenAI API.

### Setup
1. Install the OpenAI package:
```bash
npm install openai
```
2. Copy `.env.example` to `.env` and add your OpenAI API key:
```bash
cp .env.example .env
```
3. Set your key in `.env`:
```
OPENAI_API_KEY=sk-...
```

### How it works
- The frontend calls `/api/openai` with `{ prompt }`
- The serverless handler uses the `openai` package to create a response
- The API key stays on the server side and is never exposed to the browser

### Notes
- This works well on Vercel and other serverless hosting platforms
- For local development, run the Vite app and use a backend proxy if needed

## �🤝 Contributing

Feel free to modify and extend this project for your needs!

## 📄 License

MIT License - feel free to use this project for personal or commercial use.
