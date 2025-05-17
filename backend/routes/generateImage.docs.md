# `/api/generate-image` API Documentation

## Endpoint
- **URL:** `/api/generate-image`
- **Method:** `POST`
- **Content-Type:** `application/json`

## Request Body
```json
{
  "prompt": "A description of the image"
}
```
- `prompt` (string, required): The text prompt describing the desired image.

## Success Response
- **Status:** `200 OK`
- **Content-Type:** `application/json`
- **Body:**
```json
{
  "imageUrl": "https://..."
}
```
- `imageUrl`: URL of the generated image.

## Error Responses

| Status | Error Case                       | Example Body                                 |
|--------|----------------------------------|----------------------------------------------|
| 400    | Missing/invalid/empty prompt     | `{ "error": "The \"prompt\" field must be a string." }`<br>`{ "error": "The \"prompt\" field cannot be empty." }` |
| 405    | Method not allowed (not POST)    | `{ "error": "Method Not Allowed" }`          |
| 401    | OpenAI authentication failed     | `{ "error": "Authentication with image provider failed." }` |
| 429    | OpenAI quota exceeded            | `{ "error": "Image generation quota exceeded." }` |
| 502/503| OpenAI/network/service error     | `{ "error": "Image provider API error." }`<br>`{ "error": "Image provider service unavailable." }` |
| 500    | Internal server error            | `{ "error": "Internal server error" }`       |

- All error responses are JSON and include an `error` field.
- The OpenAI API key is **never** exposed in any response or log.

## Example Usage

```bash
curl -X POST http://localhost:8080/api/generate-image \
  -H "Content-Type: application/json" \
  -d '{"prompt": "A cat riding a bicycle"}'
```

## Environment Variables

- `OPENAI_API_KEY` (required): Your OpenAI API key. Must be set in the backend environment. Never expose this key to the frontend or in logs.

## Security Notes

- The API key is loaded from the environment and never hardcoded.
- The API key is never sent to the client or included in error messages/logs.
- All errors are handled to avoid leaking sensitive information.