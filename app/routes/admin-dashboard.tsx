import type { Route } from "./+types/admin-dashboard";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { observeAdminAuth, signOutAdmin } from "~/lib/firebase.client";
import {
  createArtist,
  createSong,
  deleteArtist,
  deleteSong,
  subscribeArtists,
  subscribeSongs,
  type Artist,
  type Song,
} from "~/lib/sawatunes-data.client";
import type { FormEvent } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Admin Dashboard | SawaTunes" },
    {
      name: "description",
      content: "Admin tools to manage artist profiles and song metadata.",
    },
  ];
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [artistName, setArtistName] = useState("");
  const [artistGenre, setArtistGenre] = useState("");
  const [artistBio, setArtistBio] = useState("");
  const [songTitle, setSongTitle] = useState("");
  const [songYoutubeUrl, setSongYoutubeUrl] = useState("");
  const [songGenre, setSongGenre] = useState("");
  const [songArtistId, setSongArtistId] = useState("");
  const [isSavingArtist, setIsSavingArtist] = useState(false);
  const [isSavingSong, setIsSavingSong] = useState(false);

  useEffect(() => {
    let mounted = true;

    try {
      const unsubscribe = observeAdminAuth((user) => {
        if (!mounted) {
          return;
        }

        if (!user) {
          navigate("/admin/login", { replace: true });
          return;
        }

        setAdminEmail(user.email);
        setIsAuthenticated(true);
        setIsChecking(false);
      });

      return () => {
        mounted = false;
        unsubscribe();
      };
    } catch (error) {
      if (mounted) {
        setAuthError(
          error instanceof Error
            ? error.message
            : "Unable to verify admin authentication.",
        );
        setIsChecking(false);
      }

      return () => {
        mounted = false;
      };
    }
  }, [navigate]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const unSubArtists = subscribeArtists(
      (nextArtists) => {
        setArtists(nextArtists);
        setActionError(null);
      },
      (error) => setActionError(error.message),
    );

    const unSubSongs = subscribeSongs(
      (nextSongs) => {
        setSongs(nextSongs);
      },
      (error) => setActionError(error.message),
    );

    return () => {
      unSubArtists();
      unSubSongs();
    };
  }, [isAuthenticated]);

  async function handleCreateArtist(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!artistName.trim() || !artistGenre.trim()) {
      setActionError("Artist name and genre are required.");
      return;
    }

    setActionError(null);
    setActionSuccess(null);
    setIsSavingArtist(true);

    try {
      await createArtist({
        name: artistName,
        genre: artistGenre,
        bio: artistBio,
      });
      setArtistName("");
      setArtistGenre("");
      setArtistBio("");
      setActionSuccess("Artist profile created.");
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Unable to create artist.",
      );
    } finally {
      setIsSavingArtist(false);
    }
  }

  async function handleCreateSong(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!songTitle.trim() || !songYoutubeUrl.trim() || !songGenre.trim()) {
      setActionError("Song title, YouTube URL, and genre are required.");
      return;
    }

    if (!songArtistId) {
      setActionError("Select an artist profile before creating a song.");
      return;
    }

    setActionError(null);
    setActionSuccess(null);
    setIsSavingSong(true);

    try {
      await createSong({
        title: songTitle,
        youtubeUrl: songYoutubeUrl,
        genre: songGenre,
        artistId: songArtistId,
      });
      setSongTitle("");
      setSongYoutubeUrl("");
      setSongGenre("");
      setActionSuccess("Song added to the public library.");
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Unable to create song.",
      );
    } finally {
      setIsSavingSong(false);
    }
  }

  async function handleDeleteSong(songId: string) {
    const confirmed = window.confirm("Delete this song entry?");
    if (!confirmed) {
      return;
    }

    setActionError(null);
    setActionSuccess(null);

    try {
      await deleteSong(songId);
      setActionSuccess("Song deleted.");
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Unable to delete song.",
      );
    }
  }

  async function handleDeleteArtist(artistId: string) {
    const confirmed = window.confirm(
      "Delete this artist profile? This only works if the artist has no songs.",
    );
    if (!confirmed) {
      return;
    }

    setActionError(null);
    setActionSuccess(null);

    try {
      await deleteArtist(artistId);
      setActionSuccess("Artist profile deleted.");
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Unable to delete artist.",
      );
    }
  }

  async function handleSignOut() {
    await signOutAdmin();
    navigate("/admin/login", { replace: true });
  }

  if (isChecking) {
    return (
      <section className="page-stack">
        <article className="panel">
          <p className="status-line">Checking admin access...</p>
        </article>
      </section>
    );
  }

  if (authError) {
    return (
      <section className="page-stack">
        <article className="panel">
          <p className="status-error">{authError}</p>
        </article>
      </section>
    );
  }

  return (
    <section className="page-stack">
      <header className="section-head">
        <p className="eyebrow">Admin Workspace</p>
        <h1>Dashboard</h1>
        <p>
          You are signed in as an admin account.
          {adminEmail ? ` (${adminEmail})` : ""}
        </p>
      </header>

      {actionError ? <p className="status-error">{actionError}</p> : null}
      {actionSuccess ? <p className="status-success">{actionSuccess}</p> : null}

      <article className="panel">
        <h2>Create Artist Profile</h2>
        <form className="field-grid" onSubmit={handleCreateArtist}>
          <label className="field">
            <span>Artist Name</span>
            <input
              className="input"
              value={artistName}
              onChange={(event) => setArtistName(event.target.value)}
              required
            />
          </label>
          <label className="field">
            <span>Genre</span>
            <input
              className="input"
              value={artistGenre}
              onChange={(event) => setArtistGenre(event.target.value)}
              required
            />
          </label>
          <label className="field">
            <span>Artist Bio</span>
            <textarea
              className="input input-textarea"
              value={artistBio}
              onChange={(event) => setArtistBio(event.target.value)}
              rows={3}
            />
          </label>
          <button className="btn btn-primary" type="submit" disabled={isSavingArtist}>
            {isSavingArtist ? "Saving artist..." : "Create artist"}
          </button>
        </form>
      </article>

      <article className="panel">
        <h2>Add Song Metadata</h2>
        <form className="field-grid" onSubmit={handleCreateSong}>
          <label className="field">
            <span>Title</span>
            <input
              className="input"
              value={songTitle}
              onChange={(event) => setSongTitle(event.target.value)}
              required
            />
          </label>
          <label className="field">
            <span>YouTube URL</span>
            <input
              className="input"
              type="url"
              value={songYoutubeUrl}
              onChange={(event) => setSongYoutubeUrl(event.target.value)}
              required
            />
          </label>
          <label className="field">
            <span>Genre</span>
            <input
              className="input"
              value={songGenre}
              onChange={(event) => setSongGenre(event.target.value)}
              required
            />
          </label>
          <label className="field">
            <span>Artist Profile</span>
            <select
              className="input"
              value={songArtistId}
              onChange={(event) => setSongArtistId(event.target.value)}
              required
            >
              <option value="">Select artist</option>
              {artists.map((artist) => (
                <option key={artist.id} value={artist.id}>
                  {artist.name}
                </option>
              ))}
            </select>
          </label>
          <button className="btn btn-primary" type="submit" disabled={isSavingSong}>
            {isSavingSong ? "Saving song..." : "Add song"}
          </button>
        </form>
      </article>

      <article className="panel">
        <h2>Moderate Songs</h2>
        {songs.length === 0 ? (
          <p className="status-line">No songs available for moderation yet.</p>
        ) : (
          <ul className="stack-list">
            {songs.map((song) => (
              <li key={song.id} className="stack-item">
                <div>
                  <strong>{song.title}</strong>
                  <p className="micro-text">{song.genre}</p>
                </div>
                <button
                  className="btn btn-soft"
                  type="button"
                  onClick={() => handleDeleteSong(song.id)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </article>

      <article className="panel">
        <h2>Moderate Artists</h2>
        {artists.length === 0 ? (
          <p className="status-line">No artists available for moderation yet.</p>
        ) : (
          <ul className="stack-list">
            {artists.map((artist) => (
              <li key={artist.id} className="stack-item">
                <div>
                  <strong>{artist.name}</strong>
                  <p className="micro-text">{artist.genre}</p>
                </div>
                <button
                  className="btn btn-soft"
                  type="button"
                  onClick={() => handleDeleteArtist(artist.id)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}

        <button className="btn btn-soft" type="button" onClick={handleSignOut}>
          Sign out
        </button>
      </article>
    </section>
  );
}
