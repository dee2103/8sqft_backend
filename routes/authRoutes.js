
import express from "express";
import { sendOtpToMobile, verifyMobileOtp, sendOtpToEmail, verifyEmailOtp } from "../controllers/authController";

const router = express.Router();


router.post("/send-otp-mobile", sendOtpToMobile);
router.post("/verify-otp-mobile", verifyMobileOtp);


router.post("/send-otp-email", sendOtpToEmail);
router.post("/verify-otp-email", verifyEmailOtp);

export default router;
