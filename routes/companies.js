const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const { companySchema } = require("../schemas/company");
const { requireAuth } = require("../middleware/auth");

const prisma = new PrismaClient();

// Helper to format Zod errors
const formatZodErrors = (issues) =>
  issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));

// Create Company
router.post("/", requireAuth, async (req, res) => {
  const parsed = companySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: formatZodErrors(parsed.error.issues) });
  }

  const existingReg = await prisma.company.findFirst({
    where: {
      registrationNumber: parsed.data.registrationNumber,
      userId: req.user.id,
    },
  });

  if (existingReg) {
    return res.status(400).json({ error: [{ path: "registrationNumber", message: "Registration number already exists" }] });
  }

  try {
    const company = await prisma.company.create({
      data: {
        ...parsed.data,
        userId: req.user.id,
        establishedOn: new Date(parsed.data.establishedOn),
      },
    });

    return res.status(201).json(company);
  } catch (err) {
    console.error("[Create Company Error]", err);
    return res.status(500).json({ error: [{ path: "server", message: "Could not create company" }] });
  }
});

// Get All Companies (Search + Pagination)
router.get("/", requireAuth, async (req, res) => {
  const { search = "", limit = 10, offset = 0 } = req.query;

  const whereClause = {
    userId: req.user.id,
    ...(search && {
      OR: [
        { companyName: { contains: search, mode: "insensitive" } },
        { website: { contains: search, mode: "insensitive" } },
        { primaryFirstName: { contains: search, mode: "insensitive" } },
        { primaryLastName: { contains: search, mode: "insensitive" } },
        { primaryEmail: { contains: search, mode: "insensitive" } },
        { primaryMobile: { contains: search, mode: "insensitive" } },
        { registrationNumber: { contains: search, mode: "insensitive" } },
        { country: { contains: search, mode: "insensitive" } },
        { state: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
        { zipCode: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  try {
    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where: whereClause,
        skip: Number(offset),
        take: Number(limit),
        orderBy: { createdAt: "desc" },
      }),
      prisma.company.count({ where: whereClause }),
    ]);

    return res.status(200).json({ data: companies, total });
  } catch (err) {
    console.error("[Get Companies Error]", err);
    return res.status(500).json({ error: [{ path: "server", message: "Failed to fetch companies" }] });
  }
});

// Update Company
router.put("/:id", requireAuth, async (req, res) => {
  const parsed = companySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: formatZodErrors(parsed.error.issues) });
  }

  try {
    const existing = await prisma.company.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({ error: [{ path: "company", message: "Company not found or unauthorized" }] });
    }

    const duplicateReg = await prisma.company.findFirst({
      where: {
        registrationNumber: parsed.data.registrationNumber,
        userId: req.user.id,
        NOT: { id: req.params.id },
      },
    });

    if (duplicateReg) {
      return res.status(400).json({ error: [{ path: "registrationNumber", message: "Registration number already exists" }] });
    }

    const company = await prisma.company.update({
      where: { id: req.params.id },
      data: {
        ...parsed.data,
        establishedOn: new Date(parsed.data.establishedOn),
      },
    });

    return res.status(200).json(company);
  } catch (err) {
    console.error("[Update Company Error]", err);
    return res.status(500).json({ error: [{ path: "server", message: "Could not update company" }] });
  }
});

// Delete Company
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const existing = await prisma.company.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({ error: [{ path: "company", message: "Company not found or unauthorized" }] });
    }

    await prisma.company.delete({ where: { id: req.params.id } });

    return res.status(200).json({ message: "Company deleted successfully" });
  } catch (err) {
    console.error("[Delete Company Error]", err);
    return res.status(500).json({ error: [{ path: "server", message: "Could not delete company" }] });
  }
});

module.exports = router;