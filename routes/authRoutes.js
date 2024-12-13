
import express from "express";
import { sendOtpToMobile, verifyMobileOtp, sendOtpToEmail, verifyEmailOtp, resendOtpToEmail, registerUser } from "../controllers/authController.js";



const router = express.Router();


router.post("/send-otp-mobile", sendOtpToMobile);
router.post("/verify-otp-mobile", verifyMobileOtp);


router.post("/send-otp-email", sendOtpToEmail);
router.post("/verify-otp-email", verifyEmailOtp);
router.post("/resend-otp-email", resendOtpToEmail);
router.post("/register-user", registerUser);

export default router;
