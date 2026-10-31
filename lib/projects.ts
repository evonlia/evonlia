export type Project = {
  id: string;
  /** Set to false to hide a project from the site without deleting it. */
  enabled?: boolean;
  name: string;
  /** Short line under the name (optional). */
  type?: { en: string; ar: string };
  /** Picture of the project. Put it in /public/work/ and give the real pixel size. */
  image: { src: string; width: number; height: number; alt: { en: string; ar: string } };
  /** Link to the project (its site or its repo). Empty = the card is shown without a link. */
  href: string;
};

// To add a project: copy one block, change the name, the picture and the link.
export const PROJECTS: Project[] = [
  {
    id: "stylenest",
    name: "StyleNest",
    type: { en: "Online fashion store", ar: "متجر أزياء إلكتروني" },
    image: {
      src: "/work/stylenest/cover.webp",
      width: 1000,
      height: 400,
      alt: { en: "StyleNest storefront", ar: "متجر StyleNest" },
    },
    href: "", // paste the StyleNest link here
  },
];
