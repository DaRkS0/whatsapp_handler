import type { Handle } from '@sveltejs/kit';

const ALLOWED_ORIGINS = [
  'https://graph.facebook.com', // Meta
  'https://developers.facebook.com',
];

export const handle: Handle = async ({ event, resolve }) => {
  const origin = event.request.headers.get('origin');

  const response = await resolve(event, {
    filterSerializedResponseHeaders(name) {
      // allow all headers to pass through
      return true;
    }
  });

  // SAME headers (important for webhooks)
  response.headers.set('Access-Control-Allow-Credentials', 'true');

  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  } else {
    // fallback (safe for same-origin)
    response.headers.set('Access-Control-Allow-Origin', '*');
  }

  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With'
  );

  response.headers.set(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS'
  );

  return response;
};
