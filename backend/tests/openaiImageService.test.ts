/**
 * Unit tests for OpenAIImageService (service layer for image generation)
 * Mocks HTTP client to avoid real OpenAI API calls.
 */

import { OpenAIImageService } from '../services/openaiImageService';

describe('OpenAIImageService', () => {
  it('should call OpenAI API with correct parameters and return imageUrl', async () => {
    // Arrange: mock Axios instance
    const mockPost = jest.fn().mockResolvedValue({
      data: {
        data: [{ url: 'https://fake-image-url.com/image.png' }]
      }
    });
    const mockHttpClient = { post: mockPost } as any;
    const service = new OpenAIImageService('test-api-key', mockHttpClient);

    // Act
    const result = await service.generateImage('A cat riding a bicycle');

    // Assert
    expect(mockPost).toHaveBeenCalledWith(
      'https://api.openai.com/v1/images/generations',
      {
        prompt: 'A cat riding a bicycle',
        n: 1,
        size: '512x512',
        response_format: 'url'
      },
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-api-key'
        })
      })
    );
    expect(result).toEqual({ imageUrl: 'https://fake-image-url.com/image.png' });
  });

  it('should throw on OpenAI API auth error', async () => {
    const mockPost = jest.fn().mockRejectedValue({
      response: { status: 401 }
    });
    const service = new OpenAIImageService('bad-key', { post: mockPost } as any);
    await expect(service.generateImage('test')).rejects.toThrow(/authentication failed/i);
  });

  it('should throw on OpenAI API quota error', async () => {
    const mockPost = jest.fn().mockRejectedValue({
      response: { status: 429 }
    });
    const service = new OpenAIImageService('quota-key', { post: mockPost } as any);
    await expect(service.generateImage('test')).rejects.toThrow(/quota exceeded/i);
  });

  it('should throw on network error', async () => {
    const mockPost = jest.fn().mockRejectedValue({ code: 'ENOTFOUND' });
    const service = new OpenAIImageService('net-key', { post: mockPost } as any);
    await expect(service.generateImage('test')).rejects.toThrow(/network error/i);
  });

  it('should throw on invalid/missing API key at construction', () => {
    expect(() => new OpenAIImageService('')).toThrow(/api key is missing/i);
  });
});