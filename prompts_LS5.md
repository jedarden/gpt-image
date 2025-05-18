## Prompt LS5_1

### Context
The current GitHub Actions workflow at [.github/workflows/docker-ghcr.yml](.github/workflows/docker-ghcr.yml:1) builds and pushes backend and frontend Docker images to GHCR. Critic and scorer analysis identified several improvement areas: improper use of `${GITHUB_SHA}`, lack of multi-architecture builds, missing automated tagging for releases, no vulnerability scanning, and no build caching. Performance and security scores are limited by these gaps.

### Objective
Refactor the workflow to address variable usage, enable multi-architecture builds, automate tagging for releases, add vulnerability scanning, and implement build caching.

### Focus Areas
- Correct usage of GitHub context variables in shell and workflow steps
- Multi-architecture Docker builds using matrix strategy and QEMU
- Automated triggers and tagging for releases and semantic versioning
- Vulnerability scanning of images before pushing
- Docker Buildx build caching for faster, more efficient builds

### Code Reference
```yaml
# Example of current problematic usage:
- name: Build backend image
  run: |
    docker build -f backend/Dockerfile -t "$IMAGE:latest" -t "$IMAGE:${GITHUB_SHA}" ./backend
# No matrix, no scan, no cache, no tag trigger
```

### Requirements
- Replace all `${GITHUB_SHA}` usages with `${{ github.sha }}` or export it at the start of shell blocks
- Add a matrix build strategy for architectures (e.g., amd64, arm64) using `docker/setup-qemu-action` and Buildx `--platform`
- Add workflow triggers for `push` to tags (e.g., `v*.*.*`) and/or releases to support semantic versioning
- Insert steps to scan built images for vulnerabilities (e.g., with Trivy or docker/scan-action) before pushing to GHCR
- Implement Docker Buildx caching using `actions/cache` and Buildx `--cache-from`/`--cache-to` options
- (Optional) Split backend and frontend builds into separate jobs for parallel execution and clearer logs
- Remove any commented-out or obsolete code

### Expected Improvements
- Performance score increases due to caching, parallelism, and multi-arch support
- Security score increases due to vulnerability scanning
- Correctness and maintainability improved by proper variable usage and modular workflow structure
- Workflow is robust, efficient, and secure, supporting modern CI/CD best practices