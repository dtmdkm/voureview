import mongoose from 'mongoose';

const transformId = (doc: any, ret: any) => {
  ret.id = ret._id.toString();
  delete ret._id;
  delete ret.__v;
  return ret;
};

const StoreSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true }, // amazon-coupons
  link: { type: String, required: true },
  image: { type: String }, // Logo
  banner: { type: String }, // Hero banner
  description: { type: String }, // Short description
  content: { type: String }, // Detailed review/content (HTML)
  rating: { type: Number, default: 5 },
  totalVotes: { type: Number, default: 1250 }, // Initial fake votes for social proof
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'EventSale' },
  isApproved: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  status: { type: String, default: 'active' },
  seoTitle: { type: String },
  seoKeywords: { type: String },
  seoDescription: { type: String },
  faqs: [{
    question: String,
    answer: String
  }]
}, {
  timestamps: true,
  toJSON: { transform: transformId }
});

const DealSchema = new mongoose.Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', index: true },
  title: { type: String, required: true },
  price: { type: String },
  discountPrice: { type: String, required: false },
  discountValue: { type: String, required: false }, // e.g. 20% OFF, $10 OFF
  link: { type: String, required: true },
  description: { type: String, required: false },
  image: { type: String, required: false },
  type: { type: String, default: 'deal', required: false }, // deal, code
  code: { type: String, required: false },
  expiryDate: { type: String, required: false },
  isVerified: { type: Boolean, default: true },
  isApproved: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 99999 }, // STT
  clicks: { type: Number, default: 0 },
  seoTitle: { type: String },
  seoKeywords: { type: String },
  seoDescription: { type: String }
}, {
  timestamps: true,
  toJSON: { transform: transformId }
});

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String },
  link: { type: String, required: false },
  icon: { type: String },
  seoTitle: { type: String },
  seoKeywords: { type: String },
  seoDescription: { type: String }
}, {
  timestamps: true,
  toJSON: { transform: transformId }
});

const BlogPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  image: { type: String },
  summary: { type: String },
  content: { type: String },
  category: { type: String },
  status: { type: String, default: 'active' },
  seoTitle: { type: String },
  seoKeywords: { type: String },
  seoDescription: { type: String }
}, {
  timestamps: true,
  toJSON: { transform: transformId }
});

const EventSaleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String },
  link: { type: String, required: true },
  icon: { type: String },
  status: { type: String, default: 'active' },
  seoTitle: { type: String },
  seoKeywords: { type: String },
  seoDescription: { type: String }
}, {
  timestamps: true,
  toJSON: { transform: transformId }
});

const SettingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true }
}, {
  timestamps: true,
  toJSON: { transform: transformId }
});

const PageViewSchema = new mongoose.Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', index: true },
  path: { type: String },
  ip: { type: String },
  sessionId: { type: String },
  deviceType: { type: String, default: 'desktop' }, // desktop, mobile, tablet
  browser: { type: String, default: 'other' },
  os: { type: String, default: 'other' },
  country: { type: String, default: 'unknown' },
  referrer: { type: String },
  timeOnPage: { type: Number, default: 0 },
  isBounce: { type: Boolean, default: true },
  isBot: { type: Boolean, default: false }
}, {
  timestamps: true,
  toJSON: { transform: transformId }
});

const CustomerLeadSchema = new mongoose.Schema({
  email: { type: String, required: true },
  name: { type: String },
  message: { type: String },
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
  source: { type: String, default: 'contact' }, // contact, landing
  ip: { type: String },
  country: { type: String },
  status: { type: String, default: 'new' } // new, read, replied
}, {
  timestamps: true,
  toJSON: { transform: transformId }
});

const ActivityLogSchema = new mongoose.Schema({
  action: { type: String, required: true }, // created, updated, deleted
  entity: { type: String, required: true }, // store, deal, blog, etc.
  entityId: { type: String },
  entityName: { type: String },
  details: { type: String },
  ip: { type: String }
}, {
  timestamps: true,
  toJSON: { transform: transformId }
});

// Use existing models if they exist, to prevent OverwriteModelError in dev
StoreSchema.index({ createdAt: -1 });
DealSchema.index({ createdAt: -1 });
CategorySchema.index({ createdAt: -1 });
BlogPostSchema.index({ createdAt: -1 });
EventSaleSchema.index({ createdAt: -1 });
PageViewSchema.index({ createdAt: -1 });
ActivityLogSchema.index({ createdAt: -1 });

export const Store = mongoose.models.Store || mongoose.model('Store', StoreSchema);
export const Deal = mongoose.models.Deal || mongoose.model('Deal', DealSchema);
export const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
export const BlogPost = mongoose.models.BlogPost || mongoose.model('BlogPost', BlogPostSchema);
export const EventSale = mongoose.models.EventSale || mongoose.model('EventSale', EventSaleSchema);
export const Setting = mongoose.models.Setting || mongoose.model('Setting', SettingSchema);
export const PageView = mongoose.models.PageView || mongoose.model('PageView', PageViewSchema);
export const CustomerLead = mongoose.models.CustomerLead || mongoose.model('CustomerLead', CustomerLeadSchema);
export const ActivityLog = mongoose.models.ActivityLog || mongoose.model('ActivityLog', ActivityLogSchema);
