const { z } = require("zod");

const registerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.email("Invalid email").min(5).max(50),
  password: z.string().min(6, "Password too short").max(50),
});

const loginSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(6, "Password too short"),
});

module.exports = {
  registerSchema,
  loginSchema,
};