import fetch from 'node-fetch';

const SUPABASE_ENDPOINT = "https://glskqjpmcolfxteyqhzm.supabase.co/rest/v1/articles";

export default async function handler(req, res) {
  const { shortId } = req.query;

  try {
    let articleId = null;
    let lookupByShortId = false;

    // If shortId is 6 chars, treat as short_id; else, try to decode as base64 article_id
    if (/^[a-zA-Z0-9]{6}$/.test(shortId)) {
      lookupByShortId = true;
    } else {
      // Try to decode base64 (URL-safe)
      let base64 = shortId.replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4) base64 += '=';
      try {
        articleId = Buffer.from(base64, 'base64').toString('utf-8');
      } catch (e) {
        articleId = null;
      }
    }

    let articleIdToFetch = null;
    if (lookupByShortId) {
      // Look up the article ID from the url_shortener table by short_id
      const urlShortenerResponse = await fetch(
        `${SUPABASE_ENDPOINT.replace('/articles', '/url_shortener')}?short_id=eq.${shortId}`,
        {
          headers: {
            apikey: process.env.SUPABASE_ANON_KEY,
            Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
          },
        }
      );
      const urlShortenerData = await urlShortenerResponse.json();
      articleIdToFetch = urlShortenerData[0]?.article_id;
    } else if (articleId) {
      articleIdToFetch = articleId;
    }

    if (!articleIdToFetch) {
      res.status(404).send("Short URL not found");
      return;
    }

    // Fetch the article as usual
    const response = await fetch(
      `${SUPABASE_ENDPOINT}?id=eq.${articleIdToFetch}`,
      {
        headers: {
          apikey: process.env.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        },
      }
    );
    const data = await response.json();
    const article = data[0];

    if (!article) {
      res.status(404).send("Article not found");
      return;
    }

    res.setHeader("Content-Type", "text/html");
    res.send(`
      <!DOCTYPE html>
      <html lang=\"en\">
      <head>
        <meta charset=\"UTF-8\" />
        <meta property=\"og:title\" content=\"${article.title}\" />
        <meta property=\"og:description\" content=\"${article.summary}\" />
        <meta property=\"og:image\" content=\"${article.featured_image_url}\" />
        <meta property=\"og:image:width\" content=\"1200\" />
        <meta property=\"og:image:height\" content=\"630\" />
        <meta property=\"og:url\" content=\"https://voiceofbharat.live/article/${article.slug}\" />
        <meta property=\"og:type\" content=\"article\" />
        <meta name=\"twitter:card\" content=\"summary_large_image\" />
        <meta name=\"twitter:title\" content=\"${article.title}\" />
        <meta name=\"twitter:description\" content=\"${article.summary}\" />
        <meta name=\"twitter:image\" content=\"${article.featured_image_url}\" />
      </head>
      <body>
        <script>
          window.location.href = \"https://voiceofbharat.live/article/${article.slug}\";
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error("Error fetching article by shortId:", error);
    res.status(500).send("Server error");
  }
} 