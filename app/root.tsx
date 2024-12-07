import type { LinksFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import "@shopify/polaris/build/esm/styles.css";
import { AppProvider } from "@shopify/polaris";

export const links: LinksFunction = () => [
  {
    rel: "stylesheet",
    href: "@shopify/polaris/build/esm/styles.css",
  },
];

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <AppProvider i18n={{}}>
          <Outlet />
        </AppProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
