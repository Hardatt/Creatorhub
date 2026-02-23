


const axios = require("axios");
const cache = require("@services/cache.service");

const CACHE_KEY = "unified_feed";
const CACHE_TTL = parseInt(process.env.FEED_CACHE_TTL) || 300; 


const SUBREDDITS = (process.env.REDDIT_SUBREDDITS || "programming,webdev,javascript")
  .split(",")
  .map((s) => s.trim());




async function fetchReddit() {
  const posts = [];

  await Promise.allSettled(
    SUBREDDITS.map(async (sub) => {
      try {
        const url = `https://www.reddit.com/r/${sub}/hot.json?limit=10`;
        const { data } = await axios.get(url, {
          headers: { "User-Agent": "CreatorDashboard/1.0" },
          timeout: 8000,
        });

        data.data.children.forEach(({ data: p }) => {
          posts.push({
            id: `reddit_${p.id}`,
            title: p.title,
            content: p.selftext ? p.selftext.slice(0, 400) : p.title,
            source: "reddit",
            url: `https://reddit.com${p.permalink}`,
            author: p.author,
            thumbnail:
              p.thumbnail && p.thumbnail.startsWith("http")
                ? p.thumbnail
                : null,
            upvotes: p.ups,
            publishedAt: new Date(p.created_utc * 1000).toISOString(),
          });
        });
      } catch (err) {
        console.warn(`[Feed] Reddit r/${sub} fetch failed:`, err.message);
      }
    })
  );

  return posts;
}


function getMockTwitter() {
  const mockTweets = [
    {
      id: "tw_001",
      title: "The future of web development is looking exciting!",
      content:
        "TypeScript 5.5 just dropped and the performance improvements are insane. Incremental builds are now 50% faster. #webdev #typescript",
      source: "twitter",
      url: "https://twitter.com/i/web/status/001",
      author: "@typescript",
      thumbnail: null,
      upvotes: 4821,
      publishedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    },
    {
      id: "tw_002",
      title: "React 19 stable is here",
      content:
        "React 19 is now stable! Server Components, Actions, and tons of new hooks. Time to upgrade your projects. Full blog post: react.dev/blog",
      source: "twitter",
      url: "https://twitter.com/i/web/status/002",
      author: "@reactjs",
      thumbnail: null,
      upvotes: 12300,
      publishedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    },
    {
      id: "tw_003",
      title: "AI-assisted coding is changing developer workflows",
      content:
        "Survey results: 72% of developers now use AI tools daily. Here's how it's reshaping how we build software. Thread below. 🧵",
      source: "twitter",
      url: "https://twitter.com/i/web/status/003",
      author: "@github",
      thumbnail: null,
      upvotes: 6700,
      publishedAt: new Date(Date.now() - 6 * 3600000).toISOString(),
    },
    {
      id: "tw_004",
      title: "Node.js 22 LTS – what you need to know",
      content:
        "Node.js 22 LTS released with native fetch, better ESM support, and improved diagnostics. Upgrade guide: nodejs.org/en/blog",
      source: "twitter",
      url: "https://twitter.com/i/web/status/004",
      author: "@nodejs",
      thumbnail: null,
      upvotes: 3400,
      publishedAt: new Date(Date.now() - 8 * 3600000).toISOString(),
    },
    {
      id: "tw_005",
      title: "Open-source spotlight: Best repos this week",
      content:
        "Curated list of the most exciting open-source repos trending this week. From UI libraries to DevOps tools. 🔥 #opensource",
      source: "twitter",
      url: "https://twitter.com/i/web/status/005",
      author: "@github_trending",
      thumbnail: null,
      upvotes: 2150,
      publishedAt: new Date(Date.now() - 10 * 3600000).toISOString(),
    },
  ];

  return mockTweets;
}


function getMockLinkedIn() {
  const mockPosts = [
    {
      id: "li_001",
      title: "10 lessons learned from building a SaaS to $1M ARR",
      content:
        "After 3 years of building in public, here are the most important lessons I've learned about product, growth, and team building...",
      source: "linkedin",
      url: "https://linkedin.com/posts/li_001",
      author: "Patrick Campbell",
      thumbnail: null,
      upvotes: 8932,
      publishedAt: new Date(Date.now() - 1 * 3600000).toISOString(),
    },
    {
      id: "li_002",
      title: "Why senior engineers think differently",
      content:
        "It's not about writing more code. Senior engineers focus on reducing complexity, improving team velocity, and making decisions that age well...",
      source: "linkedin",
      url: "https://linkedin.com/posts/li_002",
      author: "Gergely Orosz",
      thumbnail: null,
      upvotes: 14200,
      publishedAt: new Date(Date.now() - 3 * 3600000).toISOString(),
    },
    {
      id: "li_003",
      title: "The hidden cost of technical debt",
      content:
        "We estimated our technical debt was costing us 30% of engineering velocity. Here's how we quantified it and built a plan to pay it down systematically...",
      source: "linkedin",
      url: "https://linkedin.com/posts/li_003",
      author: "Charity Majors",
      thumbnail: null,
      upvotes: 5600,
      publishedAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    },
    {
      id: "li_004",
      title: "Remote work best practices for distributed teams in 2024",
      content:
        "After managing distributed teams across 4 time zones, here are the communication and collaboration practices that actually work...",
      source: "linkedin",
      url: "https://linkedin.com/posts/li_004",
      author: "Sid Sijbrandij",
      thumbnail: null,
      upvotes: 4100,
      publishedAt: new Date(Date.now() - 7 * 3600000).toISOString(),
    },
  ];

  return mockPosts;
}



async function getUnifiedFeed() {
  
  const cached = await cache.get(CACHE_KEY);
  if (cached) return cached;

  const [redditPosts, twitterPosts, linkedinPosts] = await Promise.all([
    fetchReddit(),
    Promise.resolve(getMockTwitter()),
    Promise.resolve(getMockLinkedIn()),
  ]);

  
  const unified = [...redditPosts, ...twitterPosts, ...linkedinPosts].sort(
    (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)
  );

  await cache.set(CACHE_KEY, unified, CACHE_TTL);

  return unified;
}



async function invalidateFeedCache() {
  await cache.del(CACHE_KEY);
}

module.exports = { getUnifiedFeed, invalidateFeedCache };
