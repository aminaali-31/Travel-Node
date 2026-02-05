const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
  secret: 'heythisisamna',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 3600000 } // 1 hour
}));

// Set view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to pass flash messages to views
app.use((req, res, next) => {
  res.locals.messages = req.session.messages || [];
  req.session.messages = [];
  next();
});

// Routes
app.get('/', (req, res) => {
  res.render('index');
});

app.get('/about', (req, res) => {
  res.render('about');
});

app.get('/tours', (req, res) => {
  res.render('tours');
});

app.get('/contact', (req, res) => {
  res.render('contact');
});

app.post('/send-mail', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    req.session.messages = ['All fields are required'];
    return res.redirect('/contact');
  }

  try {
    await sendEmail(name, email, message);
    req.session.messages = ['Message sent successfully!'];
    res.redirect('/contact');
  } catch (error) {
    console.error('Email error:', error);
    req.session.messages = ['Something went wrong. Please try again later.'];
    res.redirect('/contact');
  }
});

// Email sending function
async function sendEmail(name, senderEmail, message) {
  const EMAIL_ADDRESS = process.env.EMAIL;
  const EMAIL_PASSWORD = process.env.PASSWORD;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_ADDRESS,
      pass: EMAIL_PASSWORD
    }
  });

  const mailOptions = {
    from: EMAIL_ADDRESS,
    to: EMAIL_ADDRESS,
    subject: 'New Contact Form Message',
    text: `Name: ${name}\nEmail: ${senderEmail}\n\nMessage:\n${message}`
  };

  return transporter.sendMail(mailOptions);
}

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
