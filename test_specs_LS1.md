# Test Specifications for `/api/generate-image` Backend Route

These test specifications define the required behaviors and edge cases for the backend route that generates images using the OpenAI DALL·E API, as described in [`prompts_LS1.md`](prompts_LS1.md). The tests are organized by functional area and serve as executable specifications for TDD.

---

## 1. Valid Input and Successful Image Generation

### 1.1. Should generate an image when given a valid prompt
- **Arrange:** Prepare a POST request to `/api/generate-image` with a valid JSON body: `{ "prompt": "A cat riding a bicycle" }`.
- **Act:** Send the request.
- **Assert:** 
  - Response status is `200 OK`.
  - Response body contains a valid image URL or image data.
  - Response content type is `application/json` (if URL) or appropriate image MIME type (if binary).
  - The image corresponds to the prompt (mock or stub OpenAI API for deterministic output in tests).

### 1.2. Should only accept POST requests
- **Arrange:** Prepare a GET request to `/api/generate-image`.
- **Act:** Send the request.
- **Assert:** 
  - Response status is `405 Method Not Allowed` or similar.
  - Response body contains an appropriate error message.

---

## 2. Invalid Input Handling

### 2.1. Should return error for missing prompt field
- **Arrange:** POST to `/api/generate-image` with `{}` or missing `prompt`.
- **Act:** Send the request.
- **Assert:** 
  - Response status is `400 Bad Request`.
  - Error message indicates missing or invalid prompt.

### 2.2. Should return error for empty prompt string
- **Arrange:** POST with `{ "prompt": "" }`.
- **Act:** Send the request.
- **Assert:** 
  - Response status is `400 Bad Request`.
  - Error message indicates prompt cannot be empty.

### 2.3. Should return error for non-string prompt
- **Arrange:** POST with `{ "prompt": 123 }` or `{ "prompt": null }`.
- **Act:** Send the request.
- **Assert:** 
  - Response status is `400 Bad Request`.
  - Error message indicates prompt must be a string.

---

## 3. OpenAI API Error Handling

### 3.1. Should handle OpenAI API network failures gracefully
- **Arrange:** Simulate network failure when calling OpenAI API.
- **Act:** POST with valid prompt.
- **Assert:** 
  - Response status is `502 Bad Gateway` or `503 Service Unavailable`.
  - Error message indicates external service failure.
  - No sensitive information is leaked.

### 3.2. Should handle invalid or missing OpenAI API key
- **Arrange:** Simulate invalid API key error from OpenAI.
- **Act:** POST with valid prompt.
- **Assert:** 
  - Response status is `500 Internal Server Error` or `401 Unauthorized`.
  - Error message indicates authentication failure.
  - API key is not exposed in response or logs.

### 3.3. Should handle OpenAI API quota exceeded
- **Arrange:** Simulate quota exceeded error from OpenAI.
- **Act:** POST with valid prompt.
- **Assert:** 
  - Response status is `429 Too Many Requests`.
  - Error message indicates quota exceeded.

### 3.4. Should handle unexpected server errors
- **Arrange:** Simulate an unhandled exception in the route handler.
- **Act:** POST with valid prompt.
- **Assert:** 
  - Response status is `500 Internal Server Error`.
  - Error message is generic and does not leak sensitive details.

---

## 4. Security

### 4.1. Should never expose the OpenAI API key in any response
- **Arrange:** Trigger all error and success scenarios.
- **Act:** Inspect all responses.
- **Assert:** 
  - No response contains the API key or any sensitive configuration.

### 4.2. Should never log the OpenAI API key
- **Arrange:** Enable server logging and trigger all code paths (success, error).
- **Act:** Inspect logs.
- **Assert:** 
  - API key is never present in logs (including error logs).

### 4.3. Should load API key from environment variable only
- **Arrange:** Remove or change the environment variable.
- **Act:** Start server and attempt to use the route.
- **Assert:** 
  - If the variable is missing, the server fails securely (e.g., startup error or 500 on route).
  - API key is not hardcoded in the codebase.

---

## 5. Response Structure and Content Type

### 5.1. Should return correct response schema on success
- **Arrange:** POST with valid prompt.
- **Act:** Send the request.
- **Assert:** 
  - Response body matches documented schema (e.g., `{ "imageUrl": "..." }`).
  - Content type is `application/json`.

### 5.2. Should return correct error response schema
- **Arrange:** Trigger each error scenario.
- **Act:** Send the request.
- **Assert:** 
  - Error responses include a clear `error` field/message.
  - Content type is `application/json`.

### 5.3. Should set appropriate CORS headers (if applicable)
- **Arrange:** Send request from different origins.
- **Act:** Inspect response headers.
- **Assert:** 
  - CORS headers are present and correct as per project requirements.

---

## 6. Example Unit Test for Service Layer

### 6.1. Should call OpenAI API with correct parameters
- **Arrange:** Mock OpenAI API client.
- **Act:** Call image generation service with a sample prompt.
- **Assert:** 
  - Service calls OpenAI API with the expected prompt and parameters.
  - Service returns the expected result or error.

---

## 7. Documentation and Example Usage

### 7.1. API documentation and usage example are up to date
- **Arrange:** Review API documentation and example usage.
- **Act:** Compare with actual route behavior and response.
- **Assert:** 
  - Documentation matches implemented behavior, including request/response schema and error cases.

---

## Notes

- All tests must be isolated and not depend on external state.
- Sensitive information (API keys, internal errors) must never be exposed in responses or logs.
- Test coverage should include all branches and error paths.
- These specifications serve as the basis for automated tests and manual QA.