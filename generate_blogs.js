require('dotenv').config({ path: './.env.local' });
const mongoose = require('mongoose');

const StoreSchema = new mongoose.Schema({ name: String, slug: String });
const DealSchema = new mongoose.Schema({ title: String, storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' }, discountValue: String });
const BlogPostSchema = new mongoose.Schema({
  title: String,
  slug: { type: String, unique: true },
  image: String,
  summary: String,
  content: String,
  category: String,
  status: String,
});

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  // Use existing models if they exist to prevent OverwriteModelError
  const Store = mongoose.models.Store || mongoose.model('Store', StoreSchema);
  const Deal = mongoose.models.Deal || mongoose.model('Deal', DealSchema);
  const BlogPost = mongoose.models.BlogPost || mongoose.model('BlogPost', BlogPostSchema);

  const deals = await Deal.find().populate('storeId').limit(3);

  const blogs = [
    {
      title: `Top 5 Ways to Maximize Savings at ${deals[0]?.storeId?.name || 'Your Favorite Stores'}`,
      slug: `top-5-ways-to-maximize-savings-${Date.now()}`,
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80',
      summary: `Discover how you can get ${deals[0]?.discountValue || 'huge discounts'} and uncover hidden promo codes that nobody tells you about.`,
      content: `<p>Shopping at <strong>${deals[0]?.storeId?.name || 'top brands'}</strong> has never been more rewarding. Currently, they are offering an exclusive discount with the deal: <em>${deals[0]?.title || 'Huge clearance sale'}</em>.</p><br/><p>To make the most out of your shopping experience, always check Voureview before checking out. We manually verify these promo codes so you don't have to waste time.</p><br/><h3>Pro Tip:</h3><p>Combine cash back offers with this promo code to double your savings!</p>`,
      status: 'active',
      category: 'Shopping Guides'
    },
    {
      title: `Why ${deals[1]?.storeId?.name || 'Online Shopping'} is the Best Choice This Season`,
      slug: `why-online-shopping-is-best-${Date.now()}`,
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80',
      summary: `With deals like "${deals[1]?.title || 'Free Shipping'}", buying online is not just convenient—it's incredibly cost-effective.`,
      content: `<p>We all love a good bargain. Right now, <strong>${deals[1]?.storeId?.name || 'many retailers'}</strong> are stepping up their game. You can snag <strong>${deals[1]?.discountValue || 'massive discounts'}</strong> just by applying a simple promo code at checkout.</p><br/><p>For instance, the current promotion <em>"${deals[1]?.title || 'Special Holiday Deal'}"</em> is helping thousands of users save big on their everyday purchases. Don't miss out!</p>`,
      status: 'active',
      category: 'Tips & Tricks'
    },
    {
      title: `Deal Spotlight: ${deals[2]?.title || 'Ultimate Saving Guide'}`,
      slug: `deal-spotlight-${Date.now()}`,
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80',
      summary: `Everything you need to know about the latest promotion from ${deals[2]?.storeId?.name || 'our top partners'}.`,
      content: `<p>If you're looking for the best bang for your buck, look no further than <strong>${deals[2]?.storeId?.name || 'this amazing store'}</strong>. Their latest offer, <strong>${deals[2]?.title || 'Exclusive Discount'}</strong>, is currently trending on Voureview.</p><br/><p>Hurry up and grab this deal before it expires. We constantly monitor these offers to ensure our users get the valid codes.</p>`,
      status: 'active',
      category: 'Deal Spotlights'
    }
  ];

  await BlogPost.insertMany(blogs);
  console.log('Successfully inserted 3 blog posts!');
  process.exit(0);
}
run();
