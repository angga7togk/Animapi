export interface AnimeSimple {
  title: string;
  slug: string;
  posterUrl: string;
  type: string;
  episode: string;
  status: "COMPLETE" | "ONGOING" | "UPCOMING";
}

export interface Response {
  hasNext: boolean;
  animes: Array<AnimeSimple>;
}

export interface AnimeDetail {
  slug: string;
  title: string;
  synonym: string;
  synopsis: string;
  posterUrl: string;
  rating: number;
  author: string;
  genres: Genre[];
  status: string;
  characterTypes: Character[];
  aired: string;
  type: string;
  episode: string;
  duration: string;
  studio: string;
  season: string;
  trailer: string;
  updateAt: string;
  episodes: Episode[];
  batches: Batch[];
}

export interface Params {
  q?: string;
  page?: number;
  genres?: string[];
  type?: string;
  seasons?: string[];
  status?: string;
  sort?: string;
  alphabet?: string;
  day?:
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday"
    | "random";
}

export interface Character {
  name: string;
  slug: string;
}

export interface Episode {
  episode: string;
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
