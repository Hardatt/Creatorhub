require("module-alias/register");
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const { sequelize } = require("@models");

const app = express();

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(morgan("dev"));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
}));

app.use("/api/auth",    require("@routes/auth.routes"));
app.use("/api/users",   require("@routes/user.routes"));
app.use("/api/credits", require("@routes/credit.routes"));
app.use("/api/feed",    require("@routes/feed.routes"));
app.use("/api/posts",   require("@routes/post.routes"));
app.use("/api/reports", require("@routes/report.routes"));
app.use("/api/admin",   require("@routes/admin.routes"));

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use((_req, res) => res.status(404).json({ error: "Route not found" }));

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
});

const PORT = process.env.PORT || 3005;

sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("[DB] MySQL synced");
    app.listen(PORT, () => console.log(`[Server] Running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("[DB] Connection failed:", err);
    process.exit(1);
  });
