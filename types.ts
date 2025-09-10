export type Status = "FINISHED" | "ONGOING" | "UPCOMING" | "UNKNOWN";

export interface Anime {
  /** IDENTITY */
  slug: string;
  malId?: string;

  /** TITLE */
  title: string;
  synonym?: string;
  synopsis?: string;

  /** URL */
  posterUrl: string;
  coverUrl?: string;
  trailerUrl?: string;

  /** DETAIL */
  author?: string;
  rating?: number;
  genres: Genre[];
  studio: string[];
  status: Status;
  type?: string;
  aired?: Date;
  duration?: string;
  season?: string;

  episodes: Episode[];
  batches: Batch[];
}

export interface Episode {
  name: string;
  slug: string;
}

export interface Genre {
  name: string;
  slug: string;
}

export interface Batch {
  name: string;
  resolution: string;
  url: string;
}

export interface Stream {
  name: string;
  url: string;
}
