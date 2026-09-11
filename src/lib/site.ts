/**
 * Site identity shared by the root layout's metadata and the client-side
 * hash router (which rewrites document.title on navigation). Keeping both on
 * one source stops the tab title and the share previews drifting apart.
 */
export const SITE = {
  name: "CONNECT",
  // Production origin. Pinned rather than inferred: without it Next resolves
  // canonical and og:url against http://localhost:3000, and share images
  // against whichever Vercel URL the build happened to run under.
  url: "https://connect.org.in",
  title: "CONNECT | Connect People. Create Opportunities. Grow Communities.",
  description:
    "CONNECT is a trusted digital ecosystem where professionals, students, organizations, entrepreneurs, and communities come together to build relationships, collaborate, and create meaningful impact.",
} as const;
