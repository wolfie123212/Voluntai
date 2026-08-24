// Server-side Google OAuth initiator.
// Better Auth returns 200+JSON (not 302) for /sign-in/social.
// We copy cookies (OAuth state) + redirect to the Google URL.
import type { APIRoute } from 'astro';
import { createAuth } from '../../lib/auth';

export const GET: APIRoute = async ({ locals, redirect, request }) => {
  const env = locals.runtime?.env;

  if (!env || !env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    console.error('[google] missing env or credentials — client_id:', !!env?.GOOGLE_CLIENT_ID, 'secret:', !!env?.GOOGLE_CLIENT_SECRET);
    return redirect('/signin?error=config');
  }

  try {
    const auth = createAuth(env);
    const cookieHeader = request.headers.get('Cookie') ?? '';

    const baReq = new Request(`${env.APP_BASE_URL}/api/auth/sign-in/social`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
      body: JSON.stringify({
        provider: 'google',
        callbackURL: '/account',
      }),
    });

    const baRes = await auth.handler(baReq);

    // Log response details (visible in Cloudflare Pages → Functions → Real-time logs)
    console.log('[google] Better Auth status:', baRes.status);
    console.log('[google] Better Auth headers:', JSON.stringify(Object.fromEntries(baRes.headers.entries())));

    // Clone before reading body (body can only be consumed once)
    const baResClone = baRes.clone();

    // Try JSON body first (Better Auth always returns 200+JSON for social sign-in)
    let googleUrl: string | null = null;
    try {
      const data = await baResClone.json() as { url?: string; redirect?: string; error?: string; message?: string };
      console.log('[google] Better Auth JSON:', JSON.stringify(data));
      googleUrl = data.url ?? data.redirect ?? null;
    } catch (e) {
      console.error('[google] failed to parse JSON:', e);
    }

    // Fall back to Location header (just in case)
    if (!googleUrl) {
      googleUrl = baRes.headers.get('Location');
      console.log('[google] Location header fallback:', googleUrl);
    }

    if (!googleUrl) {
      console.error('[google] no URL from Better Auth — redirecting to error');
      return redirect('/signin?error=oauth');
    }

    console.log('[google] redirecting to:', googleUrl.slice(0, 80) + '...');

    // Forward all Set-Cookie headers (OAuth state / PKCE verifier cookies)
    const res = redirect(googleUrl, 302);
    for (const [key, val] of baRes.headers.entries()) {
      if (key.toLowerCase() === 'set-cookie') {
        res.headers.append('Set-Cookie', val);
      }
    }
    return res;

  } catch (err) {
    console.error('[google] threw:', err instanceof Error ? err.message : String(err));
    return redirect('/signin?error=oauth');
  }
};
