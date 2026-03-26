import type { Route } from "./+types/home";
import { Link } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "SawaTunes | Sudanese Music & Culture" },
    {
      name: "description",
      content:
        "Discover Sudanese artists, browse songs, and explore cultural and charity awareness in one place.",
    },
  ];
}

export default function Home() {
  return (
    <section className="page-stack">
      <section className="hero-panel">
        <div className="hero-content">
          <p className="eyebrow">Sudanese Music and Cultural Engagement</p>
          <h1>Hear the culture. Share the story.</h1>
          <p>
            SawaTunes helps people discover Sudanese artists through curated
            songs with links to YouTube and cultural context.
          </p>
          <div className="button-row">
            <Link className="btn btn-primary" to="/songs">
              Browse Songs
            </Link>
            <Link className="btn btn-soft" to="/artists">
              Explore Artists
            </Link>
          </div>
        </div>

        <div className="kpi-strip" aria-label="Platform highlights">
          <article className="kpi-card">
            <h2>Public Discovery</h2>
            <p>Browse songs and artists without sign-in.</p>
          </article>
          <article className="kpi-card">
            <h2>Admin Curation</h2>
            <p>Admins keep artist profiles and songs up to date.</p>
          </article>
          <article className="kpi-card">
            <h2>Awareness Context</h2>
            <p>Music exploration linked to social awareness resources.</p>
          </article>
        </div>
      </section>

      <section className="info-grid" aria-label="SawaTunes quick overview">
        <article className="info-card">
          <h2>Public Access</h2>
          <p>
            Visitors can browse songs, artists, and awareness content without
            creating an account.
          </p>
        </article>
        <article className="info-card">
          <h2>Admin Curation</h2>
          <p>
            Admins manage artist profiles and song details.
          </p>
        </article>
        <article className="info-card">
          <h2>YouTube-Based Playback</h2>
          <p>
            Playback opens on YouTube. SawaTunes is for discovery and
            exploration.
          </p>
        </article>
      </section>
    </section>
  );
}
