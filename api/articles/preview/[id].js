import fetch from 'node-fetch';

const SUPABASE_ENDPOINT = "https://glskqjpmcolfxteyqhzm.supabase.co/rest/v1/articles";

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    const response = await fetch(`${SUPABASE_ENDPOINT}?id=eq.${id}`, {
      headers: {
        apikey: process.env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
      },
    });

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
    console.error("Error fetching article:", error);
    res.status(500).send("Server error");
  }
} 