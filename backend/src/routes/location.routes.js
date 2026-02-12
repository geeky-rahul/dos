import express from "express";
import { reverseGeocode } from "../controllers/location.controller.js";

const router = express.Router();

// GET /api/location/reverse?lat=28.6139&lng=77.2090
router.get("/reverse", reverseGeocode);

export default router;
