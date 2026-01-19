import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ ok: true, service: "prague-heat-backend" });
});

export default router;