const express = require("express");
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/validationMiddleware");

const router = express.Router();

router.post(
  "/register",
  [
    // Validate here so controllers can focus on auth and database work.
    body("fullName").trim().notEmpty().withMessage("Full name is required."),
    body("email").isEmail().withMessage("Please provide a valid email address.").normalizeEmail(),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long.")
  ],
  validateRequest,
  authController.register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please provide a valid email address.").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required.")
  ],
  validateRequest,
  authController.login
);

// Profile and password changes need a verified JWT before reaching the controller.
router.get("/profile", authMiddleware, authController.getProfile);

router.put(
  "/change-password",
  authMiddleware,
  [
    body("oldPassword").notEmpty().withMessage("Current password is required."),
    body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters long.")
  ],
  validateRequest,
  authController.changePassword
);

module.exports = router;
