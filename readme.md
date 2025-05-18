# GPT-Image Application

## 1. Project Overview

GPT-Image is a full-stack application designed to provide AI-powered image generation and editing capabilities through a modern web interface. The project features a **React-based frontend** and a **Node.js/TypeScript backend**, both containerized for easy deployment using Docker Compose. The main use case is to allow users to interactively generate, edit, and manage images using advanced AI models, with a focus on usability, extensibility, and secure API access.

**High-Level Architecture:**
- **Frontend:** React app (TypeScript/JavaScript), providing interactive UI components (ChatArea, MaskEditor, Sidebar).
- **Backend:** Node.js/Express (TypeScript), exposing RESTful endpoints for image generation, processing pipelines, and security features.
- **Deployment:** Single combined Docker container (multi-stage build) runs both backend and serves frontend static files for seamless local or cloud deployment.

---

## 2. Installation Instructions

### A. Using Docker (Recommended)

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

3. **Build and run the combined container:**
   ```bash
   docker build -t gpt-image-app .
   docker run --env-file .env -p 8080:8080 gpt-image-app
   ```
   - The backend API and frontend UI are both served from [http://localhost:8080](http://localhost:8080).

### B. Manual Installation (Advanced/Development Only)

> **Note:** The following manual steps are intended for advanced users or development purposes. For most use cases, the combined-container approach described above is recommended and fully supported.

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

### A. Docker

- **Start:**
  ```bash
  docker build -t gpt-image-app .
  docker run --env-file .env -p 8080:8080 gpt-image-app
  ```
- **Access the app:**
  Open [http://localhost:8080](http://localhost:8080) in your browser.
  Both the frontend UI and backend API are served from this port.

### B. Manual (Development Only)

- **Start backend:**
  See backend instructions above (default: http://localhost:8080).
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
  - For production, use the root-level Dockerfile to build a single combined image.
- **Tips:**
  - Review `.env.example` for all configurable options.
  - Consult backend and frontend `package.json` for available scripts.
  - For production, use the combined Dockerfile and update environment variables as needed.
---
## 7. CI Security, Multi-Arch Build, and Deployment

### A. CI Security & Vulnerability Scanning

- **GitHub Actions** is used for CI/CD, with OIDC authentication for secure registry access (no static secrets).
- **Trivy** scans Docker images for vulnerabilities before deployment. The Trivy vulnerability database is cached with a key that includes the Trivy version and OS for reliable, up-to-date scanning.
- **Best Practices:** All secrets are managed via GitHub, and the workflow is designed to minimize the risk of credential leaks.

### B. Multi-Architecture Docker Build

- The CI workflow builds and pushes a **multi-architecture Docker image** (supports `linux/amd64` and `linux/arm64`) using Docker Buildx and QEMU.
- The resulting image can run on most modern cloud providers and local machines, including ARM-based devices.

### C. Secure Deployment Instructions

- **Production deployment** is recommended via the combined Docker image:
  ```bash
  docker pull ghcr.io/<your-org-or-user>/gpt-image:<tag>
  docker run --env-file .env -p 8080:8080 ghcr.io/<your-org-or-user>/gpt-image:<tag>
  ```
- The backend runs in `NODE_ENV=production` mode, serves only static files from the intended directory, and exposes only port 8080 (or 5000 for backend-only).
- For cloud deployment, ensure environment variables are securely managed and only required ports are exposed.
- For multi-arch support, use the published image from GHCR or build locally with:
  ```bash
  docker buildx build --platform linux/amd64,linux/arm64 -t gpt-image-app:latest .
  ```

- **Security Note:** The backend includes static file path validation to prevent directory traversal attacks.

---