require('dotenv').config({ path: './.env.local' });
const mongoose = require('mongoose');

const htmlContent = `
<p style="margin-bottom: 20px;">Welcome to Voureview, your number one source for the best deals, promo codes, and cash back offers. We're dedicated to giving you the very best shopping experience, with a focus on verified coupons, exclusive discounts, and maximizing your savings.</p>

<h3 style="font-size: 1.3rem; font-weight: 700; color: #1e293b; margin-top: 30px; margin-bottom: 15px;">Our Mission</h3>
<p style="margin-bottom: 20px;">Founded with the goal of helping everyday shoppers keep more money in their wallets, Voureview has come a long way. When we first started out, our passion for finding "the ultimate discount" drove us to do intense research, and gave us the impetus to turn hard work and inspiration into a booming online coupon platform.</p>

<h3 style="font-size: 1.3rem; font-weight: 700; color: #1e293b; margin-top: 30px; margin-bottom: 15px;">Why Choose Us?</h3>
<ul style="margin-bottom: 20px; padding-left: 20px;">
  <li style="margin-bottom: 10px;"><strong>100% Verified Deals:</strong> Our dedicated team manually tests codes daily to ensure they work.</li>
  <li style="margin-bottom: 10px;"><strong>Exclusive Partnerships:</strong> We work directly with top brands to bring you discounts you won't find anywhere else.</li>
  <li style="margin-bottom: 10px;"><strong>Always Free:</strong> We believe saving money shouldn't cost you a dime. Our service is completely free to use.</li>
</ul>

<p style="margin-bottom: 20px;">We hope you enjoy our platform as much as we enjoy offering these deals to you. If you have any questions or comments, please don't hesitate to contact us.</p>

<p style="margin-bottom: 20px;">Sincerely,<br/><strong>The Voureview Team</strong></p>
`;

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection;
  
  await db.collection('settings').updateOne(
    { key: 'page_about' },
    { 
      $set: { 
        value: htmlContent, 
        updatedAt: new Date() 
      } 
    },
    { upsert: true }
  );
  
  console.log('Successfully updated About Us page content in MongoDB!');
  process.exit(0);
}
run();
