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
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const { name, email, password } = parsed.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    const token = signJwt({ id: user.id, email: user.email });

    return res.status(201).json({ user: { id: user.id, email: user.email }, token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  registerHandler,
};