/**
 * Cloudflare Worker for Dr. Jii API
 * This proxies requests to your FastAPI backend
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Basic routing for API endpoints
    if (url.pathname.startsWith('/api/')) {
      return handleAPIRequest(request, env);
    }

    // Serve frontend files
    if (url.pathname === '/' || url.pathname.startsWith('/frontend/')) {
      return handleFrontendRequest(request, url);
    }

    // Health check
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'healthy',
        service: 'Dr. Jii API',
        timestamp: new Date().toISOString()
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response('Not Found', { status: 404 });
  },
};

async function handleAPIRequest(request, env) {
  // This would need to be adapted to work with Cloudflare D1 database
  // For now, return a placeholder response
  return new Response(JSON.stringify({
    message: 'API endpoint - needs D1 database integration',
    endpoint: new URL(request.url).pathname
  }), {
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
  });
}

async function handleFrontendRequest(request, url) {
  // Serve static frontend files
  // This would be handled by Cloudflare Pages
  return new Response('Frontend served by Cloudflare Pages', {
    headers: { 'Content-Type': 'text/html' },
  });
}