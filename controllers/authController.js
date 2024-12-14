import twilio from 'twilio';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import transporter from '../nodemailer.js';

import db from '../db.js';


dotenv.config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const otpStore = {};

const generateOtp = () => Math.floor(100000 + Math.random() * 900000);

const OTP_EXPIRY_TIME = 5 * 60 * 1000;  // 5 minutes

const formatPhoneNumber = (number) => {
  const cleanedNumber = String(number).replace(/\D/g, '');
  return cleanedNumber.startsWith('91') && cleanedNumber.length === 10
    ? `+${cleanedNumber}`
    : `+91${cleanedNumber}`;
};


export const sendOtpToMobile = async (req, res) => {
  const { mobile } = req.body;
  if (!mobile) {
    return res.status(400).json({ message: 'Mobile number is required' });
  }

  try {
    const formattedMobile = formatPhoneNumber(mobile);
    const otp = generateOtp();
    otpStore[formattedMobile] = { otp, expiry: Date.now() + OTP_EXPIRY_TIME };

    const message = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${formattedMobile}`,
      body: `Your login OTP is: ${otp}`,
    });

    res.status(200).json({
      message: 'OTP sent to WhatsApp',
      sid: message.sid,
      status: message.status,
    });
  } catch (error) {
    console.error('Error while sending OTP:', error);
    res.status(500).json({
      message: 'Failed to send OTP due to an internal error.',
      error: error.message,
    });
  }
};

export const verifyMobileOtp = (req, res) => {
  const { mobile, otp } = req.body;

  const storedOtpData = otpStore[mobile];
  if (!storedOtpData) {
    return res.status(400).json({ message: 'OTP not found or expired' });
  }

  const { otp: storedOtp, expiry } = storedOtpData;

  if (Date.now() > expiry) {
    delete otpStore[mobile];
    return res.status(400).json({ message: 'OTP expired' });
  }

  if (parseInt(otp, 10) === storedOtp) {
    const token = jwt.sign({ mobile }, process.env.JWT_SECRET, { expiresIn: '1h' });
    delete otpStore[mobile]; 
    res.status(200).json({ message: 'Login successful', token });
  } else {
    res.status(400).json({ message: 'Invalid OTP' });
  }
};

export const sendOtpToEmail = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const otp = generateOtp();
    otpStore[email] = { otp, expiry: Date.now() + OTP_EXPIRY_TIME };

    await transporter.sendMail({
      from: `"8Sqft Team" <${process.env.SMTP_USER}>`, 
      to: email,
      subject: 'Your Login OTP',
      text: `Your login OTP is: ${otp}`, 
    });

    res.status(200).json({ message: 'OTP sent to email' });
  } catch (error) {
    console.error('Error while sending OTP:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};

export const verifyEmailOtp = async (req, res) => {
  const { email, otp, first_name, last_name, mobile } = req.body;

  const storedOtpData = otpStore[email];
  if (!storedOtpData) {
    return res.status(400).json({ message: 'OTP not found or expired' });
  }

  const { otp: storedOtp, expiry } = storedOtpData;

  if (Date.now() > expiry) {
    delete otpStore[email]; 
    return res.status(400).json({ message: 'OTP expired' });
  }

  if (parseInt(otp, 10) === storedOtp) {
    try {
      const userQuery = 'SELECT * FROM tbl_users WHERE email = ?'; 
      const [user] = await db.query(userQuery, [email]);

      if (user.length === 0) {
        return res.status(200).json({
          message: 'User not found, please register.',
          needToRegister: true,
          email, 
        });
      } else {
        const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ message: 'Login successful', token });
      }
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ message: 'Error checking user in database' });
    }
  } else {
    res.status(400).json({ message: 'Invalid OTP' });
  }
};


export const resendOtpToEmail = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const storedOtpData = otpStore[email];

    // if (storedOtpData) {
    //   const { expiry } = storedOtpData;
    //   if (Date.now() < expiry) {
    //     return res.status(200).json({
    //       message: 'OTP is still valid, please check your email.',
    //     });
    //   }
    // }

    const otp = generateOtp();
    otpStore[email] = { otp, expiry: Date.now() + OTP_EXPIRY_TIME };

    await transporter.sendMail({
      from: `"8Sqft Team" <${process.env.SMTP_USER}>`,  
      to: email,  
      subject: 'Your New Login OTP',
      text: `Your new login OTP is: ${otp}`,  
    });

    res.status(200).json({ message: 'OTP resent to email' });
  } catch (error) {
    console.error('Error while resending OTP:', error);
    res.status(500).json({ message: 'Failed to resend OTP' });
  }
};

export const registerUser = async (req, res) => {
  const { email, first_name, last_name, mobile } = req.body;

  try {
    const userCheckQuery = 'SELECT * FROM tbl_users WHERE email = ?'; 
    const [user] = await db.query(userCheckQuery, [email]);

    if (user.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const insertQuery = `
      INSERT INTO tbl_users (email, first_name, last_name, mobile)
      VALUES (?, ?, ?, ?)`;
    await db.query(insertQuery, [email, first_name, last_name, mobile]);

    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ message: 'Registration successful', token });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Failed to register user' });
  }
};


