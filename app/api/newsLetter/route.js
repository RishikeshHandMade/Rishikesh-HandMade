import connectDB from '@/lib/connectDB';
import NewsLetter from '@/models/NewsLetter';

export async function GET() {
  await connectDB();
  try {
    const all = await NewsLetter.find({}, { email: 1, _id: 0 });
    return new Response(JSON.stringify({ success: true, emails: all.map(e => e.email) }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, message: 'Server error.' }), { status: 500 });
  }
}

export async function POST(req) {
  await connectDB();
  try {
    const { email } = await req.json();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return new Response(JSON.stringify({ success: false, message: 'Invalid email.' }), { status: 400 });
    }
    // Prevent duplicate
    const exists = await NewsLetter.findOne({ email });
    if (exists) {
      return new Response(JSON.stringify({ success: false, message: 'Email already subscribed.' }), { status: 409 });
    }
    await NewsLetter.create({ email });

    // Send welcome email via Brevo
    try {
      const apiKey = process.env.BREVO_API_KEY;
      if (apiKey) {
        await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'api-key': apiKey,
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            sender: { name: 'Rishikesh Handmade', email: 'rishikeshhandmade@gmail.com' },
            to: [{ email }],
            subject: 'Thank You for Subscribing – Get Ready for Exclusive Deals!',
            htmlContent: `
              <p>Dear Valuable User,</p>
              <p>Thank you for subscribing to us!</p>
              <p>We’re excited to have you as part of our Rishikesh Handmade family. You’ll now be the first to know about our best trending deals, exclusive offers, and new arrivals—delivered straight to your inbox from time to time.</p>
              <p>Stay tuned and enjoy a smarter shopping experience with handpicked collections and special discounts curated just for you.</p>
              <br>
              <p>Happy Shopping!<br>Team Rishikesh Handmade</p>
            `
          })
        });
      } else {
        console.warn('BREVO_API_KEY not set. Email not sent.');
      }
    } catch (err) {
      // Don't fail subscription if email fails
      console.error('Failed to send welcome email:', err);
    }

    return new Response(JSON.stringify({ success: true, message: 'Subscribed successfully.' }), { status: 201 });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, message: 'Server error.' }), { status: 500 });
  }
}
