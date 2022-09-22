import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export default async function middleware(req: NextRequest) {
  // const { url } = req;
  const userAgent = req.headers.get('user-agent') || '';

  const isMobile = Boolean(
    userAgent.match(
      /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
    )
  );

  // TODO: Comment this out later
  if (isMobile) {
    // return NextResponse.redirect(new URL('https://m.sticalms.com', url));
  }

  return NextResponse.next();
}
