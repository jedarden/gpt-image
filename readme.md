# GPT-Image Application

## 1. Project Overview

GPT-Image is a full-stack application designed to provide AI-powered image generation and editing capabilities through a modern web interface. The project features a **React-based frontend** and a **Node.js/TypeScript backend**, both containerized for easy deployment using Docker Compose. The main use case is to allow users to interactively generate, edit, and manage images using advanced AI models, with a focus on usability, extensibility, and secure API access.

**High-Level Architecture:**
- **Frontend:** React app (TypeScript/JavaScript), providing interactive UI components (ChatArea, MaskEditor, Sidebar).
- **Backend:** Node.js/Express (TypeScript), exposing RESTful endpoints for image generation, processing pipelines, and security features.
- **Deployment:** Docker Compose orchestrates both frontend and backend containers for seamless local or cloud deployment.

---

## 2. Installation Instructions

### A. Using Docker Compose (Recommended)

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd gpt-image
   ```

2. **Copy and configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env as needed (see .env.example for required variables)
   ```

3. **Start the application:**
   ```bash
   docker-compose up --build
   ```

### B. Manual Installation

#### Backend

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment variables:**
   - Copy `.env.example` to `.env` in the project root and set required values.

3. **Start the backend:**
   ```bash
   npm run build
   npm start
   ```

#### Frontend

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   # or
   yarn install
   ```

2. **Start the frontend:**
   ```bash
   npm start
   # or
   yarn start
   ```

### C. Environment Variables

- All required environment variables are documented in `.env.example`.
- Set API keys, ports, and other configuration as needed.

---

## 3. Launch Instructions

### A. Docker Compose

- **Start:**  
  ```bash
  docker-compose up --build
  ```
- **Frontend Access:**  
  Open [http://localhost:3000](http://localhost:3000) in your browser.
- **Backend API:**  
  Accessible at [http://localhost:5000/api](http://localhost:5000/api) (default).

### B. Manual

- **Start backend:**  
  See backend instructions above (default: http://localhost:5000).
- **Start frontend:**  
  See frontend instructions above (default: http://localhost:3000).

### C. API Endpoints

- **Image Generation:**  
  `POST /api/generateImage`
- **Pipeline Processing:**  
  `POST /api/pipeline`
- **Other endpoints:**  
  See backend source and docs for details.

---

## 4. Feature and Function Summaries

### A. Frontend Features

- **ChatArea:**  
  Interactive chat interface for user prompts and AI responses.
- **MaskEditor:**  
  Tool for editing and applying masks to images.
- **Sidebar:**  
  Navigation and settings panel for managing sessions and options.

### B. Backend Functions/Routes

- **generateImage:**  
  Handles AI image generation requests.
- **pipeline:**  
  Manages multi-step image processing workflows.
- **Rate Limiting:**  
  Protects API from abuse by limiting request rates.
- **Security:**  
  Implements input validation, API key checks, and other security best practices.

---

## 5. Testing

### A. Backend

- **Run tests:**
  ```bash
  cd backend
  npm test
  ```
- **Requirements:**  
  - Ensure environment variables are set (see `.env.example`).
  - Docker may be required for integration tests.

### B. Frontend

- **Run tests:**
  ```bash
  cd frontend
  npm test
  # or
  yarn test
  ```
- **Requirements:**  
  - Node.js and npm/yarn installed.

---

## 6. Additional Notes

- **Caveats:**  
  - Some features may require valid API keys (see `.env.example`).
  - Ensure Docker is installed for containerized deployment.
  - For development, hot-reloading is enabled in both frontend and backend.
- **Tips:**  
  - Review `.env.example` for all configurable options.
  - Consult backend and frontend `package.json` for available scripts.
  - For production, consider customizing Dockerfiles and environment settings.