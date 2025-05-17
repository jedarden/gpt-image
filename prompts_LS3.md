## Prompt [LS1_1]

### Context
The backend for this project is a Node.js/TypeScript/Express application located in the `backend/` directory. It uses TypeScript (see [`backend/tsconfig.json`](backend/tsconfig.json:1)), Jest with ts-jest for testing (see [`backend/jest.config.js`](backend/jest.config.js:1)), and includes tests in `backend/tests/` that require supertest and jest. Reflection on the previous layer identified missing or incomplete backend test coverage (especially for error handling, validation, security, and 404s), and recommended explicit use of supertest, jest, and rate limiting middleware (e.g., express-rate-limit). The backend must never expose API keys and should be production-ready.

### Task
Restore or create a correct `backend/package.json` for the backend codebase. The file must be fully compatible with the backend's TypeScript and Jest setup, and support robust development, testing, and production workflows.

### Requirements
- Include all required dependencies for a Node.js/TypeScript/Express backend:
  - `express`
  - `axios`
  - `express-rate-limit` (for rate limiting)
- Include all required devDependencies:
  - `typescript`
  - `ts-node`
  - `nodemon` (for development, if preferred)
  - `jest`
  - `ts-jest`
  - `supertest`
  - `@types/express`
  - `@types/node`
  - `@types/jest`
  - `@types/supertest`
- Add any other dependencies or devDependencies required for compatibility with the backend's codebase and test setup.
- Define the following npm scripts:
  - `"dev"`: Run the backend in development mode using `ts-node` or `nodemon` with TypeScript.
  - `"build"`: Compile TypeScript to JavaScript using `tsc`.
  - `"start"`: Run the compiled backend using `node` from the build output directory.
  - `"test"`: Run all backend tests using `jest` (ensure compatibility with ts-jest and the test directory structure).
- Ensure all scripts and dependencies are compatible with the TypeScript configuration in [`backend/tsconfig.json`](backend/tsconfig.json:1) and the Jest setup in [`backend/jest.config.js`](backend/jest.config.js:1).
- Add documentation/comments in the `package.json` (using the `"//"` property or similar) to explain the purpose of each script and any non-obvious dependencies.
- The `package.json` should be valid, well-formatted, and ready for use with `npm install` and the defined scripts.

### Previous Issues
- Previous backend/package.json files were missing required dependencies for testing (jest, supertest, ts-jest), rate limiting (express-rate-limit), and TypeScript compatibility.
- Npm scripts were sometimes incomplete or not aligned with the actual backend structure and configuration.
- Lack of documentation in package.json made it harder to understand the purpose of scripts and dependencies.

### Expected Output
A complete, valid `backend/package.json` file that:
- Includes all required dependencies and devDependencies for the backend's codebase, TypeScript, and test setup.
- Defines the required npm scripts for development, build, production, and testing.
- Contains documentation/comments for scripts and key dependencies.
- Is ready for immediate use in the backend directory.