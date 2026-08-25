import { Router } from "express";
import { getCurrentWeather, getGeocode } from "../controllers/weather.controller.js";

const router = Router();
router.get("/current", getCurrentWeather);
router.get("/geocode", getGeocode);
export default router;
