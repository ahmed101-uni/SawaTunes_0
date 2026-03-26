import type { Route } from "./+types/songs";
import { useEffect, useMemo, useState } from "react";
import {
  incrementSongLike,
  incrementSongView,
  subscribeArtists,
  subscribeSongs,
  type Artist,
  type Song,
} from "~/lib/sawatunes-data.client";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Songs | SawaTunes" },
    {
      name: "description",
      content: "Browse Sudanese songs curated by artists and genre.",
    },
  ];
}

export default function SongsPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [likedSongIds, setLikedSongIds] = useState<Record<string, true>>({});
  const [viewedSongIds, setViewedSongIds] = useState<Record<string, true>>({});

  useEffect(() => {
    const likedRaw = window.localStorage.getItem("sawatunes-liked-songs");
    if (!likedRaw) {
      return;
    }

    try {
      const parsed = JSON.parse(likedRaw) as string[];
      const next = parsed.reduce<Record<string, true>>((acc, id) => {
        acc[id] = true;
        return acc;
      }, {});
      setLikedSongIds(next);
    } catch {
      setLikedSongIds({});
    }
  }, []);

  useEffect(() => {
    const viewedRaw = window.localStorage.getItem("sawatunes-viewed-songs");
    if (!viewedRaw) {
      return;
    }

    try {
      const parsed = JSON.parse(viewedRaw) as string[];
      const next = parsed.reduce<Record<string, true>>((acc, id) => {
        acc[id] = true;
        return acc;
      }, {});
      setViewedSongIds(next);
    } catch {
      setViewedSongIds({});
    }
  }, []);

  useEffect(() => {
    const unSubSongs = subscribeSongs(
      (nextSongs) => {
        setSongs(nextSongs);
        setErrorMessage(null);
      },
      (error) => setErrorMessage(error.message),
    );

    const unSubArtists = subscribeArtists(
      (nextArtists) => {
        setArtists(nextArtists);
      },
      (error) => setErrorMessage(error.message),
    );

    return () => {
      unSubSongs();
      unSubArtists();
    };
  }, []);

  const artistLookup = useMemo(() => {
    return artists.reduce<Record<string, string>>((acc, artist) => {
      acc[artist.id] = artist.name;
      return acc;
    }, {});
  }, [artists]);

  async function handleOpenSong(song: Song) {
    if (!viewedSongIds[song.id]) {
      try {
        await incrementSongView(song.id);
        const next: Record<string, true> = {
          ...viewedSongIds,
          [song.id]: true,
        };
        setViewedSongIds(next);
        window.localStorage.setItem(
          "sawatunes-viewed-songs",
          JSON.stringify(Object.keys(next)),
        );
      } catch {
        // Keep navigation working even if engagement update fails.
      }
    }

    window.open(song.youtubeUrl, "_blank", "noopener,noreferrer");
  }

  async function handleLike(song: Song) {
    if (likedSongIds[song.id]) {
      return;
    }

    try {
      await incrementSongLike(song.id);
      const next: Record<string, true> = { ...likedSongIds, [song.id]: true };
      setLikedSongIds(next);
      window.localStorage.setItem(
        "sawatunes-liked-songs",
        JSON.stringify(Object.keys(next)),
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to like this song.",
      );
    }
  }

  return (
    <section className="page-stack">
      <header className="section-head">
        <p className="eyebrow">Public Music Library</p>
        <h1>Browse Songs</h1>
        <p>
          Discover songs shared by Sudanese artists. Playback opens externally on
          YouTube.
        </p>
      </header>

      {errorMessage ? <p className="status-error">{errorMessage}</p> : null}

      {songs.length === 0 ? (
        <article className="panel">
          <p className="status-line">No songs yet. Check back soon.</p>
        </article>
      ) : null}

      <div className="song-grid">
        {songs.map((song) => (
          <article key={song.id} className="song-card">
            <div className="card-head">
              <h2>{song.title}</h2>
              <span className="tag-pill">{song.genre}</span>
            </div>
            <p className="subtle-line">
              {artistLookup[song.artistId] ?? "Unknown artist"}
            </p>
            <p className="metric-line">
              {song.views} views · {song.likes} likes
            </p>
            <div className="button-row">
              <button
                className="btn btn-primary"
                type="button"
                onClick={() => handleOpenSong(song)}
              >
                Open on YouTube
              </button>
              <button
                className="btn btn-soft"
                type="button"
                onClick={() => handleLike(song)}
                disabled={Boolean(likedSongIds[song.id])}
              >
                {likedSongIds[song.id] ? "Liked" : "Like"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
