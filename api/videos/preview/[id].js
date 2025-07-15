import fetch from 'node-fetch';

const SUPABASE_ENDPOINT = "https://glskqjpmcolfxteyqhzm.supabase.co/rest/v1/videos";

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
    const video = data[0];

    if (!video) {
      res.status(404).send("Video not found");
      return;
    }

    res.setHeader("Content-Type", "text/html");
    res.send(`
      <!DOCTYPE html>
      <html lang=\"en\">
      <head>
        <meta charset=\"UTF-8\" />
        <meta property=\"og:title\" content=\"${video.title}\" />
        <meta property=\"og:description\" content=\"${video.description}\" />
        <meta property=\"og:image\" content=\"${video.thumbnail_url || ''}\" />
        <meta property=\"og:image:width\" content=\"1200\" />
        <meta property=\"og:image:height\" content=\"630\" />
        <meta property=\"og:url\" content=\"https://voiceofbharat.live/video/${video.id}\" />
        <meta property=\"og:type\" content=\"video.other\" />
        <meta name=\"twitter:card\" content=\"summary_large_image\" />
        <meta name=\"twitter:title\" content=\"${video.title}\" />
        <meta name=\"twitter:description\" content=\"${video.description}\" />
        <meta name=\"twitter:image\" content=\"${video.thumbnail_url || ''}\" />
      </head>
      <body>
        <script>
          window.location.href = \"https://voiceofbharat.live/video/${video.id}\";
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error("Error fetching video:", error);
    res.status(500).send("Server error");
  }
} 