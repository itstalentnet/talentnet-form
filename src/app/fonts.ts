import localFont from "next/font/local";

export const iranSans = localFont({
  src: "./fonts/iransans/IRANSansXV.woff2",
  variable: "--font-iransans",
  display: "swap",
});

export const morabba = localFont({
  src: [
    {
      path: "./fonts/morabba/Morabba-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/morabba/Morabba-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/morabba/Morabba-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/morabba/Morabba-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-morabba",
  display: "swap",
});
