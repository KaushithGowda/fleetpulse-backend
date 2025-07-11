

const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const { requireAuth } = require("../middleware/auth");

const prisma = new PrismaClient();
const getStartOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay() || 7;
  if (day !== 1) d.setHours(-24 * (day - 1));
  d.setHours(0, 0, 0, 0);
  return d;
};

const getWeekOfMonth = (date) => {
  const startWeek = getStartOfWeek(new Date(date.getFullYear(), date.getMonth(), 1));
  const currentWeek = getStartOfWeek(date);
  return Math.floor((currentWeek - startWeek) / (7 * 24 * 60 * 60 * 1000)) + 1;
};

router.get("/", requireAuth, async (req, res) => {
  const userId = req.user.id;
  const now = new Date();

  try {
    const [latestCompany] = await prisma.company.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 1,
    });

    const [latestDriver] = await prisma.driver.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 1,
    });

    const totalCompanies = await prisma.company.count({ where: { userId } });
    const totalDrivers = await prisma.driver.count({ where: { userId } });

    const companyData = await prisma.company.findMany({ where: { userId } });
    const driverData = await prisma.driver.findMany({ where: { userId } });

    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const week = Array(7).fill(0);
    const month = Array(5).fill(0);
    const year = Array(12).fill(0);

    const companyStats = { week: [...week], month: [...month], year: [...year] };
    const driverStats = { week: [...week], month: [...month], year: [...year] };

    companyData.forEach((entry) => {
      const created = new Date(entry.createdAt);
      if (created.toDateString().slice(4, 7) === now.toDateString().slice(4, 7)) {
        const w = getWeekOfMonth(created) - 1;
        if (w >= 0 && w < 5) companyStats.month[w]++;
      }
      if (created.getFullYear() === now.getFullYear()) {
        const m = created.getMonth();
        if (m >= 0 && m < 12) companyStats.year[m]++;
      }
      const weekday = created.getDay();
      companyStats.week[weekday]++;
    });

    driverData.forEach((entry) => {
      const created = new Date(entry.createdAt);
      if (created.toDateString().slice(4, 7) === now.toDateString().slice(4, 7)) {
        const w = getWeekOfMonth(created) - 1;
        if (w >= 0 && w < 5) driverStats.month[w]++;
      }
      if (created.getFullYear() === now.getFullYear()) {
        const m = created.getMonth();
        if (m >= 0 && m < 12) driverStats.year[m]++;
      }
      const weekday = created.getDay();
      driverStats.week[weekday]++;
    });

    res.json({
      recentActivity: {
        latestCompany: latestCompany || null,
        latestDriver: latestDriver || null,
      },
      totalCompanies,
      totalDrivers,
      companies: companyStats,
      drivers: driverStats,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

module.exports = router;