import { siteUrl } from "./env";

/**
 * What type of layout is used on the page
 */
export const PageLayout = {
  Home: "home",
  Subpage: "subpage",
} as const;
export type PageLayout = (typeof PageLayout)[keyof typeof PageLayout];

export type PageMeta = {
  /**
   * Full URL to the subpage
   */
  url: URL;
  /**
   * What type of layout is used on the page
   */
  layout: PageLayout;
  /**
   * Exact text in the heading on the page
   */
  heading: string;
  /**
   * Number of top-level <p> elements on the page
   */
  bodyBlocks: number;
  /**
   * The start of the text in the first <p> element
   */
  bodyStart: string;
  /**
   * The end of the text in the last <p> element
   */
  bodyEnd: string;
};

export const pages: Record<
  "home" | "static1" | "static2" | "live" | "list",
  PageMeta
> = {
  home: {
    url: new URL("/", siteUrl),
    layout: PageLayout.Home,
    heading: "Test site",
    bodyBlocks: 14,
    bodyStart: "Pellentesque finibus urna at ligula aliquet finibus.",
    bodyEnd: "Quisque facilisis lorem leo, at mattis metus vulputate quis.",
  },
  static1: {
    url: new URL("/static-1", siteUrl),
    layout: PageLayout.Subpage,
    heading: "Static page 1",
    bodyBlocks: 20,
    bodyStart: "Phasellus posuere justo eu orci viverra condimentum.",
    bodyEnd: "Donec sit amet mi ultricies sapien mollis dignissim.",
  },
  static2: {
    url: new URL("/static-2", siteUrl),
    layout: PageLayout.Subpage,
    heading: "Static page 2",
    bodyBlocks: 20,
    bodyStart: "Aenean rutrum metus ut diam sagittis, at varius ante luctus.",
    bodyEnd: "Vestibulum non velit in orci gravida lobortis non eget magna.",
  },
  live: {
    url: new URL("/live", siteUrl),
    layout: PageLayout.Subpage,
    heading: "Live data",
    bodyBlocks: 6,
    bodyStart: "Aenean pulvinar tortor eget hendrerit pellentesque.",
    bodyEnd: "Suspendisse potenti. Donec ac aliquet velit.",
  },
  list: {
    url: new URL("/list", siteUrl),
    layout: PageLayout.Subpage,
    heading: "Filterable list",
    bodyBlocks: 2,
    bodyStart: "Nam pulvinar nisi a turpis sodales, id cursus purus malesuada.",
    bodyEnd:
      "Aenean finibus, leo at accumsan sollicitudin, velit est facilisis quam, et sagittis ligula nisi at mi.",
  },
};
