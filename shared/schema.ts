import { pgTable, serial, varchar, timestamp, uuid } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// Users table
export const usersTable = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: varchar('username', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  created_at: timestamp('created_at').notNull().defaultNow(),
});

// Contact submissions table
export const contactSubmissionsTable = pgTable('contact_submissions', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  company: varchar('company', { length: 255 }),
  service: varchar('service', { length: 255 }),
  message: varchar('message', { length: 2000 }).notNull(),
  created_at: timestamp('created_at').notNull().defaultNow(),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(usersTable);
export const selectUserSchema = createSelectSchema(usersTable);
export type User = z.infer<typeof selectUserSchema>;

export const createContactSubmissionSchema = createInsertSchema(contactSubmissionsTable).pick({
  name: true,
  email: true,
  company: true,
  service: true,
  message: true,
});
export const selectContactSubmissionSchema = createSelectSchema(contactSubmissionsTable);
export type ContactSubmission = z.infer<typeof selectContactSubmissionSchema>;
export type CreateContactSubmission = z.infer<typeof createContactSubmissionSchema>;
