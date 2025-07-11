const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const { registerHandler } = require("./auth/register");
const { loginHandler } = require("./auth/login");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());


app.post("/auth/register", registerHandler);
app.post("/auth/login", loginHandler);

// Additional routes
const companyRoutes = require("./routes/companies");
const driverRoutes = require("./routes/drivers");
const statsRoutes = require("./routes/stats");

app.use("/api/companies", companyRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/stats", statsRoutes);

app.get("/", (req, res) => res.send("FleetPulse backend running 🚀"));

app.listen(3000, () => console.log("Server listening on http://localhost:3000"));