const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const { companySchema } = require("../schemas/company");
const { requireAuth } = require("../middleware/auth");

const prisma = new PrismaClient();

// Create Company
router.post("/", requireAuth, async (req, res) => {
  const parsed = companySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  try {
    const company = await prisma.company.create({
      data: {
        ...parsed.data,
        userId: req.user.id,
        establishedOn: new Date(parsed.data.establishedOn),
      },
    });

    res.status(201).json(company);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not create company" });
  }
});

// Get All Companies (Search + Pagination)
router.get("/", requireAuth, async (req, res) => {
  const { search = "", limit = 10, offset = 0 } = req.query;

  try {
    const companies = await prisma.company.findMany({
      where: {
        userId: req.user.id,
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { city: { contains: search, mode: "insensitive" } },
            { state: { contains: search, mode: "insensitive" } },
            { contactEmail: { contains: search, mode: "insensitive" } },
            { contactMobile: { contains: search, mode: "insensitive" } },
            { registrationNumber: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
      skip: Number(offset),
      take: Number(limit),
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.company.count({
      where: {
        userId: req.user.id,
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { city: { contains: search, mode: "insensitive" } },
            { state: { contains: search, mode: "insensitive" } },
            { contactEmail: { contains: search, mode: "insensitive" } },
            { contactMobile: { contains: search, mode: "insensitive" } },
            { registrationNumber: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
    });

    res.json({ data: companies, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch companies" });
  }
});

// Update Company
router.put("/:id", requireAuth, async (req, res) => {
  const parsed = companySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  try {
    const existing = await prisma.company.findUnique({
      where: { id: req.params.id },
    });

    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({ error: "Company not found or unauthorized" });
    }

    const company = await prisma.company.update({
      where: { id: req.params.id },
      data: {
        ...parsed.data,
        establishedOn: new Date(parsed.data.establishedOn),
      },
    });

    res.json(company);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not update company" });
  }
});

// Delete Company
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const existing = await prisma.company.findUnique({
      where: { id: req.params.id },
    });

    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({ error: "Company not found or unauthorized" });
    }

    const deleted = await prisma.company.delete({
      where: { id: req.params.id },
    });

    res.json({ success: true, message: "Company deleted", deleted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not delete company" });
  }
});

module.exports = router;