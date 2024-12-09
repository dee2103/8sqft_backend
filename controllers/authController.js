import twilio  from "twilio";
import nodemailer  from "nodemailer";
import jwt  from "jsonwebtoken";

import dotenv from "dotenv";

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const client = twilio(accountSid, authToken);

const otpStore = {}; 


const generateOtp = () => Math.floor(100000 + Math.random() * 900000);


export const sendOtpToMobile = async (req, res) => {
  const { mobile } = req.body;

  if (!mobile) {
    return res.status(400).json({ message: "Mobile number is required" });
  }

  const otp = generateOtp();
  otpStore[mobile] = otp;

  try {
    await client.messages.create({
      from: whatsappNumber,
      to: `whatsapp:${mobile}`,
      body: `Your login OTP is: ${otp}`,
    });

    res.status(200).json({ message: "OTP sent to WhatsApp" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};


export const verifyMobileOtp = (req, res) => {
  const { mobile, otp } = req.body;

  if (otpStore[mobile] === parseInt(otp, 10)) {
    const token = jwt.sign({ mobile }, process.env.JWT_SECRET, { expiresIn: "1h" });
    delete otpStore[mobile]; 
    res.status(200).json({ message: "Login successful", token });
  } else {
    res.status(400).json({ message: "Invalid OTP" });
  }
};


export const sendOtpToEmail = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const otp = generateOtp();
  otpStore[email] = otp;

  try {
    await transporter.sendMail({
      from: `"8Sqft Team" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Your Login OTP",
      text: `Your login OTP is: ${otp}`,
    });

    res.status(200).json({ message: "OTP sent to email" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};


export const verifyEmailOtp = (req, res) => {
  const { email, otp } = req.body;

  if (otpStore[email] === parseInt(otp, 10)) {
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1h" });
    delete otpStore[email]; 
    res.status(200).json({ message: "Login successful", token });
  } else {
    res.status(400).json({ message: "Invalid OTP" });
  }
};
