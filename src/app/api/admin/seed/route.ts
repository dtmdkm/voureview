import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Category, EventSale, Setting } from '@/models';

export async function GET() {
  try {
    await connectToDatabase();

    // 1. Seed Categories
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
        { name, slug, link: `/category.html?slug=${slug}` },
        { upsert: true, new: true }
      );
    }

    // 2. Seed Event Sales
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
        { name: event.name, link: `/event.html?slug=${event.slug}`, status: 'active' },
        { upsert: true, new: true }
      );
    }

    // 3. Update Footer Settings
    const footerSettings = [
      {
        key: 'footer_event_sales',
        value: [
          { name: 'Black Friday', link: '/event.html?slug=black-friday' },
          { name: 'Valentine', link: '/event.html?slug=valentine' },
          { name: 'Christmas', link: '/event.html?slug=christmas' },
          { name: 'Boxing Day', link: '/event.html?slug=boxing-day' },
          { name: 'Thanksgiving', link: '/event.html?slug=thanksgiving' },
          { name: 'Halloween', link: '/event.html?slug=halloween' }
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

    return NextResponse.json({ message: 'Seeding successful!', categoriesCount: categoryNames.length });
  } catch (error: any) {
    console.error('Seeding error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
