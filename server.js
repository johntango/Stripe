import express from 'express';
import Stripe from 'stripe';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import ejs from 'ejs';
import { dirname } from 'path';

// Load environment variables from .env file
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000; // You can change this to your preferred port number

const YOUR_DOMAIN = "http://localhost:3000"; // Update this with your actual domain
const PRICE_ID = process.env.PRICE_ID// Make sure to replace this with your actual Price ID

// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to parse JSON and urlencoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from a 'public' directory
app.use(express.static('public'));

// Route to render the main page
app.get('/', (req, res) => {
  res.render('index', { 
    title: 'Checkout Page',
    productName: 'Stubborn Attachments',
    productPrice: '$20.00'
  });
});

// Route to render the success page
app.get('/success', (req, res) => {
  res.render('success', { title: 'Payment Successful' });
});

// Route to render the cancel page
app.get('/cancel', (req, res) => {
  res.render('cancel', { title: 'Payment Cancelled' });
});


// Route handler for creating a checkout session
app.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${YOUR_DOMAIN}/success`,
      cancel_url: `${YOUR_DOMAIN}/cancel`,
    });

    res.redirect(303, session.url);
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).send('Error creating checkout session');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});