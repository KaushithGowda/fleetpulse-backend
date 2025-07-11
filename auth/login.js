// /@auth/login.js
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const { loginSchema } = require("../schemas/user");
const { signJwt } = require("../lib/jwt");

const prisma = new PrismaClient();

async function loginHandler(req, res) {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = signJwt({ id: user.id, email: user.email });

    return res.status(200).json({ user: { id: user.id, email: user.email }, token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  loginHandler,
};