/// <reference types="astro/client" />

type Runtime = import('@astrojs/cloudflare').Runtime<import('./worker').Env>;

declare namespace App {
  interface Locals extends Runtime {}
}
