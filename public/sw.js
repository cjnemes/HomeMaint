if (!self.define) {
  let e,
    s = {};
  const n = (n, a) => (
    (n = new URL(n + '.js', a).href),
    s[n] ||
      new Promise((s) => {
        if ('document' in self) {
          const e = document.createElement('script');
          ((e.src = n), (e.onload = s), document.head.appendChild(e));
        } else ((e = n), importScripts(n), s());
      }).then(() => {
        let e = s[n];
        if (!e) throw new Error(`Module ${n} didn’t register its module`);
        return e;
      })
  );
  self.define = (a, i) => {
    const t = e || ('document' in self ? document.currentScript.src : '') || location.href;
    if (s[t]) return;
    let c = {};
    const r = (e) => n(e, t),
      f = { module: { uri: t }, exports: c, require: r };
    s[t] = Promise.all(a.map((e) => f[e] || r(e))).then((e) => (i(...e), c));
  };
}
define(['./workbox-f1770938'], function (e) {
  'use strict';
  (importScripts(),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        { url: '/_next/static/chunks/253-9b71a68ec4f3bdda.js', revision: 'yU9SUBU_z7mEfQ-df-bUz' },
        { url: '/_next/static/chunks/265-264f5bb369f38cf0.js', revision: 'yU9SUBU_z7mEfQ-df-bUz' },
        { url: '/_next/static/chunks/431-df3775dba3b21de8.js', revision: 'yU9SUBU_z7mEfQ-df-bUz' },
        { url: '/_next/static/chunks/446-6f1708f89c8bceb2.js', revision: 'yU9SUBU_z7mEfQ-df-bUz' },
        { url: '/_next/static/chunks/595-388617f755417642.js', revision: 'yU9SUBU_z7mEfQ-df-bUz' },
        { url: '/_next/static/chunks/972-5084fb754061064c.js', revision: 'yU9SUBU_z7mEfQ-df-bUz' },
        { url: '/_next/static/chunks/997-5fdc07412f8c389c.js', revision: 'yU9SUBU_z7mEfQ-df-bUz' },
        {
          url: '/_next/static/chunks/app/_not-found/page-be8588611fc70067.js',
          revision: 'yU9SUBU_z7mEfQ-df-bUz',
        },
        {
          url: '/_next/static/chunks/app/assets/%5Bid%5D/page-dd3684143e955fd6.js',
          revision: 'yU9SUBU_z7mEfQ-df-bUz',
        },
        {
          url: '/_next/static/chunks/app/assets/page-aace3bcab7261e9d.js',
          revision: 'yU9SUBU_z7mEfQ-df-bUz',
        },
        {
          url: '/_next/static/chunks/app/dashboard/page-da9dbd02ea3fa5c3.js',
          revision: 'yU9SUBU_z7mEfQ-df-bUz',
        },
        {
          url: '/_next/static/chunks/app/layout-179fce7d78277c81.js',
          revision: 'yU9SUBU_z7mEfQ-df-bUz',
        },
        {
          url: '/_next/static/chunks/app/maintenance/page-7bf71123d3437187.js',
          revision: 'yU9SUBU_z7mEfQ-df-bUz',
        },
        {
          url: '/_next/static/chunks/app/page-0b29573712b19a94.js',
          revision: 'yU9SUBU_z7mEfQ-df-bUz',
        },
        {
          url: '/_next/static/chunks/app/providers/page-d0ceff70e7e74518.js',
          revision: 'yU9SUBU_z7mEfQ-df-bUz',
        },
        {
          url: '/_next/static/chunks/app/settings/page-224a57e870dfa5c2.js',
          revision: 'yU9SUBU_z7mEfQ-df-bUz',
        },
        {
          url: '/_next/static/chunks/app/tasks/page-dde902866368628a.js',
          revision: 'yU9SUBU_z7mEfQ-df-bUz',
        },
        {
          url: '/_next/static/chunks/fd9d1056-7d6903c881af6d53.js',
          revision: 'yU9SUBU_z7mEfQ-df-bUz',
        },
        {
          url: '/_next/static/chunks/framework-f66176bb897dc684.js',
          revision: 'yU9SUBU_z7mEfQ-df-bUz',
        },
        { url: '/_next/static/chunks/main-3191179419fc9968.js', revision: 'yU9SUBU_z7mEfQ-df-bUz' },
        {
          url: '/_next/static/chunks/main-app-c26540f9f02f1297.js',
          revision: 'yU9SUBU_z7mEfQ-df-bUz',
        },
        {
          url: '/_next/static/chunks/pages/_app-72b849fbd24ac258.js',
          revision: 'yU9SUBU_z7mEfQ-df-bUz',
        },
        {
          url: '/_next/static/chunks/pages/_error-7ba65e1336b92748.js',
          revision: 'yU9SUBU_z7mEfQ-df-bUz',
        },
        {
          url: '/_next/static/chunks/polyfills-42372ed130431b0a.js',
          revision: '846118c33b2c0e922d7b3a7676f81f6f',
        },
        {
          url: '/_next/static/chunks/webpack-8b785e33a384d227.js',
          revision: 'yU9SUBU_z7mEfQ-df-bUz',
        },
        { url: '/_next/static/css/e8e4a0f70deecb6d.css', revision: 'e8e4a0f70deecb6d' },
        {
          url: '/_next/static/yU9SUBU_z7mEfQ-df-bUz/_buildManifest.js',
          revision: 'c155cce658e53418dec34664328b51ac',
        },
        {
          url: '/_next/static/yU9SUBU_z7mEfQ-df-bUz/_ssgManifest.js',
          revision: 'b6652df95db52feb4daf4eca35380933',
        },
        { url: '/apple-touch-icon.png', revision: 'af3f88794f1cee2fadc5b4c52b149e37' },
        { url: '/favicon.ico', revision: '7dbfefb60cbda9b1588261dabb210d09' },
        { url: '/icon-16x16.png', revision: 'c249da33ad2492f83da204224dec9c5d' },
        { url: '/icon-180x180.png', revision: 'af3f88794f1cee2fadc5b4c52b149e37' },
        { url: '/icon-192x192.png', revision: '2b63289f5f88270bea27d7ca773789a9' },
        { url: '/icon-32x32.png', revision: '7dbfefb60cbda9b1588261dabb210d09' },
        { url: '/icon-48x48.png', revision: '12ec16d9bef8f01950e2f71fb4817748' },
        { url: '/icon-512x512.png', revision: '6ae54d1aad16bbe52d179fd5c77e3f52' },
        { url: '/icon.svg', revision: 'ca00aaaec83f3dddc83ee61fb7297d64' },
        { url: '/manifest.json', revision: 'e1f4dde01b5dbafa3d8fe43e6b1be0c2' },
      ],
      { ignoreURLParametersMatching: [/^utm_/, /^fbclid$/] }
    ),
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      '/',
      new e.NetworkFirst({
        cacheName: 'start-url',
        plugins: [
          {
            cacheWillUpdate: async ({ response: e }) =>
              e && 'opaqueredirect' === e.type
                ? new Response(e.body, { status: 200, statusText: 'OK', headers: e.headers })
                : e,
          },
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
      new e.CacheFirst({
        cacheName: 'google-fonts-webfonts',
        plugins: [new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 31536e3 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
      new e.StaleWhileRevalidate({
        cacheName: 'google-fonts-stylesheets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-font-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-image-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 2592e3 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\/_next\/static.+\.js$/i,
      new e.CacheFirst({
        cacheName: 'next-static-js-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\/_next\/image\?url=.+$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'next-image',
        plugins: [new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:mp3|wav|ogg)$/i,
      new e.CacheFirst({
        cacheName: 'static-audio-assets',
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:mp4|webm)$/i,
      new e.CacheFirst({
        cacheName: 'static-video-assets',
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:js)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-js-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 48, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:css|less)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-style-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\/_next\/data\/.+\/.+\.json$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'next-data',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:json|xml|csv)$/i,
      new e.NetworkFirst({
        cacheName: 'static-data-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      ({ sameOrigin: e, url: { pathname: s } }) =>
        !(!e || s.startsWith('/api/auth/callback') || !s.startsWith('/api/')),
      new e.NetworkFirst({
        cacheName: 'apis',
        networkTimeoutSeconds: 10,
        plugins: [new e.ExpirationPlugin({ maxEntries: 16, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      ({ request: e, url: { pathname: s }, sameOrigin: n }) =>
        '1' === e.headers.get('RSC') &&
        '1' === e.headers.get('Next-Router-Prefetch') &&
        n &&
        !s.startsWith('/api/'),
      new e.NetworkFirst({
        cacheName: 'pages-rsc-prefetch',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      ({ request: e, url: { pathname: s }, sameOrigin: n }) =>
        '1' === e.headers.get('RSC') && n && !s.startsWith('/api/'),
      new e.NetworkFirst({
        cacheName: 'pages-rsc',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      ({ url: { pathname: e }, sameOrigin: s }) => s && !e.startsWith('/api/'),
      new e.NetworkFirst({
        cacheName: 'pages',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      ({ sameOrigin: e }) => !e,
      new e.NetworkFirst({
        cacheName: 'cross-origin',
        networkTimeoutSeconds: 10,
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 3600 })],
      }),
      'GET'
    ),
    (self.__WB_DISABLE_DEV_LOGS = !0));
});
