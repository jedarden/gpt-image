## Reflection LS6

### Summary
The reviewed workflow at [.github/workflows/docker-ghcr.yml](.github/workflows/docker-ghcr.yml:1) demonstrates a high level of maturity, leveraging advanced GitHub Actions features: multi-arch manifest builds, artifact reuse, robust tag extraction, persistent Docker cache, Trivy pinning, YAML anchors, job timeouts, and OIDC authentication. Security is strong, with no static secrets and no evidence of secret leakage. The workflow is well-commented and maintainable. However, several improvement opportunities remain for robustness, maintainability, and best practices.

### Top Issues

#### Issue 1: Duplicate Step IDs (`id: tag`) Overwritten in Each Job
**Severity**: Medium  
**Location**: [`docker-ghcr.yml`](.github/workflows/docker-ghcr.yml:134,197)  
**Description**:  
Both the backend and frontend jobs use `id: tag` for two different steps: the tag extraction and the image_ref output. This overwrites the previous step's outputs, making `${{ steps.tag.outputs.tag }}` ambiguous and potentially leading to incorrect references or hard-to-debug errors.

**Code Snippet**:
```yaml
- name: Extract image tag (robust, event-agnostic)
  id: tag
  ...
- name: Set image_ref output
  id: tag
  ...
```
**Recommended Fix**:
Use unique step IDs for each logical output, e.g., `id: extract_tag` and `id: image_ref`:
```yaml
- name: Extract image tag (robust, event-agnostic)
  id: extract_tag
  ...
- name: Set image_ref output
  id: image_ref
  ...
```
Update all references accordingly.

---

#### Issue 2: Trivy Scan May Scan Wrong Image Reference
**Severity**: High  
**Location**: [`docker-ghcr.yml`](.github/workflows/docker-ghcr.yml:82,133,198)  
**Description**:  
The Trivy scan step uses `${{ steps.tag.outputs.image_ref }}` as the image reference, but the `tag` step is overwritten (see Issue 1). This can result in scanning the wrong image or failing to scan at all.

**Code Snippet**:
```yaml
with:
  image-ref: ${{ steps.tag.outputs.image_ref }}
```
**Recommended Fix**:
After fixing Issue 1, reference the correct step output:
```yaml
with:
  image-ref: ${{ steps.image_ref.outputs.image_ref }}
```

---

#### Issue 3: Docker Build Cache Key Not Sufficiently Granular
**Severity**: Medium  
**Location**: [`docker-ghcr.yml`](.github/workflows/docker-ghcr.yml:110,173)  
**Description**:  
The cache key uses `${{ github.sha }}` which changes on every commit, resulting in poor cache reuse. The restore-keys help, but optimal cache usage would include a hash of relevant files (e.g., Dockerfile, package.json) to maximize cache hits for unchanged dependencies.

**Code Snippet**:
```yaml
key: ${{ runner.os }}-buildx-backend-${{ github.sha }}
restore-keys: |
  ${{ runner.os }}-buildx-backend-
```
**Recommended Fix**:
Use a hash of Dockerfile and dependency files:
```yaml
key: ${{ runner.os }}-buildx-backend-${{ hashFiles('backend/Dockerfile', 'backend/package-lock.json') }}
restore-keys: |
  ${{ runner.os }}-buildx-backend-
```
Repeat for frontend.

---

#### Issue 4: No Trivy Report Artifact Upload
**Severity**: Medium  
**Location**: [`docker-ghcr.yml`](.github/workflows/docker-ghcr.yml:79-89,201)  
**Description**:  
Trivy scan results are not uploaded as workflow artifacts. This limits post-run review and auditability, especially if a scan fails.

**Code Snippet**:
```yaml
- name: Scan image for vulnerabilities (Trivy)
  uses: aquasecurity/trivy-action@v0.49.0
  ...
```
**Recommended Fix**:
Add a step to upload the Trivy report as an artifact:
```yaml
- name: Upload Trivy scan report
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: trivy-report-backend
    path: trivy-report.txt
```
Configure Trivy to output to a file.

---

#### Issue 5: No Explicit Fallback for Tag Extraction on Unusual Refs
**Severity**: Low  
**Location**: [`docker-ghcr.yml`](.github/workflows/docker-ghcr.yml:53-75)  
**Description**:  
The tag extraction logic is robust, but for non-standard refs (e.g., feature branches with slashes or unusual characters), the fallback may produce tags that are not valid Docker tags.

**Code Snippet**:
```bash
REF_NAME="${GITHUB_REF#refs/*/}"
TAG="${REF_NAME//\//-}"
```
**Recommended Fix**:
Sanitize the tag further to remove or replace any characters not allowed in Docker tags (e.g., uppercase, special symbols).

---

### Style Recommendations

- Use consistent and descriptive step IDs throughout.
- Consider grouping repeated logic into reusable composite actions for maintainability.
- Keep YAML anchors organized and documented at the top for easier reference.

### Optimization Opportunities

- Use more granular cache keys for Docker build cache to maximize reuse.
- Consider parallelizing jobs if build resources allow.
- Use matrix builds for additional architectures if needed in the future.

### Security Considerations

- OIDC authentication is correctly used; no static secrets are present.
- No secrets are echoed or exposed in logs.
- Ensure Trivy and other third-party actions are pinned to trusted versions.