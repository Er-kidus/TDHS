import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tenadam Organization Portal",
  description: "Organization portal for Tenadam Digital Healthcare System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <Script id="strip-fdprocessedid" strategy="beforeInteractive">
          {`
            (function () {
              var ATTR = 'fdprocessedid';

              function stripAttr(root) {
                if (!root || !root.querySelectorAll) return;

                var nodes = root.querySelectorAll('[' + ATTR + ']');

                for (var i = 0; i < nodes.length; i += 1) {
                  nodes[i].removeAttribute(ATTR);
                }
              }

              stripAttr(document);

              var observer = new MutationObserver(function (records) {
                for (var i = 0; i < records.length; i += 1) {
                  var target = records[i].target;

                  if (
                    target &&
                    target.nodeType === 1 &&
                    target.hasAttribute &&
                    target.hasAttribute(ATTR)
                  ) {
                    target.removeAttribute(ATTR);
                  }

                  for (
                    var j = 0;
                    j < records[i].addedNodes.length;
                    j += 1
                  ) {
                    var node = records[i].addedNodes[j];

                    if (node && node.nodeType === 1) {
                      if (
                        node.hasAttribute &&
                        node.hasAttribute(ATTR)
                      ) {
                        node.removeAttribute(ATTR);
                      }

                      stripAttr(node);
                    }
                  }
                }
              });

              observer.observe(document.documentElement, {
                attributes: true,
                childList: true,
                subtree: true,
              });

              setTimeout(function () {
                observer.disconnect();
              }, 15000);
            })();
          `}
        </Script>
      </head>

      <body
        className="min-h-full flex flex-col"
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}