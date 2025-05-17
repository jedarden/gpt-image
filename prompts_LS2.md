## Prompt LS2_1

### Context
Layer LS1 for the `/api/generate-image` backend feature revealed critical TypeScript and configuration issues that block testability and correctness. The critic reflection identified:
- Incorrect or incomplete imports for axios and its types
- `axios.create()` called without a config object
- Missing type declarations for supertest in tests
- Incomplete environment variable documentation and validation
- Potential gaps in `tsconfig.json` for type inclusion
- Dependency installation/version mismatches

Quantitative scores for LS1 were low: overall 54, coverage 0, correctness 50, security 70. No improvement (Δ=0) was observed, and test coverage is 0 due to type and config errors preventing test execution.

### Objective
Unblock testability and correctness for `/api/generate-image` by resolving TypeScript, configuration, and dependency issues, enabling tests to compile and run.

### Focus Areas
- Fix TypeScript/axios import and config issues
- Add missing type declarations for supertest
- Update environment variable documentation and validation
- Adjust tsconfig.json for proper type inclusion
- Ensure all dependencies are installed and compatible

### Code Reference
```typescript
// backend/services/openaiImageService.ts
import axios, { AxiosInstance } from 'axios';
this.httpClient = httpClient || axios.create();

// backend/tests/pipeline.test.ts
import request from "supertest";

// backend/services/openaiImageService.ts
this.apiKey = apiKey || process.env.OPENAI_API_KEY || '';
if (!this.apiKey) {
  throw new Error('OpenAI API key is missing. Set the OPENAI_API_KEY environment variable.');
}

// backend/tsconfig.json
// Ensure "types": ["node", "jest", "supertest"] is included in compilerOptions
```

### Requirements
- Ensure both `axios` and `@types/axios` are installed and compatible; fix imports as needed.
- Pass an explicit config object to `axios.create({})`.
- Install `@types/supertest` as a dev dependency and verify type inclusion in `tsconfig.json`.
- Document required environment variables in `.env.example` and validate them at app startup.
- Update `tsconfig.json` to include all necessary types for backend and tests.
- Run `npm install` to ensure all dependencies are present and compatible.

### Expected Improvements
- TypeScript compiles without errors for backend and tests
- Tests compile and are runnable (coverage > 0)
- Environment variable requirements are clearly documented and validated
- All dependencies are installed and compatible
- Correctness and security scores increase in the next layer