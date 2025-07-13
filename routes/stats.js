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

const initStats = () => ({
  week: Array(7).fill(0),
  month: Array(5).fill(0),
  year: Array(12).fill(0),
});

const updateStats = (data, stats, now) => {
  data.forEach((entry) => {
    const created = new Date(entry.createdAt);
    if (created.toDateString().slice(4, 7) === now.toDateString().slice(4, 7)) {
      const w = getWeekOfMonth(created) - 1;
      if (w >= 0 && w < 5) stats.month[w]++;
    }
    if (created.getFullYear() === now.getFullYear()) {
      const m = created.getMonth();
      if (m >= 0 && m < 12) stats.year[m]++;
    }
    const weekday = created.getDay();
    stats.week[weekday]++;
  });
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

    const [totalCompanies, totalDrivers, companyData, driverData] = await Promise.all([
      prisma.company.count({ where: { userId } }),
      prisma.driver.count({ where: { userId } }),
      prisma.company.findMany({ where: { userId } }),
      prisma.driver.findMany({ where: { userId } }),
    ]);

    const companyStats = initStats();
    const driverStats = initStats();

    updateStats(companyData, companyStats, now);
    updateStats(driverData, driverStats, now);

    return res.status(200).json({
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
    console.error("[Stats API Error]", err);
    return res.status(500).json({ error: [{ path: 'server', message: 'Failed to fetch stats' }] });
  }
});

module.exports = router;