const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const indexRoutes = require('./routes/index');

// Load config
dotenv.config({ path: './.env' });

// Connect to MongoDB
connectDB();

// Set View Engine
app.set('view engine', 'ejs');

// Static Folder for CSS, JS, etc.
app.use(express.static('public'));

// Body Parsing Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.use('/', indexRoutes);

// Start Server
app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}, you better catch it!`);
});