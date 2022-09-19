const TITLE = 'STICA LMS';
const DESCRIPTION =
  'Stica LMS is an online library management system that helps students from STI College Alabang and the librarian to manage books easily.';
const URL = 'https://sticalms.com';
const OG_IMAGE_URL = `${URL}/assets/images/STI_LOGO.png`;

export default {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    type: 'website',
    url: URL,
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: OG_IMAGE_URL,
        width: 600,
        height: 600,
        alt: TITLE,
        type: 'image/png',
      },
    ],
    site_name: TITLE,
  },
  twitter: {
    cardType: 'summary_large_image',
  },
  additionalLinkTags: [
    {
      rel: 'icon',
      href: '/favicon.ico',
      type: 'image/x-icon',
    },
    {
      rel: 'apple-touch-icon',
      href: '/assets/icons/apple-touch-icon.png',
      sizes: '180x180',
    },
    {
      rel: 'manifest',
      href: '/site.webmanifest',
    },
  ],
  additionalMetaTags: [
    {
      name: 'viewport',
      content: 'initial-scale=1, viewport-fit=cover, user-scalable=no',
    },
  ],
};
