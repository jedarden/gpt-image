import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";

/**
 * Pipeline router for gpt-4.1-nano → gpt-image-1.
 * Handles secure API key usage and abstracts the two-model pipeline.
 */
const router = express.Router();

// Load API keys from environment (never expose to client)
const GPT4_API_KEY = process.env.GPT4_API_KEY;
const IMAGE_API_KEY = process.env.IMAGE_API_KEY;

router.post(
  "/",
  [
    body("prompt").isString().trim().notEmpty().withMessage("Prompt is required"),
    body("image").optional().isString().withMessage("Image must be a base64 string"),
    body("mask")
      .optional()
      .isString()
      .withMessage("Mask must be a base64 string")
      .custom((value) => {
        // Basic check: must be a base64-encoded PNG data URL
        if (!/^data:image\/png;base64,/.test(value)) {
          throw new Error("Mask must be a base64-encoded PNG");
        }
        // Optionally, check length (not too large)
        if (value.length > 2 * 1024 * 1024) {
          throw new Error("Mask is too large (max 2MB)");
        }
        return true;
      }),
  ],
  async (req: Request, res: Response) => {
    // Input validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: "Invalid input", details: errors.array() });
    }

    // Check API keys
    if (!GPT4_API_KEY || !IMAGE_API_KEY) {
      // Never leak key names or values
      return res.status(500).json({ error: "Server misconfiguration" });
    }

    try {
      const { prompt, image, mask } = req.body;

      // 1. Call gpt-4.1-nano (mocked)
      // In real implementation, use GPT4_API_KEY securely
      const gpt4Result = {
        orientation: "portrait",
        quality: "high",
        prompt: prompt,
        // ...other config
      };

      // 2. Call gpt-image-1 (mocked)
      // In real implementation, use IMAGE_API_KEY securely
      // For LS3: If mask is present, pass it to the model (mocked here)
      const imageResult = {
        imageUrl: "https://dummyimage.com/512x512/000/fff.png&text=Generated+Image",
        metadata: {
          orientation: gpt4Result.orientation,
          quality: gpt4Result.quality,
          maskUsed: !!mask,
          maskPreview: mask ? mask.slice(0, 32) + "..." : undefined, // For debugging, never return full mask
        },
      };

      // Return result (never include API keys or full mask)
      return res.json({
        image: imageResult.imageUrl,
        metadata: imageResult.metadata,
      });
    } catch (err) {
      // Log error server-side only
      // eslint-disable-next-line no-console
      console.error("Pipeline error:", err);
      return res.status(500).json({ error: "Pipeline processing failed" });
    }
  }
);

export default router;