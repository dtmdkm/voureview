// Server Component — pre-fetches 30-day analytics data from MongoDB
import { connectToDatabase } from '@/lib/mongodb';
import { PageView, Deal } from '@/models';
import AnalyticsClientPage from './ClientPage';

export const dynamic = 'force-dynamic';

async function getAnalyticsStats(days: number) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const [totalViews, uniqueVisitors, totalClicks, deviceBreakdown, browserBreakdown, topPages, dailyTrend] = await Promise.all([
    PageView.countDocuments({ createdAt: { $gte: since }, isBot: { $ne: true } }),
    PageView.distinct('sessionId', { createdAt: { $gte: since }, isBot: { $ne: true } }).then(r => r.length),
    Deal.aggregate([{ $group: { _id: null, total: { $sum: '$clicks' } } }]).then(r => r[0]?.total || 0),
    PageView.aggregate([
      { $match: { createdAt: { $gte: since }, isBot: { $ne: true } } },
      { $group: { _id: '$deviceType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }, { $limit: 5 }
    ]),
    PageView.aggregate([
      { $match: { createdAt: { $gte: since }, isBot: { $ne: true } } },
      { $group: { _id: '$browser', count: { $sum: 1 } } },
      { $sort: { count: -1 } }, { $limit: 5 }
    ]),
    PageView.aggregate([
      { $match: { createdAt: { $gte: since }, isBot: { $ne: true } } },
      { $group: { _id: '$path', count: { $sum: 1 } } },
      { $sort: { count: -1 } }, { $limit: 10 }
    ]),
    PageView.aggregate([
      { $match: { createdAt: { $gte: since }, isBot: { $ne: true } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]),
  ]);

  return { totalViews, uniqueVisitors, totalClicks, deviceBreakdown, browserBreakdown, topPages, dailyTrend };
}

export default async function AdminAnalytics() {
  await connectToDatabase();
  const initialStats = await getAnalyticsStats(30);

  return <AnalyticsClientPage initialStats={initialStats} initialDays={30} />;
}
