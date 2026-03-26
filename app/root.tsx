import {
  NavLink,
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { useEffect, useState } from "react";

import type { Route } from "./+types/root";
import { observeAdminAuth } from "~/lib/firebase.client";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;700;800&family=Tajawal:wght@400;500;700&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;

    try {
      const unsubscribe = observeAdminAuth((user) => {
        if (!mounted) {
          return;
        }

        setIsAdminAuthenticated(Boolean(user));
      });

      return () => {
        mounted = false;
        unsubscribe();
      };
    } catch {
      return () => {
        mounted = false;
      };
    }
  }, []);

  const adminNavItem = isAdminAuthenticated
    ? { to: "/admin", label: "Admin Dashboard" }
    : { to: "/admin/login", label: "Admin Login" };

  const navItems = [...baseNavItems, adminNavItem];

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="container shell-row">
          <NavLink to="/" className="brand-block" aria-label="SawaTunes home">
            <span className="brand-mark">SawaTunes</span>
            <span className="brand-sub">Sudanese music and culture</span>
          </NavLink>
          <nav className="site-nav" aria-label="Primary navigation">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  isActive ? "nav-link nav-link-active" : "nav-link"
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="container main-content">
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="container">
          <p>
            SawaTunes is a cultural discovery platform for Sudanese artists and
            communities.
          </p>
        </div>
      </footer>
    </div>
  );
}

const baseNavItems = [
  { to: "/", label: "Home" },
  { to: "/songs", label: "Songs" },
  { to: "/artists", label: "Artists" },
  { to: "/charity", label: "Charity Awareness" },
];

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="error-panel">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre>
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
