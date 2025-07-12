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
      const errorList = parsed.error.issues.map(issue => ({
        path: issue.path.join("."),
        message: issue.message,
      }));
      return res.status(400).json({ error: errorList });
    }

    const { email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      return res.status(400).json({ error: [{ path: 'email', message: 'Invalid credentials' }] });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ error: [{ path: 'password', message: 'Invalid credentials' }] });
    }

    const token = signJwt({ id: user.id, email: user.email });

    return res.status(200).json({ user: { id: user.id, email: user.email }, token });
  } catch (err) {
    return res.status(500).json({ error: [{ path: 'server', message: 'Internal Server Error' }] });
  }
}

module.exports = {
  loginHandler,
};