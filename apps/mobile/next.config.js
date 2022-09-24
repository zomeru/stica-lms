const withTM = require('next-transpile-modules')(['ui']);

module.exports = withTM({
  reactStrictMode: false,
  images: {
    domains: [
      'firebasestorage.googleapis.com',
      'storage.googleapis.com',
      'i.imgur.com',
      'imgur.com',
    ],
  },
});
