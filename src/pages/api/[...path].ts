import type { APIRoute } from 'astro';
import api from '../../api';

export const ALL: APIRoute = async (context) => {
  return api.fetch(
    context.request,
    context.locals.runtime.env,
    context.locals.runtime
  );
};
