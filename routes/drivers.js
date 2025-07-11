const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const { driverSchema } = require("../schemas/driver");
const { requireAuth } = require("../middleware/auth");

const prisma = new PrismaClient();

// Create Driver
router.post("/", requireAuth, async (req, res) => {
  const parsed = driverSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
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

    res.status(201).json(driver);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not create driver" });
  }
});

// Get All Drivers (Search + Pagination)
router.get("/", requireAuth, async (req, res) => {
  const { search = "", limit = 10, offset = 0 } = req.query;

  try {
    const drivers = await prisma.driver.findMany({
      where: {
        userId: req.user.id,
        ...(search && {
          OR: [
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { mobile: { contains: search, mode: "insensitive" } },
            { city: { contains: search, mode: "insensitive" } },
            { state: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
      skip: Number(offset),
      take: Number(limit),
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.driver.count({
      where: {
        userId: req.user.id,
        ...(search && {
          OR: [
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { mobile: { contains: search, mode: "insensitive" } },
            { city: { contains: search, mode: "insensitive" } },
            { state: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
    });

    res.json({ data: drivers, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch drivers" });
  }
});

// Update Driver
router.put("/:id", requireAuth, async (req, res) => {
  const parsed = driverSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  try {
    const existing = await prisma.driver.findUnique({
      where: { id: req.params.id },
    });

    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({ error: "Driver not found or unauthorized" });
    }

    const driver = await prisma.driver.update({
      where: { id: req.params.id },
      data: {
        ...parsed.data,
        licenseStartDate: new Date(parsed.data.licenseStartDate),
        dateOfBirth: new Date(parsed.data.dateOfBirth),
      },
    });

    res.json(driver);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not update driver" });
  }
});

// Delete Driver
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const existing = await prisma.driver.findUnique({
      where: { id: req.params.id },
    });

    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({ error: "Driver not found or unauthorized" });
    }

    await prisma.driver.delete({
      where: { id: req.params.id },
    });

    res.status(200).json({ message: "Driver deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not delete driver" });
  }
});

module.exports = router;