const express = require("express");
const fetch = require("node-fetch");
const app = express();
const PORT = process.env.PORT || 3000;

// Replace with your Supabase REST or Edge Function endpoint
const SUPABASE_ENDPOINT = "https://glskqjpmcolfxteyqhzm.supabase.co/rest/v1/articles";
const VIDEOS_ENDPOINT = "https://glskqjpmcolfxteyqhzm.supabase.co/rest/v1/videos";
const SHORTENER_ENDPOINT = "https://glskqjpmcolfxteyqhzm.supabase.co/rest/v1/url_shortener";
const SOCIALS_ENDPOINT = "https://glskqjpmcolfxteyqhzm.supabase.co/rest/v1/socials";
const LIVE_ENDPOINT = "https://glskqjpmcolfxteyqhzm.supabase.co/rest/v1/live_streams";

// Helper to fetch Facebook page link
async function getFacebookUrl() {
  try {
    const socialsRes = await fetch(`${SOCIALS_ENDPOINT}?select=facebook_url&limit=1`, {
      headers: {
        apikey: process.env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
      },
    });
    const socialsData = await socialsRes.json();
    return socialsData[0]?.facebook_url || '';
  } catch {
    return '';
  }
}

// --- ARTICLE ENDPOINTS ---

app.get("/api/articles/p/:shortId", async (req, res) => {
  const { shortId } = req.params;
  try {
    let articleId = null;
    let lookupByShortId = false;
    if (/^[a-zA-Z0-9]{6}$/.test(shortId)) {
      lookupByShortId = true;
    } else {
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
      return res.status(404).send("Short URL not found");
    }
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
      return res.status(404).send("Article not found");
    }
    const facebookUrl = await getFacebookUrl();
    const title = article.title_hi || article.title;
    const description = article.summary_hi || article.summary || '';
    const shortDescription = description.split(/[.!?\n]/)[0];
    const facebookCta = facebookUrl ? `\n\nऔर खबरों के लिए हमें फेसबुक पर फॉलो करें: ${facebookUrl}` : '';
    const fullDescription = `${shortDescription}${facebookCta}`;
    res.setHeader("Content-Type", "text/html");
    res.send(`
      <!DOCTYPE html>
      <html lang=\"hi\">
      <head>
        <meta charset=\"UTF-8\" />
        <meta property=\"og:title\" content=\"${title}\" />
        <meta property=\"og:description\" content=\"${fullDescription}\" />
        <meta property=\"og:image\" content=\"${article.featured_image_url}\" />
        <meta property=\"og:image:width\" content=\"1200\" />
        <meta property=\"og:image:height\" content=\"630\" />
        <meta property=\"og:url\" content=\"https://voiceofbharat.live/article/${article.slug}\" />
        <meta property=\"og:type\" content=\"article\" />
        <meta name=\"twitter:card\" content=\"summary_large_image\" />
        <meta name=\"twitter:title\" content=\"${title}\" />
        <meta name=\"twitter:description\" content=\"${fullDescription}\" />
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
});

app.get("/api/articles/preview/:id", async (req, res) => {
  const { id } = req.params;
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
      return res.status(404).send("Article not found");
    }
    const facebookUrl = await getFacebookUrl();
    const title = article.title_hi || article.title;
    const description = article.summary_hi || article.summary || '';
    const shortDescription = description.split(/[.!?\n]/)[0];
    const facebookCta = facebookUrl ? `\n\nऔर खबरों के लिए हमें फेसबुक पर फॉलो करें: ${facebookUrl}` : '';
    const fullDescription = `${shortDescription}${facebookCta}`;
    res.setHeader("Content-Type", "text/html");
    res.send(`
      <!DOCTYPE html>
      <html lang=\"hi\">
      <head>
        <meta charset=\"UTF-8\" />
        <meta property=\"og:title\" content=\"${title}\" />
        <meta property=\"og:description\" content=\"${fullDescription}\" />
        <meta property=\"og:image\" content=\"${article.featured_image_url}\" />
        <meta property=\"og:image:width\" content=\"1200\" />
        <meta property=\"og:image:height\" content=\"630\" />
        <meta property=\"og:url\" content=\"https://voiceofbharat.live/article/${article.slug}\" />
        <meta property=\"og:type\" content=\"article\" />
        <meta name=\"twitter:card\" content=\"summary_large_image\" />
        <meta name=\"twitter:title\" content=\"${title}\" />
        <meta name=\"twitter:description\" content=\"${fullDescription}\" />
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
});

// --- VIDEO ENDPOINTS ---

app.get("/api/videos/p/:shortId", async (req, res) => {
  const { shortId } = req.params;
  try {
    let videoId = null;
    let lookupByShortId = false;
    if (/^[a-zA-Z0-9]{6}$/.test(shortId)) {
      lookupByShortId = true;
    } else {
      let base64 = shortId.replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4) base64 += '=';
      try {
        videoId = Buffer.from(base64, 'base64').toString('utf-8');
      } catch (e) {
        videoId = null;
      }
    }
    let videoIdToFetch = null;
    if (lookupByShortId) {
      const urlShortenerResponse = await fetch(
        `${SHORTENER_ENDPOINT}?video_id=not.is.null&short_id=eq.${shortId}`,
        {
          headers: {
            apikey: process.env.SUPABASE_ANON_KEY,
            Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
          },
        }
      );
      const urlShortenerData = await urlShortenerResponse.json();
      videoIdToFetch = urlShortenerData[0]?.video_id;
    } else if (videoId) {
      videoIdToFetch = videoId;
    }
    if (!videoIdToFetch) {
      return res.status(404).send("Short URL not found");
    }
    const response = await fetch(
      `${VIDEOS_ENDPOINT}?id=eq.${videoIdToFetch}`,
      {
        headers: {
          apikey: process.env.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        },
      }
    );
    const data = await response.json();
    const video = data[0];
    if (!video) {
      return res.status(404).send("Video not found");
    }
    const facebookUrl = await getFacebookUrl();
    const title = video.title_hi || video.title;
    const description = video.description_hi || video.description || '';
    const shortDescription = description.split(/[.!?\n]/)[0];
    const facebookCta = facebookUrl ? `\n\nऔर खबरों के लिए हमें फेसबुक पर फॉलो करें: ${facebookUrl}` : '';
    const fullDescription = `${shortDescription}${facebookCta}`;
    res.setHeader("Content-Type", "text/html");
    res.send(`
      <!DOCTYPE html>
      <html lang=\"hi\">
      <head>
        <meta charset=\"UTF-8\" />
        <meta property=\"og:title\" content=\"${title}\" />
        <meta property=\"og:description\" content=\"${fullDescription}\" />
        <meta property=\"og:image\" content=\"${video.thumbnail_url || video.featured_image_url || ''}\" />
        <meta property=\"og:image:width\" content=\"1200\" />
        <meta property=\"og:image:height\" content=\"630\" />
        <meta property=\"og:url\" content=\"https://voiceofbharat.live/video/${video.id}\" />
        <meta property=\"og:type\" content=\"video.other\" />
        <meta name=\"twitter:card\" content=\"summary_large_image\" />
        <meta name=\"twitter:title\" content=\"${title}\" />
        <meta name=\"twitter:description\" content=\"${fullDescription}\" />
        <meta name=\"twitter:image\" content=\"${video.thumbnail_url || video.featured_image_url || ''}\" />
      </head>
      <body>
        <script>
          window.location.href = \"https://voiceofbharat.live/video/${video.id}\";
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error("Error fetching video by shortId:", error);
    res.status(500).send("Server error");
  }
});

app.get("/api/videos/preview/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const response = await fetch(`${VIDEOS_ENDPOINT}?id=eq.${id}`,
      {
        headers: {
          apikey: process.env.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        },
      }
    );
    const data = await response.json();
    const video = data[0];
    if (!video) {
      return res.status(404).send("Video not found");
    }
    const facebookUrl = await getFacebookUrl();
    const title = video.title_hi || video.title;
    const description = video.description_hi || video.description || '';
    const shortDescription = description.split(/[.!?\n]/)[0];
    const facebookCta = facebookUrl ? `\n\nऔर खबरों के लिए हमें फेसबुक पर फॉलो करें: ${facebookUrl}` : '';
    const fullDescription = `${shortDescription}${facebookCta}`;
    res.setHeader("Content-Type", "text/html");
    res.send(`
      <!DOCTYPE html>
      <html lang=\"hi\">
      <head>
        <meta charset=\"UTF-8\" />
        <meta property=\"og:title\" content=\"${video.title_hi || video.title}\" />
        <meta property=\"og:description\" content=\"${video.description_hi || video.description || ''}\" />
        <meta property=\"og:image\" content=\"${video.thumbnail_url || video.featured_image_url || ''}\" />
        <meta property=\"og:image:width\" content=\"1200\" />
        <meta property=\"og:image:height\" content=\"630\" />
        <meta property=\"og:url\" content=\"https://voiceofbharat.live/video/${video.id}\" />
        <meta property=\"og:type\" content=\"video.other\" />
        <meta name=\"twitter:card\" content=\"summary_large_image\" />
        <meta name=\"twitter:title\" content=\"${video.title_hi || video.title}\" />
        <meta name=\"twitter:description\" content=\"${video.description_hi || video.description || ''}\" />
        <meta name=\"twitter:image\" content=\"${video.thumbnail_url || video.featured_image_url || ''}\" />
      </head>
      <body>
        <script>
          setTimeout(function() {
            window.location.href = \"https://voiceofbharat.live/video/${video.id}\";
          }, 2500);
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error("Error fetching video:", error);
    res.status(500).send("Server error");
  }
});

// --- LIVE STREAM ENDPOINTS ---

app.get("/api/live/p/:shortId", async (req, res) => {
  const { shortId } = req.params;
  try {
    let liveId = null;
    let lookupByShortId = false;
    if (/^[a-zA-Z0-9]{6}$/.test(shortId)) {
      lookupByShortId = true;
    } else {
      let base64 = shortId.replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4) base64 += '=';
      try {
        liveId = Buffer.from(base64, 'base64').toString('utf-8');
      } catch (e) {
        liveId = null;
      }
    }
    let liveIdToFetch = null;
    if (lookupByShortId) {
      const urlShortenerResponse = await fetch(
        `${SHORTENER_ENDPOINT}?live_id=not.is.null&short_id=eq.${shortId}`,
        {
          headers: {
            apikey: process.env.SUPABASE_ANON_KEY,
            Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
          },
        }
      );
      const urlShortenerData = await urlShortenerResponse.json();
      liveIdToFetch = urlShortenerData[0]?.live_id;
    } else if (liveId) {
      liveIdToFetch = liveId;
    }
    if (!liveIdToFetch) {
      return res.status(404).send("Short URL not found");
    }
    const response = await fetch(
      `${LIVE_ENDPOINT}?id=eq.${liveIdToFetch}`,
      {
        headers: {
          apikey: process.env.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        },
      }
    );
    const data = await response.json();
    const live = data[0];
    if (!live) {
      return res.status(404).send("Live stream not found");
    }
    const facebookUrl = await getFacebookUrl();
    const title = live.title_hi || live.title;
    const description = live.description_hi || live.description || '';
    const shortDescription = description.split(/[.!?\n]/)[0];
    const facebookCta = facebookUrl ? `\n\nऔर खबरों के लिए हमें फेसबुक पर फॉलो करें: ${facebookUrl}` : '';
    const fullDescription = `${shortDescription}${facebookCta}`;
    res.setHeader("Content-Type", "text/html");
    res.send(`
      <!DOCTYPE html>
      <html lang=\"hi\">
      <head>
        <meta charset=\"UTF-8\" />
        <meta property=\"og:title\" content=\"${title}\" />
        <meta property=\"og:description\" content=\"${fullDescription}\" />
        <meta property=\"og:image\" content=\"${live.thumbnail_url || live.featured_image_url || ''}\" />
        <meta property=\"og:image:width\" content=\"1200\" />
        <meta property=\"og:image:height\" content=\"630\" />
        <meta property=\"og:url\" content=\"https://voiceofbharat.live/live/${live.id}\" />
        <meta property=\"og:type\" content=\"video.other\" />
        <meta name=\"twitter:card\" content=\"summary_large_image\" />
        <meta name=\"twitter:title\" content=\"${title}\" />
        <meta name=\"twitter:description\" content=\"${fullDescription}\" />
        <meta name=\"twitter:image\" content=\"${live.thumbnail_url || live.featured_image_url || ''}\" />
      </head>
      <body>
        <script>
          window.location.href = \"https://voiceofbharat.live/live/${live.id}\";
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error("Error fetching live by shortId:", error);
    res.status(500).send("Server error");
  }
});

app.get("/api/live/preview/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const response = await fetch(`${LIVE_ENDPOINT}?id=eq.${id}`,
      {
        headers: {
          apikey: process.env.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        },
      }
    );
    const data = await response.json();
    const live = data[0];
    if (!live) {
      return res.status(404).send("Live stream not found");
    }
    const facebookUrl = await getFacebookUrl();
    const title = live.title_hi || live.title;
    const description = live.description_hi || live.description || '';
    const shortDescription = description.split(/[.!?\n]/)[0];
    const facebookCta = facebookUrl ? `\n\nऔर खबरों के लिए हमें फेसबुक पर फॉलो करें: ${facebookUrl}` : '';
    const fullDescription = `${shortDescription}${facebookCta}`;
    res.setHeader("Content-Type", "text/html");
    res.send(`
      <!DOCTYPE html>
      <html lang=\"hi\">
      <head>
        <meta charset=\"UTF-8\" />
        <meta property=\"og:title\" content=\"${live.title_hi || live.title}\" />
        <meta property=\"og:description\" content=\"${live.description_hi || live.description || ''}\" />
        <meta property=\"og:image\" content=\"${live.thumbnail_url || live.featured_image_url || ''}\" />
        <meta property=\"og:image:width\" content=\"1200\" />
        <meta property=\"og:image:height\" content=\"630\" />
        <meta property=\"og:url\" content=\"https://voiceofbharat.live/live/${live.id}\" />
        <meta property=\"og:type\" content=\"video.other\" />
        <meta name=\"twitter:card\" content=\"summary_large_image\" />
        <meta name=\"twitter:title\" content=\"${live.title_hi || live.title}\" />
        <meta name=\"twitter:description\" content=\"${live.description_hi || live.description || ''}\" />
        <meta name=\"twitter:image\" content=\"${live.thumbnail_url || live.featured_image_url || ''}\" />
      </head>
      <body>
        <script>
          setTimeout(function() {
            window.location.href = \"https://voiceofbharat.live/live/${live.id}\";
          }, 2500);
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error("Error fetching live:", error);
    res.status(500).send("Server error");
  }
});

app.listen(PORT, () => {
  console.log(`OG meta server running on port ${PORT}`);
}); 