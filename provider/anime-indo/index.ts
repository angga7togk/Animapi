import { Provider } from "..";
import { hasNextPageAndGet } from "../../utils";
import {
  SearchOptions,
  SearchResult,
  Anime,
  Genre,
  Stream,
  ProviderOptions,
  Episode,
} from "../index.types";

export class AnimeIndo extends Provider {
  constructor(options?: ProviderOptions) {
    super("anime-indo", {
      baseUrl: "https://anime-indo.lol",
      cache: true,
      ...options,
    });
  }

  async search(options?: SearchOptions): Promise<SearchResult> {
    const { keyword, type, genres, alphabet, page = 1 } = options?.filter || {};
    const slugs: string[] = [];

    const genre = genres?.[0];

    const res = await this.api.get(
      alphabet
        ? `${this.baseUrl}/anime-list/`
        : genre
        ? `${this.baseUrl}/genres/${genre}/`
        : type == "Movie"
        ? `${this.baseUrl}/movie/page/${page}/`
        : keyword
        ? `${this.baseUrl}/search/${keyword}/`
        : this.baseUrl
    );
    const $ = this.cheerio.load(res.data);
    let hasNext =
      $("a").filter((_, el) => {
        return $(el).text().replace(/\s+/g, "").trim() === "»";
      }).length >= 1;

    if (alphabet) {
      const preSlugs: string[] = [];
      $("#content-wrap .menu .anime-list a").each((_, el) => {
        const $a = $(el);

        if ($a.text().toLowerCase().startsWith(alphabet.toLowerCase())) {
          const slug = $(el)
            .attr("href")
            ?.trim()
            .split("/anime/")[1]
            .replace("/", "")
            .trim();
          if (slug) {
            preSlugs.push(slug);
          }
        }
      });
      const r = hasNextPageAndGet(preSlugs, page, 10);
      hasNext = r.hasNext;
      slugs.push(...r.data);
    } else {
      const els =
        keyword || type || genre
          ? $("#content-wrap .menu table tr a")
          : $("#content-wrap .ngiri .menu a");

      els.each((_, el) => {
        const slug =
          keyword || type || genre
            ? $(el)
                .attr("href")
                ?.trim()
                .split("/anime/")[1]
                .replace("/", "")
                .trim()
            : $(el)
                .attr("href")
                ?.trim()
                .split("-episode-")[0]
                .replace("/", "")
                .trim();
        if (slug) {
          slugs.push(slug);
        }
      });
    }

    const animes = (
      await Promise.all(
        slugs.map((slug) => this.limit(async () => await this.detail(slug)))
      )
    ).filter((anime): anime is Anime => anime !== undefined);

    return { animes, hasNext };
  }
  async detail(slug: string): Promise<Anime | undefined> {
    const a = this.cache.get(`detail-${this.name}-${slug}`);
    if (a && this.options.cache) {
      return a;
    }

    const res = await this.api.get(`${this.baseUrl}/anime/${slug}/`);
    const $ = this.cheerio.load(res.data);

    const title = $("#content-wrap .ngirix .title").first().text().trim();
    let img = $("#content-wrap .ngirix .menu .detail img").attr("src")?.trim();
    if (!img?.includes("http")) {
      img = `${this.baseUrl}/${img}`;
    }
    const synopsis = $("#content-wrap .ngirix .menu .detail p").text().trim();

    const genres: Genre[] = [];
    $("#content-wrap .ngirix .menu .detail li a").each((_, el) => {
      const $a = $(el);
      const slug = $a
        .attr("href")
        ?.trim()
        .split("/genres/")[1]
        .replace("/", "");
      const name = $a.text().trim();
      genres.push({
        slug: slug || "",
        name,
        source: this.name,
      });
    });

    const episodes: Episode[] = [];
    $("#content-wrap .ngirix .menu .ep a").each((_, el) => {
      const $a = $(el);
      episodes.push({
        name: $a.text(),
        slug: $a.attr("href")?.replace("/", "").replace("/", "") || "",
        source: this.name,
      });
    });

    const data: Anime = {
      slug,
      title,
      synopsis,
      posterUrl: img,
      status: "UNKNOWN",
      genres,
      episodes,
      studios: [],
      batches: [],
      producers: [],
      characterTypes: [],
      source: this.name,
    };
    if (this.options.cache) this.cache.set(`detail-${this.name}-${slug}`, data);
    return data;
  }
  async genres(): Promise<Genre[]> {
    const a = this.cache.get(`genres-${this.name}`);
    if (a && this.options.cache) {
      return a;
    }
    const res = await this.api.get(`${this.baseUrl}/list-genre/`);
    const $ = this.cheerio.load(res.data);

    const genres: Genre[] = [];
    $(".list-genre a").each((_, el) => {
      const $a = $(el);
      const slug = $a
        .attr("href")
        ?.split("/genres/")[1]
        .replace("/", "")
        .trim();
      genres.push({
        name: $a.text().trim(),
        slug: slug || "",
        source: this.name,
      });
    });
    if (this.options.cache) this.cache.set(`genres-${this.name}`, genres);
    return genres;
  }
  async streams(slug: string): Promise<Stream[]> {
    const a = this.cache.get(`streams-${this.name}-${slug}`);
    if (a && this.options.cache) return a;

    const res = await this.api.get(`${this.baseUrl}/${slug}/`);
    const $ = this.cheerio.load(res.data);

    const streams: Stream[] = [];
    $("#content-wrap .menu .servers a").each((_, el) => {
      const $a = $(el);
      let embedUrl = $a.attr("data-video")?.trim();
      if (!embedUrl?.includes("http")) {
        embedUrl = `${this.baseUrl}${embedUrl}`;
      }
      streams.push({
        name: $a.text(),
        url: embedUrl,
        source: this.name,
      });
    });
    if (this.options.cache) {
      this.cache.set(`streams-${this.name}-${slug}`, streams);
    }
    return streams;
  }
}
