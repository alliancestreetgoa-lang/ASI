import { describe, it, expect } from 'vitest';
import { createContactSubmissionSchema, insertUserSchema } from '@shared/schema';
import { z } from 'zod';

describe('Schema Validation', () => {
  describe('Contact Submission Schema', () => {
    it('validates valid contact submission data', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        company: 'Acme Corp',
        service: 'accounting',
        message: 'I need help with my accounting',
      };

      const result = createContactSubmissionSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('rejects missing required fields', () => {
      const invalidData = {
        name: 'John Doe',
        // missing email, company, service, message
      };

      const result = createContactSubmissionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('accepts any string for email field', () => {
      const dataWithInvalidEmail = {
        name: 'John Doe',
        email: 'not-an-email',
        company: 'Acme Corp',
        service: 'accounting',
        message: 'Help needed',
      };

      const result = createContactSubmissionSchema.safeParse(dataWithInvalidEmail);
      expect(result.success).toBe(true);
    });

    it('requires name to be present', () => {
      const invalidData = {
        email: 'john@example.com',
        company: 'Acme Corp',
        service: 'accounting',
        message: 'Help needed',
      };

      const result = createContactSubmissionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('User Schema', () => {
    it('validates valid user data', () => {
      const validData = {
        username: 'johndoe',
        password: 'securePassword123',
      };

      const result = insertUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('rejects missing username', () => {
      const invalidData = {
        password: 'securePassword123',
      };

      const result = insertUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('rejects missing password', () => {
      const invalidData = {
        username: 'johndoe',
      };

      const result = insertUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
