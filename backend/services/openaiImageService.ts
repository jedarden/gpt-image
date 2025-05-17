/**
 * OpenAI Image Generation Service
 * Provides a function to generate images using the OpenAI DALL·E API.
 * The API key is loaded securely from the environment variable OPENAI_API_KEY.
 * The service is modular and testable.
 *
 * Example usage:
 *   import { generateImage } from './openaiImageService';
 *   const imageUrl = await generateImage('A cat riding a bicycle');
 */

import axios from 'axios';

const OPENAI_API_URL = 'https://api.openai.com/v1/images/generations';

export interface OpenAIImageResult {
  imageUrl: string;
}

export class OpenAIImageService {
  private apiKey: string;
  private httpClient: any;

  /**
   * @param apiKey - OpenAI API key (injected for testability; defaults to process.env.OPENAI_API_KEY)
   * @param httpClient - Optional Axios instance for dependency injection/testing
   */
  constructor(apiKey?: string, httpClient?: any) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('OpenAI API key is missing. Set the OPENAI_API_KEY environment variable.');
    }
    this.httpClient = httpClient || axios.create({});
  }

  /**
   * Generates an image from a text prompt using the OpenAI DALL·E API.
   * @param prompt - The text prompt describing the desired image.
   * @returns {Promise<OpenAIImageResult>} - The image URL.
   * @throws {Error} - Throws on network/auth/quota errors with safe messages.
   */
  async generateImage(prompt: string): Promise<OpenAIImageResult> {
    try {
      const response = await this.httpClient.post(
        OPENAI_API_URL,
        {
          prompt,
          n: 1,
          size: '512x512',
          response_format: 'url'
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      if (
        response.data &&
        Array.isArray(response.data.data) &&
        response.data.data.length > 0 &&
        typeof response.data.data[0].url === 'string'
      ) {
        return { imageUrl: response.data.data[0].url };
      } else {
        throw new Error('Invalid response from OpenAI API');
      }
    } catch (err: any) {
      // Never log or expose the API key
      if (err.response) {
        // OpenAI API returned an error response
        const status = err.response.status;
        if (status === 401 || status === 403) {
          throw new Error('OpenAI authentication failed. Check your API key.');
        } else if (status === 429) {
          throw new Error('OpenAI API quota exceeded.');
        } else if (status >= 500 && status < 600) {
          throw new Error('OpenAI service is currently unavailable.');
        } else {
          throw new Error('OpenAI API error: ' + (err.response.data?.error?.message || 'Unknown error'));
        }
      } else if (err.code === 'ECONNABORTED' || err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
        throw new Error('Network error: Unable to reach OpenAI API.');
      } else {
        throw new Error('Unexpected error: ' + (err.message || 'Unknown error'));
      }
    }
  }
}

// Default instance for use in route handlers
export const openAIImageService = new OpenAIImageService();