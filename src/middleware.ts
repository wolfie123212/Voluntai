import { defineMiddleware } from 'astro:middleware';
import { recordCityVisit } from './lib/db/visits';

const BOT_UA = /bot|crawl|spider|slurp|curl|wget|python|httpclient|go-http|java\/|headless|preview|scanner|monitor/i;
const SKIP_PATHS = /^\/(api|admin|_astro|_image)(\/|$)/;

export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();

  const runtime = context.locals.runtime;
  const db = runtime?.env?.DB;
  if (!db) return response;

  const { request, url } = context;
  if (request.method !== 'GET' || SKIP_PATHS.test(url.pathname)) return response;
  if (response.status !== 200 || !response.headers.get('content-type')?.includes('text/html')) return response;
  if (BOT_UA.test(request.headers.get('user-agent') ?? '')) return response;

  const cf = runtime.cf as { country?: string; region?: string; city?: string } | undefined;
  runtime.ctx.waitUntil(
    recordCityVisit(db, { country: cf?.country, region: cf?.region, city: cf?.city }).catch(() => {})
  );
  return response;
});
