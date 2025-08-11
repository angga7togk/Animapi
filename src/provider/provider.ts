import { AnimeDetail, Genre, Params, Response, Stream } from "../types";

export abstract class TaberuProvider {
  constructor(protected providerUrl: string) {}

  abstract getAnimes(params: Params): Promise<Response>;
  abstract getAnime(slug: string): Promise<AnimeDetail | undefined>;
  abstract getStreams(episodeSlug: string): Promise<Array<Stream>>;
  abstract getGenres(): Promise<Array<Genre>>;
}
