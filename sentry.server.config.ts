import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Filter out sensitive data
  beforeSend(event) {
    // Remove sensitive data from event
    if (event.request?.cookies) {
      delete event.request.cookies;
    }
    return event;
  },

  // Don't send errors in development
  enabled: process.env.NODE_ENV === 'production',
});
