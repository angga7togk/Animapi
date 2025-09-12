import { AnimeType } from "../types";
import { DAY_ID, dayMap } from "../utils/day-converter";

export type Status = "FINISHED" | "ONGOING" | "UPCOMING" | "UNKNOWN";

export interface Anime {
  /** IDENTITY */
  slug: string;
  malId?: string;

  /** TITLE */
  title: string;
  titleAlt?: string;
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
  studios: string[];
  status: Status;
  producers: string[]
  type?: string;
  aired?: Date;
  duration?: string;
  season?: string;

  /** ANIMASU */
  characterTypes: CharacterType[];

  episodes: Episode[];
  batches: Batch[];
  source: string;
}

export interface Episode {
  name: string;
  slug: string;
  source: string;
}

export interface Genre {
  name: string;
  slug: string;
  source: string;
}

export interface Batch {
  name: string;
  resolution: string;
  file_size?: string;
  url: string;
  source: string;
}

export interface Stream {
  name: string;
  url: string;
  source: string;
}

export interface CharacterType {
  name: string;
  slug: string;
  source: string;
}

export interface ProviderOptions {
  baseUrl?: string;
  cache?: boolean;
}

export interface SearchResult {
  hasNext: boolean;
  animes: Anime[];
}

export interface SearchFilter {
  keyword?: string;
  page?: number;
  sort?: string;
  genres?: string[];
  characters?: string[];
  seasons?: string[];
  status?: Status;
  type?: AnimeType;
  day?: DAY_ID;
  alphabet?: string
}

export interface SearchOptions {
  filter?: SearchFilter;
}
