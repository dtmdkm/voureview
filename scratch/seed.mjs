import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://vucuong:Cuong%40123@cluster0.xw51drl.mongodb.net/?appName=Cluster0';

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String },
  link: { type: String, required: true },
});

const EventSaleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  link: { type: String, required: true },
  status: { type: String, default: 'active' }
});

const SettingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true }
});

const Category = mongoose.model('Category', CategorySchema);
const EventSale = mongoose.model('EventSale', EventSaleSchema);
const Setting = mongoose.model('Setting', SettingSchema);

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const categoryNames = [
      "AI", "Article about Interesting Enhancement Products for Women", "Article about underwear accessories", 
      "Article about Vehicles and accessories", "Article Fashion jewelry", "Articles about beauty and fragrance", 
      "Articles about drinks and food", "Articles about Education and Training", "Articles about entertainment and media", 
      "Articles about Gaming and e-sports", "Articles about home and garden", "Articles about personal gifts", 
      "Articles about Phone accessories", "Articles about service software", "Articles about sportswear", 
      "Articles about Toys", "Automotive", "Books Posts", "CDB Posts", "Computers & Software Posts", 
      "Ecommerce", "Electronics and Technology Articles", "Fashion and accessories articles", 
      "Financial Posts", "Health Posts", "Kids & Babies", "Marketplace", "NS.Tung", "Other", 
      "Pets Posts", "SAAS", "Saving Tips", "Store Review", "Travel Posts", "Trending Posts", 
      "Web Hosting Posts", "Adult 18 and over", "Arts & crafts", "Babies and kids", 
      "Beauty and fragrance", "Bedding", "Books", "Clothing accessories", "Computers and accessories", 
      "Decorations", "Drinks", "Education and Training", "Electronics and Technology", 
      "Entertainment and media", "Equipment furniture", "Fashion jewelry", "Financial services and products", 
      "Food", "For businesses", "Gaming and esports", "Hairdressing accessories", "Health", 
      "Home Garden", "Houseware", "Pets", "Phone accessories", "Retail", "Shoes and sandals", 
      "Software and services", "Sportswear", "Toys", "Travel", "Underwear", "Vehicle service", 
      "Vehicles and accessories"
    ];

    for (const name of categoryNames) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      await Category.findOneAndUpdate(
        { name },
        { name, slug, link: `/category/${slug}` },
        { upsert: true, new: true }
      );
    }
    console.log(`Seeded ${categoryNames.length} categories`);

    const events = [
      { name: "Black Friday", slug: "black-friday" },
      { name: "Boxing Day", slug: "boxing-day" },
      { name: "Christmas", slug: "christmas" },
      { name: "Halloween", slug: "halloween" },
      { name: "Thanksgiving", slug: "thanksgiving" },
      { name: "Valentine", slug: "valentine" },
      { name: "Deals", slug: "deals" }
    ];

    for (const event of events) {
      await EventSale.findOneAndUpdate(
        { name: event.name },
        { name: event.name, link: `/event/${event.slug}`, status: 'active' },
        { upsert: true, new: true }
      );
    }
    console.log(`Seeded ${events.length} events`);

    const footerSettings = [
      {
        key: 'footer_event_sales',
        value: [
          { name: 'Black Friday', link: '/event/black-friday' },
          { name: 'Valentine', link: '/event/valentine' },
          { name: 'Christmas', link: '/event/christmas' },
          { name: 'Boxing Day', link: '/event/boxing-day' },
          { name: 'Thanksgiving', link: '/event/thanksgiving' },
          { name: 'Halloween', link: '/event/halloween' }
        ]
      },
      {
        key: 'footer_resources',
        value: [
          { name: 'Product Feed', link: '#' },
          { name: 'Best Rated Product', link: '#' },
          { name: 'Feature product', link: '#' }
        ]
      },
      {
        key: 'footer_company',
        value: [
          { name: 'About Us', link: '/about-us.html' },
          { name: 'Contact Us', link: '/contact.html' },
          { name: 'Help Center', link: '#' },
          { name: 'Press', link: '#' },
          { name: 'Blog', link: '/blog.html' }
        ]
      },
      {
        key: 'footer_notices',
        value: [
          { name: 'Terms Of Use', link: '#' },
          { name: 'Privacy Policy', link: '#' },
          { name: 'Disclosure Policy', link: '#' },
          { name: 'Cookie Policy', link: '#' }
        ]
      },
      {
        key: 'social_links',
        value: {
          facebook: 'https://facebook.com',
          twitter: 'https://twitter.com',
          instagram: 'https://instagram.com',
          pinterest: 'https://pinterest.com'
        }
      }
    ];

    for (const setting of footerSettings) {
      await Setting.findOneAndUpdate(
        { key: setting.key },
        { key: setting.key, value: setting.value },
        { upsert: true, new: true }
      );
    }
    console.log('Updated footer settings');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Seeding error:', error);
  }
}

seed();
