// /@auth/register.js
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const { registerSchema } = require("../schemas/user");
const { signJwt } = require("../lib/jwt");

const prisma = new PrismaClient();

async function registerHandler(req, res) {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      const errorList = parsed.error.issues.map(issue => ({
        path: issue.path.join("."),
        message: issue.message,
      }));
      return res.status(400).json({ error: errorList });
    }

    const { name, email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      return res.status(400).json({
        error: [{ path: "email", message: "Email already in use" }],
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
      },
    });

    const token = signJwt({ id: user.id, email: user.email });

    return res.status(201).json({ user: { id: user.id, email: user.email }, token });
  } catch (err) {
    return res.status(500).json({ error: [{ path: "server", message: "Internal Server Error" }] });
  }
}

module.exports = {
  registerHandler,
};