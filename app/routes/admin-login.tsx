import type { Route } from "./+types/admin-login";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router";
import { observeAdminAuth, signInAdmin } from "~/lib/firebase.client";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Admin Login | SawaTunes" },
    {
      name: "description",
      content: "Admin sign-in for managing SawaTunes content.",
    },
  ];
}

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    try {
      const unsubscribe = observeAdminAuth((user) => {
        if (!mounted) {
          return;
        }

        if (user) {
          navigate("/admin", { replace: true });
          return;
        }

        setIsReady(true);
      });

      return () => {
        mounted = false;
        unsubscribe();
      };
    } catch (error) {
      if (mounted) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load sign-in.",
        );
        setIsReady(true);
      }

      return () => {
        mounted = false;
      };
    }
  }, [navigate]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await signInAdmin(email, password);
      navigate("/admin", { replace: true });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Login failed. Check your admin credentials.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="page-stack">
      <header className="section-head">
        <p className="eyebrow">Restricted Access</p>
        <h1>Admin Login</h1>
        <p>
          This area is for site administrators. Everyone else can browse the
          library without an account.
        </p>
      </header>

      <article className="panel">
        <p className="panel-note">
          Sign in with your admin email and password.
        </p>

        {!isReady ? (
          <p className="status-line">Checking authentication status...</p>
        ) : (
          <form className="field-grid" onSubmit={handleSubmit}>
            <label className="field">
              <span>Email</span>
              <input
                className="input"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>

            <label className="field">
              <span>Password</span>
              <input
                className="input"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>

            {errorMessage ? <p className="status-error">{errorMessage}</p> : null}

            <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign in as admin"}
            </button>
          </form>
        )}
      </article>
    </section>
  );
}
