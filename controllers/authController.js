import twilio  from 'twilio';
import nodemailer  from "nodemailer";
import jwt  from "jsonwebtoken";

import dotenv from "dotenv";

dotenv.config();



const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;

const client = twilio(accountSid, authToken);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});


const otpStore = {}; 


const generateOtp = () => Math.floor(100000 + Math.random() * 900000);

export const sendOtpToMobile = async (req, res) => {
  const { mobile } = req.body;

  if (!mobile) {
    return res.status(400).json({ message: "Mobile number is required" });
  }

  const formatPhoneNumber = (number) => {
    // Convert input to string and remove any non-numeric characters
    const cleanedNumber = String(number).replace(/\D/g, '');
    if (!cleanedNumber.startsWith('91') && cleanedNumber.length === 10) {
      return `+91${cleanedNumber}`;
    }
    return `+${cleanedNumber}`;
  };

  try {
    const formattedMobile = formatPhoneNumber(mobile);
    console.log("Formatted Mobile:", formattedMobile);

    const otp = generateOtp();
    otpStore[formattedMobile] = otp;
    console.log("Generated OTP:", otp);

    const message = await client.messages.create({
      from: whatsappNumber,
      to: `whatsapp:${formattedMobile}`,
      body: `Your login OTP is: ${otp}`,
    });

    console.log("Message sent with SID:", message.sid);

    const fetchedMessage = await client.messages(message.sid).fetch();
    console.log("Message Status:", fetchedMessage.status);
    console.log("Error Code:", fetchedMessage.errorCode);
    console.log("Error Message:", fetchedMessage.errorMessage);

    res.status(200).json({
      message: "OTP sent to WhatsApp",
      sid: message.sid,
      status: fetchedMessage.status,
      errorCode: fetchedMessage.errorCode,
      errorMessage: fetchedMessage.errorMessage,
    });
  } catch (error) {
    console.error("Error while sending OTP:", error);
    res.status(500).json({ message: "Failed to send OTP", error: error.message });
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
