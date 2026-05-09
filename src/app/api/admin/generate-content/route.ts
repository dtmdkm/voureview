import { NextResponse } from 'next/server';
import { generateWithAI } from '@/lib/ai';
import { getUnsplashImage } from '@/lib/unsplash';

export async function POST(request: Request) {
  try {
    const { type, category, variant, brandName, categoryName, benefits, description } = await request.json();
    const year = new Date().getFullYear();

    let prompt = '';
    let imageQuery = category || categoryName || brandName || 'business';

    if (type === 'blog') {
      const topicPrompt = variant === 'best' 
        ? `Write a **'Best ${category} in ${year}'** round-up review article. Feature 5–7 generic product types/categories. For each pick use <h3> with the type name + one-line verdict, then 2 short paragraphs.`
        : variant === 'guide'
        ? `Write a **buyer's guide** for ${category} in ${year}. Cover: what to look for, 5–7 key criteria (each as <h3>), budget tiers, and recommendation.`
        : `Write a high-quality **review-style article** about ${category} in ${year}.`;

      prompt = `
        You are a senior English SEO copywriter. ${topicPrompt}
        
        Requirements:
        - Language: English, E-E-A-T tone.
        - Length: 1,500-2,000 words.
        - HTML output rules: Return HTML fragment only. Allowed tags: <h1>, <h2>, <h3>, <p>, <ul>, <li>, <strong>.
        - Structure: <h1> title, first paragraph SEO snippet, <h2> summary, <h2> criteria, main body, <h2> FAQ (5 questions), <h2> final verdict.
      `;
    } else if (type === 'store_intro') {
      prompt = `
        Write a concise, SEO-optimized **"About Us" block** for the brand "${brandName}" in the category "${categoryName}".
        Facts: ${description}. Benefits: ${benefits}.
        
        Output rules:
        - Return HTML fragment only (<p>, <ul>, <li>, <strong>).
        - Length: 250-400 words.
        - Structure: Intro paragraph, Value proposition paragraph, <ul> with 3-5 pillars, Closing invitation.
        - DO NOT mention specific percentages like "10% off".
      `;
    } else if (type === 'category_desc') {
      prompt = `
        Write a concise SEO-optimized category description for "${categoryName}".
        Output rules: Return HTML fragment only (<p>, <strong>). 2 short paragraphs.
        First: what products belong here. Second: why browse for deals here.
      `;
    }

    const content = await generateWithAI(prompt);
    const image = await getUnsplashImage(imageQuery);

    // Extract title from <h1> if present
    let title = '';
    const titleMatch = content.match(/<h1>(.*?)<\/h1>/i);
    if (titleMatch) {
      title = titleMatch[1].replace(/<[^>]+>/g, '').trim();
    }

    return NextResponse.json({ 
      title, 
      content, 
      image 
    });

  } catch (error: any) {
    console.error('Generation Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
