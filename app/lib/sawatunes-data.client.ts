import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { getFirestoreDb } from "~/lib/firebase.client";

export type Artist = {
  id: string;
  name: string;
  genre: string;
  bio: string;
  createdAt: string;
};

export type Song = {
  id: string;
  title: string;
  youtubeUrl: string;
  genre: string;
  artistId: string;
  likes: number;
  views: number;
  createdAt: string;
};

export type ArtistInput = {
  name: string;
  genre: string;
  bio: string;
};

export type SongInput = {
  title: string;
  youtubeUrl: string;
  genre: string;
  artistId: string;
};

function getTimestampValue(value: unknown): string {
  if (typeof value === "object" && value !== null && "toDate" in value) {
    const ts = value as { toDate: () => Date };
    return ts.toDate().toISOString();
  }

  return new Date(0).toISOString();
}

function mapArtist(docSnap: QueryDocumentSnapshot<DocumentData>): Artist {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    name: String(data.name ?? "Unknown artist"),
    genre: String(data.genre ?? "Uncategorized"),
    bio: String(data.bio ?? ""),
    createdAt: getTimestampValue(data.createdAt),
  };
}

function mapSong(docSnap: QueryDocumentSnapshot<DocumentData>): Song {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    title: String(data.title ?? "Untitled"),
    youtubeUrl: String(data.youtubeUrl ?? ""),
    genre: String(data.genre ?? "Uncategorized"),
    artistId: String(data.artistId ?? ""),
    likes: Number(data.likes ?? 0),
    views: Number(data.views ?? 0),
    createdAt: getTimestampValue(data.createdAt),
  };
}

function getArtistsCollection() {
  return collection(getFirestoreDb(), "artists");
}

function getSongsCollection() {
  return collection(getFirestoreDb(), "songs");
}

export function subscribeArtists(
  onData: (artists: Artist[]) => void,
  onError: (error: Error) => void,
) {
  const artistsQuery = query(getArtistsCollection(), orderBy("createdAt", "desc"));
  return onSnapshot(
    artistsQuery,
    (snapshot) => {
      onData(snapshot.docs.map(mapArtist));
    },
    (error) => onError(error),
  );
}

export function subscribeSongs(
  onData: (songs: Song[]) => void,
  onError: (error: Error) => void,
) {
  const songsQuery = query(getSongsCollection(), orderBy("createdAt", "desc"));
  return onSnapshot(
    songsQuery,
    (snapshot) => {
      onData(snapshot.docs.map(mapSong));
    },
    (error) => onError(error),
  );
}

export async function createArtist(input: ArtistInput) {
  await addDoc(getArtistsCollection(), {
    name: input.name.trim(),
    genre: input.genre.trim(),
    bio: input.bio.trim(),
    createdAt: serverTimestamp(),
  });
}

function isValidYoutubeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    return host.includes("youtube.com") || host.includes("youtu.be");
  } catch {
    return false;
  }
}

export async function createSong(input: SongInput) {
  if (!isValidYoutubeUrl(input.youtubeUrl)) {
    throw new Error("Please provide a valid YouTube URL.");
  }

  await addDoc(getSongsCollection(), {
    title: input.title.trim(),
    youtubeUrl: input.youtubeUrl.trim(),
    genre: input.genre.trim(),
    artistId: input.artistId,
    views: 0,
    likes: 0,
    createdAt: serverTimestamp(),
  });
}

export async function deleteSong(songId: string) {
  const songDoc = doc(getFirestoreDb(), "songs", songId);
  await deleteDoc(songDoc);
}

export async function deleteArtist(artistId: string) {
  const songsByArtist = query(
    getSongsCollection(),
    where("artistId", "==", artistId),
    limit(1),
  );
  const dependentSongs = await getDocs(songsByArtist);

  if (!dependentSongs.empty) {
    throw new Error("Delete the artist songs first before removing the profile.");
  }

  const artistDoc = doc(getFirestoreDb(), "artists", artistId);
  await deleteDoc(artistDoc);
}

export async function incrementSongView(songId: string) {
  const songDoc = doc(getFirestoreDb(), "songs", songId);
  await updateDoc(songDoc, { views: increment(1) });
}

export async function incrementSongLike(songId: string) {
  const songDoc = doc(getFirestoreDb(), "songs", songId);
  await updateDoc(songDoc, { likes: increment(1) });
}
