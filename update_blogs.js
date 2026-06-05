require('dotenv').config({ path: './.env.local' });
const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection;
  
  const blogs = await db.collection('blogposts').find({}).toArray();
  
  if (blogs.length >= 3) {
    const longContent1 = `
      <p style="margin-bottom: 20px;">Shopping online has become a daily habit for many, but are you really getting the best price? When you shop at your favorite brands, there are always hidden ways to slash those prices. In this comprehensive guide, we will walk you through the absolute best strategies to maximize your savings.</p>
      
      <h3 style="color: #1e293b; font-size: 1.5rem; margin-top: 30px; margin-bottom: 15px; font-weight: bold;">1. Always Hunt for Promo Codes</h3>
      <p style="margin-bottom: 20px;">The golden rule of online shopping is simple: Never checkout without checking for a promo code first. Retailers frequently release discount codes for 10%, 20%, or even 50% off. Voureview aggregates all these codes in one place, so you don't have to spend hours scouring the internet. Simply copy the code and paste it at checkout.</p>
      
      <h3 style="color: #1e293b; font-size: 1.5rem; margin-top: 30px; margin-bottom: 15px; font-weight: bold;">2. Combine Cash Back with Discounts</h3>
      <p style="margin-bottom: 20px;">Did you know you can stack deals? Many shoppers make the mistake of using just a promo code. If you use a cash-back portal, you earn a percentage of your purchase back in real money. Combine this with a 20% off coupon, and you are looking at massive overall savings.</p>
      
      <h3 style="color: #1e293b; font-size: 1.5rem; margin-top: 30px; margin-bottom: 15px; font-weight: bold;">3. Abandon Your Shopping Cart</h3>
      <p style="margin-bottom: 20px;">This is a classic trick that still works wonders. Log into your account, add the items you want to buy to your shopping cart, and then simply close the tab. Wait 24 to 48 hours. Many retailers will send you an automated email with a special discount code (often 10-15% off) to encourage you to complete your purchase.</p>

      <h3 style="color: #1e293b; font-size: 1.5rem; margin-top: 30px; margin-bottom: 15px; font-weight: bold;">4. Subscribe to Newsletters</h3>
      <p style="margin-bottom: 20px;">Almost every online store offers an immediate discount (usually 10% to 15%) just for signing up for their email newsletter. Create a dedicated email address just for shopping subscriptions so your main inbox doesn't get cluttered, and reap the rewards!</p>
      
      <p style="margin-bottom: 20px;">By applying these simple yet highly effective strategies, you can easily save hundreds of dollars a year. Happy shopping and saving!</p>
    `;

    const longContent2 = `
      <p style="margin-bottom: 20px;">The e-commerce landscape is changing rapidly. With the convenience of having everything delivered straight to your doorstep, online shopping is undoubtedly the best choice this season. But the convenience is just the tip of the iceberg; the real advantage lies in the incredible cost-effectiveness.</p>
      
      <h3 style="color: #1e293b; font-size: 1.5rem; margin-top: 30px; margin-bottom: 15px; font-weight: bold;">Unmatched Variety at Your Fingertips</h3>
      <p style="margin-bottom: 20px;">When you shop online, you aren't restricted by the physical shelf space of a local store. You have access to millions of products globally. Whether you are looking for niche electronics, imported cosmetics, or exclusive fashion items, the internet has it all.</p>
      
      <h3 style="color: #1e293b; font-size: 1.5rem; margin-top: 30px; margin-bottom: 15px; font-weight: bold;">The Power of Price Comparison</h3>
      <p style="margin-bottom: 20px;">In a physical mall, comparing prices means walking from store to store. Online, it takes just a few clicks. You can instantly see which retailer offers the best base price. Add coupon codes into the mix, and the savings become undeniable.</p>
      
      <h3 style="color: #1e293b; font-size: 1.5rem; margin-top: 30px; margin-bottom: 15px; font-weight: bold;">Exclusive Online-Only Promotions</h3>
      <p style="margin-bottom: 20px;">To encourage digital sales, retailers frequently run "Online Exclusive" promotions. These can include free shipping, flash sales, or site-wide percentage discounts that you simply will not find in brick-and-mortar stores.</p>

      <div style="background: #f8fafc; padding: 20px; border-left: 4px solid #3258b3; margin: 30px 0; border-radius: 0 8px 8px 0;">
        <p style="margin: 0; font-style: italic; color: #475569;">"I used to spend hours driving to the mall, only to pay full price. Now, I shop from my couch and save at least 20% on every order using online coupons." - Sarah T., avid shopper.</p>
      </div>
      
      <p style="margin-bottom: 20px;">Don't let these opportunities slip by. Make the smart choice this season by shopping smart, shopping online, and always using Voureview to verify your discounts.</p>
    `;

    const longContent3 = `
      <p style="margin-bottom: 20px;">Every once in a while, a promotion comes along that is simply too good to ignore. Today, we are shining the spotlight on one of the most highly anticipated deals of the month. If you have been waiting for the right moment to upgrade your gear or refresh your wardrobe, that moment is right now.</p>
      
      <h3 style="color: #1e293b; font-size: 1.5rem; margin-top: 30px; margin-bottom: 15px; font-weight: bold;">What Makes This Deal Special?</h3>
      <p style="margin-bottom: 20px;">Unlike standard seasonal sales, this specific promotion offers a deep discount across all categories. Whether you are buying one premium item or filling up your cart with essentials, the percentage off remains consistently high. Furthermore, this code has been 100% verified by our team this morning.</p>
      
      <h3 style="color: #1e293b; font-size: 1.5rem; margin-top: 30px; margin-bottom: 15px; font-weight: bold;">How to Claim the Offer</h3>
      <ul style="margin-bottom: 20px; padding-left: 20px; line-height: 1.8;">
        <li><strong>Step 1:</strong> Click the "Get Deal" button on our store page to reveal the promo code.</li>
        <li><strong>Step 2:</strong> You will be securely redirected to the official retailer's website. Add your desired items to the cart.</li>
        <li><strong>Step 3:</strong> Proceed to the checkout page and locate the "Promo Code" or "Discount Code" box.</li>
        <li><strong>Step 4:</strong> Paste the copied code and hit Apply. Watch your total order value drop instantly!</li>
      </ul>
      
      <h3 style="color: #1e293b; font-size: 1.5rem; margin-top: 30px; margin-bottom: 15px; font-weight: bold;">Terms and Conditions to Watch Out For</h3>
      <p style="margin-bottom: 20px;">While this is an incredible offer, please note that it may not apply to certain clearance items or newly launched flagship products. The deal is valid for a limited time only, so we highly recommend acting fast before stock runs out.</p>
      
      <p style="margin-bottom: 20px;">Stay tuned to Voureview for more exclusive deal spotlights. We do the hard work of verifying coupons so you can enjoy the savings!</p>
    `;

    await db.collection('blogposts').updateOne({ _id: blogs[0]._id }, { $set: { content: longContent1, createdAt: new Date(), updatedAt: new Date() } });
    await db.collection('blogposts').updateOne({ _id: blogs[1]._id }, { $set: { content: longContent2, createdAt: new Date(), updatedAt: new Date() } });
    await db.collection('blogposts').updateOne({ _id: blogs[2]._id }, { $set: { content: longContent3, createdAt: new Date(), updatedAt: new Date() } });
    
    console.log('Successfully updated 3 blog posts with long content and timestamps!');
  } else {
    console.log('Not enough blogs found in database!');
  }
  process.exit(0);
}
run();
