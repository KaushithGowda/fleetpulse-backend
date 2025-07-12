// user.js
const { z } = require("zod");

const loginSchema = z.object({
  email: z
    .email('Invalid email')
    .min(5, 'Email too short')
    .max(50, 'Email too long'),

  password: z
    .string()
    .min(6, 'Password too short')
    .max(50, 'Password too long')
    .regex(/^[a-zA-Z0-9]*$/, 'Password must be alphanumeric'),
});

const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name is too short')
    .max(50, 'Name too long'),

  email: z
    .email('Invalid email')
    .min(5, 'Email too short')
    .max(50, 'Email too long'),

  password: z
    .string()
    .min(6, 'Password too short')
    .max(50, 'Password too long')
    .regex(/^[a-zA-Z0-9]*$/, 'Password must be alphanumeric'),
});

module.exports = {
  loginSchema,
  registerSchema,
};