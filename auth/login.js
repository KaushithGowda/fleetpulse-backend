// /@auth/login.js
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const { loginSchema } = require("../schemas/user");
const { signJwt } = require("../lib/jwt");

const prisma = new PrismaClient();

async function loginHandler(req, res) {
  console.log("[LOGIN] Request received", req.body);

  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      const errorList = parsed.error.issues.map(issue => ({
        path: issue.path.join("."),
        message: issue.message,
      }));
      console.error("[LOGIN] Validation errors:", errorList);
      return res.status(400).json({ error: errorList });
    }

    const { email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      console.warn("[LOGIN] Invalid email:", normalizedEmail);
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      console.warn("[LOGIN] Invalid password for:", normalizedEmail);
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = signJwt({ id: user.id, email: user.email });
    console.log("[LOGIN] Success for:", user.email);

    return res.status(200).json({ user: { id: user.id, email: user.email }, token });
  } catch (err) {
    console.error("[LOGIN] Internal error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  loginHandler,
};