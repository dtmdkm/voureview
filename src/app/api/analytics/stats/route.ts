import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { PageView, Deal } from '@/models';

export async function GET(request: Request) {
  await connectToDatabase();
  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get('days') || '30');
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [totalViews, uniqueIps, deviceBreakdown, browserBreakdown, topPages, clicksTotal] = await Promise.all([
    PageView.countDocuments({ createdAt: { $gte: since }, isBot: false }),
    PageView.distinct('ip', { createdAt: { $gte: since }, isBot: false }).then((r: string[]) => r.length),
    PageView.aggregate([
      { $match: { createdAt: { $gte: since }, isBot: false } },
      { $group: { _id: '$deviceType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    PageView.aggregate([
      { $match: { createdAt: { $gte: since }, isBot: false } },
      { $group: { _id: '$browser', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    PageView.aggregate([
      { $match: { createdAt: { $gte: since }, isBot: false } },
      { $group: { _id: '$path', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]),
    Deal.aggregate([{ $group: { _id: null, total: { $sum: '$clicks' } } }])
  ]);

  // Daily trend (last N days)
  const dailyTrend = await PageView.aggregate([
    { $match: { createdAt: { $gte: since }, isBot: false } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  return NextResponse.json({
    totalViews,
    uniqueVisitors: uniqueIps,
    totalClicks: clicksTotal[0]?.total || 0,
    deviceBreakdown,
    browserBreakdown,
    topPages,
    dailyTrend,
  });
}
