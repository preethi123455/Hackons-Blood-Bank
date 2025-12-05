import express from "express";
import {
  getAdmin,
  createDefaultAdmin,
  resetAdminPassword,
} from "../controllers/adminController.js";

const router = express.Router();

router.get("/get-admin", getAdmin);
router.get("/create-default", createDefaultAdmin);
router.post("/reset-password", resetAdminPassword);

export default router;
