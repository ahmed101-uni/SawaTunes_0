import type { Route } from "./+types/artists";
import { useEffect, useState } from "react";
import { subscribeArtists, type Artist } from "~/lib/sawatunes-data.client";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Artists | SawaTunes" },
    {
      name: "description",
      content: "Discover Sudanese artist profiles and their music catalog.",
    },
  ];
}

export default function ArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    return subscribeArtists(
      (nextArtists) => {
        setArtists(nextArtists);
        setErrorMessage(null);
      },
      (error) => setErrorMessage(error.message),
    );
  }, []);

  return (
    <section className="page-stack">
      <header className="section-head">
        <p className="eyebrow">Public Artist Directory</p>
        <h1>Artists</h1>
        <p>
          Discover Sudanese artists and learn a bit about their sound and story.
        </p>
      </header>

      {errorMessage ? <p className="status-error">{errorMessage}</p> : null}

      {artists.length === 0 ? (
        <article className="panel">
          <p className="status-line">No artist profiles yet. Check back soon.</p>
        </article>
      ) : null}

      <div className="info-grid">
        {artists.map((artist) => (
          <article key={artist.id} className="info-card artist-card">
            <h2>{artist.name}</h2>
            <p className="genre-line">{artist.genre}</p>
            {artist.bio ? <p className="subtle-line">{artist.bio}</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
}
