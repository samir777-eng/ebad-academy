import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import {
  MAX_BODY_SIZE,
  validateRequestSize,
  validateContentType,
  validateJsonRequest,
} from '../request-validation';

// Helper to create mock NextRequest
function createMockRequest(options: {
  contentLength?: string;
  contentType?: string;
  body?: any;
  url?: string;
}): NextRequest {
  const headers = new Headers();
  if (options.contentLength) {
    headers.set('content-length', options.contentLength);
  }
  if (options.contentType) {
    headers.set('content-type', options.contentType);
  }

  const request = new NextRequest(options.url || 'http://localhost:3000/api/test', {
    method: 'POST',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  return request;
}

describe('MAX_BODY_SIZE', () => {
  it('should have correct size limits', () => {
    expect(MAX_BODY_SIZE.DEFAULT).toBe(1 * 1024 * 1024); // 1MB
    expect(MAX_BODY_SIZE.FILE_UPLOAD).toBe(10 * 1024 * 1024); // 10MB
    expect(MAX_BODY_SIZE.LARGE_CONTENT).toBe(5 * 1024 * 1024); // 5MB
  });
});

describe('validateRequestSize', () => {
  it('should allow requests within size limit', async () => {
    const request = createMockRequest({
      contentLength: '1000', // 1KB
    });

    const result = await validateRequestSize(request);
    expect(result).toBeNull();
  });

  it('should reject requests exceeding size limit', async () => {
    const request = createMockRequest({
      contentLength: String(2 * 1024 * 1024), // 2MB
    });

    const result = await validateRequestSize(request, MAX_BODY_SIZE.DEFAULT);
    expect(result).not.toBeNull();
    
    const json = await result!.json();
    expect(json.error).toBe('Request body too large');
    expect(result!.status).toBe(413);
  });

  it('should use custom max size', async () => {
    const request = createMockRequest({
      contentLength: '2000', // 2KB
    });

    const result = await validateRequestSize(request, 1000); // 1KB limit
    expect(result).not.toBeNull();
  });

  it('should allow requests without content-length header', async () => {
    const request = createMockRequest({});

    const result = await validateRequestSize(request);
    expect(result).toBeNull();
  });
});

describe('validateContentType', () => {
  it('should allow requests with correct content type', () => {
    const request = createMockRequest({
      contentType: 'application/json',
    });

    const result = validateContentType(request, ['application/json']);
    expect(result).toBeNull();
  });

  it('should allow requests with content type containing charset', () => {
    const request = createMockRequest({
      contentType: 'application/json; charset=utf-8',
    });

    const result = validateContentType(request, ['application/json']);
    expect(result).toBeNull();
  });

  it('should reject requests with wrong content type', async () => {
    const request = createMockRequest({
      contentType: 'text/plain',
    });

    const result = validateContentType(request, ['application/json']);
    expect(result).not.toBeNull();
    
    const json = await result!.json();
    expect(json.error).toBe('Invalid Content-Type');
    expect(result!.status).toBe(415);
  });

  it('should reject requests without content type', async () => {
    const request = createMockRequest({});

    const result = validateContentType(request, ['application/json']);
    expect(result).not.toBeNull();
    
    const json = await result!.json();
    expect(json.error).toBe('Content-Type header is required');
    expect(result!.status).toBe(400);
  });

  it('should be case insensitive', () => {
    const request = createMockRequest({
      contentType: 'APPLICATION/JSON',
    });

    const result = validateContentType(request, ['application/json']);
    expect(result).toBeNull();
  });

  it('should allow multiple content types', () => {
    const request = createMockRequest({
      contentType: 'multipart/form-data',
    });

    const result = validateContentType(request, [
      'application/json',
      'multipart/form-data',
    ]);
    expect(result).toBeNull();
  });
});

describe('validateJsonRequest', () => {
  it('should validate and parse valid JSON request', async () => {
    const body = { name: 'test', value: 123 };
    const request = createMockRequest({
      contentType: 'application/json',
      contentLength: '100',
      body,
    });

    const result = await validateJsonRequest(request);
    
    if ('data' in result) {
      expect(result.data).toEqual(body);
    } else {
      throw new Error('Expected data, got error');
    }
  });

  it('should reject request with wrong content type', async () => {
    const request = createMockRequest({
      contentType: 'text/plain',
      contentLength: '100',
    });

    const result = await validateJsonRequest(request);
    
    expect('error' in result).toBe(true);
  });

  it('should reject request exceeding size limit', async () => {
    const request = createMockRequest({
      contentType: 'application/json',
      contentLength: String(2 * 1024 * 1024), // 2MB
    });

    const result = await validateJsonRequest(request, MAX_BODY_SIZE.DEFAULT);
    
    expect('error' in result).toBe(true);
  });
});

