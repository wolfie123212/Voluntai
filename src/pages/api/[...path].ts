import type { APIRoute } from 'astro';
import api from '../../api';
import { recordCityVisit } from '../../lib/db/visits';

const SIGNIN_PATH = /^\/api\/auth\/(sign-in\/email|callback\/[a-z]+)$/;

export const ALL: APIRoute = async (context) => {
  const { runtime } = context.locals;
  const response = await api.fetch(context.request, runtime.env, runtime.ctx);

  if (
    SIGNIN_PATH.test(context.url.pathname) &&
    response.headers.get('set-cookie')?.includes('session_token')
  ) {
    const cf = runtime.cf as { country?: string; region?: string; city?: string } | undefined;
    runtime.ctx.waitUntil(
      recordCityVisit(runtime.env.DB, { country: cf?.country, region: cf?.region, city: cf?.city }, 'signin').catch(() => {})
    );
  }
  return response;
};
