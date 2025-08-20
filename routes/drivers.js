const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const { driverSchema } = require("../schemas/driver");
const { requireAuth } = require("../middleware/auth");

const prisma = new PrismaClient();

// Helper for formatting Zod errors
const formatZodErrors = (issues) =>
  issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));

// Create Driver
router.post("/", requireAuth, async (req, res) => {
  const parsed = driverSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: formatZodErrors(parsed.error.issues) });
  }

  try {
    const existingEmail = await prisma.driver.findFirst({
      where: {
        email: parsed.data.email,
        userId: req.user.id,
      },
    });
    
    if (existingEmail) {
      return res.status(400).json({ error: [{ path: "email", message: "Email already exists" }] });
    }
  } catch (error) {
    console.log(error);
  }


  const existingLicense = await prisma.driver.findFirst({
    where: {
      licenseNumber: parsed.data.licenseNumber,
      userId: req.user.id,
    },
  });

  if (existingLicense) {
    return res.status(400).json({ error: [{ path: "licenseNumber", message: "License number already exists" }] });
  }

  try {
    const driver = await prisma.driver.create({
      data: {
        ...parsed.data,
        userId: req.user.id,
        licenseStartDate: new Date(parsed.data.licenseStartDate),
        dateOfBirth: new Date(parsed.data.dateOfBirth),
      },
    });

    return res.status(201).json(driver);
  } catch (err) {
    console.error("[Create Driver Error]", err);
    return res.status(500).json({ error: [{ path: "server", message: "Could not create driver" }] });
  }
});

// Get All Drivers (Search + Pagination)
router.get("/", requireAuth, async (req, res) => {
  const { search = "", limit = 10, offset = 0 } = req.query;

  const whereClause = {
    userId: req.user.id,
    ...(search && {
      OR: [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { mobile: { contains: search, mode: "insensitive" } },
        { licenseNumber: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
        { state: { contains: search, mode: "insensitive" } },
        { country: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  try {
    const drivers = await prisma.driver.findMany({
      where: whereClause,
      skip: Number(offset),
      take: Number(limit),
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.driver.count({ where: whereClause });

    return res.status(200).json({ data: drivers, total });
  } catch (err) {
    console.error("[Get Drivers Error]", err);
    return res.status(500).json({ error: [{ path: "server", message: "Failed to fetch drivers" }] });
  }
});

// Update Driver
router.put("/:id", requireAuth, async (req, res) => {
  const parsed = driverSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: formatZodErrors(parsed.error.issues) });
  }

  try {
    const existing = await prisma.driver.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({ error: [{ path: "driver", message: "Driver not found or unauthorized" }] });
    }

    const duplicateEmail = await prisma.driver.findFirst({
      where: {
        email: parsed.data.email,
        userId: req.user.id,
        NOT: { id: req.params.id },
      },
    });

    if (duplicateEmail) {
      return res.status(400).json({ error: [{ path: "email", message: "Email already exists" }] });
    }

    const duplicateLicense = await prisma.driver.findFirst({
      where: {
        licenseNumber: parsed.data.licenseNumber,
        userId: req.user.id,
        NOT: { id: req.params.id },
      },
    });

    if (duplicateLicense) {
      return res.status(400).json({ error: [{ path: "licenseNumber", message: "License number already exists" }] });
    }

    const driver = await prisma.driver.update({
      where: { id: req.params.id },
      data: {
        ...parsed.data,
        licenseStartDate: new Date(parsed.data.licenseStartDate),
        dateOfBirth: new Date(parsed.data.dateOfBirth),
      },
    });

    return res.status(200).json(driver);
  } catch (err) {
    console.error("[Update Driver Error]", err);
    return res.status(500).json({ error: [{ path: "server", message: "Could not update driver" }] });
  }
});

// Delete Driver
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const existing = await prisma.driver.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({ error: [{ path: "driver", message: "Driver not found or unauthorized" }] });
    }

    await prisma.driver.delete({ where: { id: req.params.id } });
    return res.status(200).json({ message: "Driver deleted successfully" });
  } catch (err) {
    console.error("[Delete Driver Error]", err);
    return res.status(500).json({ error: [{ path: "server", message: "Could not delete driver" }] });
  }
});

module.exports = router;