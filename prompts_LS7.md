## Prompt LS7_1

### Context
The project is a stateless web application with a React-based frontend and a Node.js/TypeScript backend (Express). The application must be deployed as a single container exposing only one port, with frontend static assets served via the backend or a process supervisor. The current setup uses separate Dockerfiles for frontend and backend, and a CI workflow that builds and pushes separate images. The latest reflection (LS6) identified issues in the CI workflow, including duplicate step IDs, Trivy scan referencing errors, suboptimal Docker cache keys, missing Trivy artifact uploads, and insufficient tag sanitization. The project requirements emphasize secure API key handling, subpath hosting, and minimal, production-ready images.

### Task
Implement a new root-level multi-stage `Dockerfile` and update the CI workflow to build, scan, and push a single combined container image. Remove all logic for separate frontend/backend images. Ensure the new Dockerfile builds frontend static assets in one stage, backend in another, and copies both outputs into the final image. Serve frontend static files via the backend (Express) or, if needed, use a process supervisor to run both backend and a static file server (e.g., Nginx). Use a non-root user in the final image, handle environment variables for both frontend and backend, minimize the final image size, and ensure proper signal handling and graceful shutdown. Update documentation and scripts as needed to reflect the new build/run process.

### Requirements
- Place the new multi-stage `Dockerfile` at the project root.
- Build frontend static assets in one stage (e.g., `frontend/`).
- Build backend (Node.js/TypeScript) in another stage (e.g., `backend/`).
- Copy both build outputs into the final image.
- Serve frontend static files via the backend (Express) or use a process supervisor (e.g., Nginx + backend).
- Use a non-root user in the final image.
- Handle environment variables for both frontend and backend.
- Minimize final image size (multi-stage, only production artifacts).
- Ensure proper signal handling and graceful shutdown.
- Update `.github/workflows/docker-ghcr.yml` to:
  - Build, scan, and push only the combined image to GHCR.
  - Remove all logic for separate frontend/backend images.
  - Use unique step IDs and correct Trivy scan referencing.
  - Use granular Docker build cache keys (hash of Dockerfile and dependency files).
  - Upload Trivy scan reports as workflow artifacts.
  - Sanitize Docker tags for all refs.
  - Pin all third-party actions to trusted versions.
- Update documentation and scripts to reflect the new build/run process.

### Previous Issues
- Duplicate step IDs in CI workflow caused ambiguous outputs.
- Trivy scan referenced overwritten or incorrect image refs.
- Docker build cache keys were not granular, reducing cache efficiency.
- Trivy scan reports were not uploaded as artifacts.
- Tag extraction did not sanitize tags for all valid Docker tag characters.
- Style: inconsistent step IDs, repeated logic, YAML anchors not organized.
- Optimization: cache key granularity, potential for parallelization.
- Security: ensure OIDC, no static secrets, pin all actions.

### Expected Output
- A new root-level multi-stage `Dockerfile` implementing the above requirements.
- An updated `.github/workflows/docker-ghcr.yml` that builds, scans, and pushes only the combined image, addressing all previous issues.
- Updated documentation and scripts reflecting the new build and run process.
- All code and configuration should follow best practices for Docker, Node.js, and CI workflows, with clear comments and maintainable structure.