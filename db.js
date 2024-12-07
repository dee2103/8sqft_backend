import express from "express";
import mysql from "mysql2/promise";  // Import promise-based version
import dotenv from "dotenv";

dotenv.config();

// Create a promise-based MySQL connection
const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Optionally, check the connection
connection.ping()
  .then(() => {
    console.log('Connected to MySQL database');
  })
  .catch((err) => {
    console.error('Error connecting to MySQL database:', err.stack);
  });

export default connection;
