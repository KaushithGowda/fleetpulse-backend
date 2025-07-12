// /@auth/register.js
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const { registerSchema } = require("../schemas/user");
const { signJwt } = require("../lib/jwt");

const prisma = new PrismaClient();

async function registerHandler(req, res) {
  console.log("[REGISTER] Request received", req.body);

  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      const errorList = parsed.error.issues.map(issue => ({
        path: issue.path.join("."),
        message: issue.message,
      }));
      console.error("[REGISTER] Validation errors:", errorList);
      return res.status(400).json({ error: errorList });
    }

    const { name, email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      console.warn("[REGISTER] Email already in use:", normalizedEmail);
      return res.status(400).json({ error: "Email already in use" });
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
    console.log("[REGISTER] Success for:", user.email);

    return res.status(201).json({ user: { id: user.id, email: user.email }, token });
  } catch (err) {
    console.error("[REGISTER] Internal error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  registerHandler,
};