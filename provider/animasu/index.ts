import { parseDate } from "../../utils/date-converter";
import { DAY_ID } from "../../utils/day-converter";
import { Provider } from "..";
import {
  Anime,
  Batch,
  CharacterType,
  Episode,
  Genre,
  ProviderOptions,
  SearchOptions,
  SearchResult,
  Status,
  Stream,
} from "../index.types";

export class Animasu extends Provider {
  constructor(options?: ProviderOptions) {
    super("animasu", {
      baseUrl: "https://v1.animasu.top",
      cache: true,
      ...options,
    });
  }

  async search(options?: SearchOptions): Promise<SearchResult> {
    const {
      keyword,
      page = 1,
      sort,
      genres,
      seasons,
      characters,
      status,
      type,
      day,
      alphabet,
    } = options?.filter || {};
    let data;
    if (alphabet) {
      const { slugs, hasNext } = await this.findByAlphabet(alphabet);
      const animes = (
        await Promise.all(
          slugs.map((slug) => this.limit(async () => await this.detail(slug)))
        )
      ).filter((anime): anime is Anime => anime !== undefined);

      data = {
        hasNext,
        animes,
      };
    } else if (day) {
      const slugs = await this.findByDay(day);
      const animes = (
        await Promise.all(
          slugs.map((slug) => this.limit(async () => await this.detail(slug)))
        )
      ).filter((anime): anime is Anime => anime !== undefined);
      data = {
        hasNext: false,
        animes,
      };
    } else {
      const res = await this.api.get(
        keyword
          ? `${this.baseUrl}/page/${page}/`
          : `${this.baseUrl}/pencarian/`,
        {
          params: {
            s: keyword,
            halaman: page,
            urutan: sort,
            "genre[]": genres,
            "season[]": seasons,
            "karakter[]": characters,
            status: status,
            tipe: type,
          },
        }
      );
      const $ = this.cheerio.load(res.data);

      const elements = $(".bs").toArray();

      const animes = (
        await Promise.all(
          elements.map((el) =>
            this.limit(async () => {
              const link = $(el).find("a").attr("href");
              const slug = link?.split("/")[4].trim() || "";
              return await this.detail(slug);
            })
          )
        )
      ).filter((anime): anime is Anime => anime !== undefined);

      const hasNext =
        $(".hpage .r").length > 0 || $(".pagination .next").length > 0;

      data = {
        animes: animes,
        hasNext,
      };
    }
    return data;
  }
  async detail(slug: string): Promise<Anime | undefined> {
    const a = this.cache.get(`detail-${this.name}-${slug}`);
    if (a) {
      return a;
    }

    const res = await this.api.get(`${this.baseUrl}/anime/${slug}/`);

    const $ = this.cheerio.load(res.data);

    const infox = $(".infox");
    const title = infox.find("h1[itemprop='headline']").text().trim();
    const synonym = infox.find(".alter").text().trim();
    const synopsis = $(".sinopsis p").text().trim();
    let image = $(".bigcontent .thumb img").attr("src") || "";
    if (!image.includes("http")) {
      image = `https:${image}`;
    }
    const rating = $(".rating strong").text().trim() || "N/A";

    const trailer = $(".trailer iframe").attr("src")?.trim() || "";

    const genres: Genre[] = [];
    infox
      .find(".spe span")
      .first()
      .find("a")
      .each((_, el) => {
        const genreUrl = $(el).attr("href");
        const genreName = $(el).text().trim();
        const genreSlug = genreUrl?.split("/")[4] || "";
        genres.push({
          name: genreName,
          slug: genreSlug,
          source: this.name,
        });
      });

    let status: Status = "UPCOMING";
    infox.find(".spe span").each((_, el) => {
      const text = $(el).text().trim();
      if (text.toLowerCase().startsWith("status:")) {
        const value = text.split(":")[1]?.trim();
        status = value.includes("🔥")
          ? "ONGOING"
          : value.toLowerCase().includes("selesai")
          ? "FINISHED"
          : "UPCOMING";
      }
    });

    const aired = infox
      .find(".spe span.split")
      .filter((_, el) => $(el).text().toLowerCase().startsWith("rilis:"))
      .text()
      .split(":")[1]
      ?.trim();

    const type = infox
      .find(".spe span")
      .filter((_, el) => $(el).text().toLowerCase().startsWith("jenis:"))
      .text()
      .split(":")[1]
      ?.trim();

    const duration = infox
      .find(".spe span")
      .filter((_, el) => $(el).text().toLowerCase().startsWith("durasi:"))
      .text()
      .split(":")[1]
      ?.trim();

    const author = infox
      .find(".spe span")
      .filter((_, el) => $(el).text().toLowerCase().startsWith("pengarang:"))
      .find("a")
      .text()
      .trim();

    const studio = infox
      .find(".spe span")
      .filter((_, el) => $(el).text().toLowerCase().startsWith("studio:"))
      .find("a")
      .text()
      .trim();

    const season = infox
      .find(".spe span")
      .filter((_, el) => $(el).text().toLowerCase().startsWith("musim:"))
      .find("a")
      .text()
      .trim();

    const episodes: Episode[] = [];
    $("#daftarepisode li").each((index, el) => {
      const a = $(el).find(".lchx a");
      const episode = a.text().trim();
      const url = a.attr("href") || "";
      const slug = url.split("/")[3] || "";
      episodes.push({
        name: episode,
        slug,
        source: this.name,
      });
    });

    const batches: Batch[] = [];
    $(".soraddlx .soraurlx").each((index, el) => {
      const resolution = $(el).find("strong").text().trim();
      $(el)
        .find("a")
        .each((_index, _el) => {
          const url = $(_el).attr("href") || "";
          const name = $(_el).text().trim();
          batches.push({
            name,
            resolution,
            url,
            source: this.name,
          });
        });
    });

    const characterTypes: CharacterType[] = [];
    try {
      $("#tikar_shw a").each((index, el) => {
        const href = $(el).attr("href") || "";
        const name = $(el).text().trim();
        const slug = href.split("/")[4] || "";
        characterTypes.push({
          name,
          slug,
          source: this.name,
        });
      });
    } catch (er) {}

    const data: Anime = {
      slug,
      title,
      synonym,
      synopsis,
      posterUrl: image,
      rating: Number(rating.split(" ")[1]) || 0,
      author,
      genres,
      characterTypes,
      status: status,
      aired: parseDate(aired),
      type: type || "Unknown",
      duration,
      studios: studio ? [studio] : [],
      season: season || "Unknown",
      trailerUrl: trailer,
      producers: [],
      episodes,
      batches,
      source: this.name,
    };
    this.cache.set(`detail-${this.name}-${slug}`, data);
    return data;
  }
  async genres(): Promise<Genre[]> {
    const res = await this.api.get(
      `${this.baseUrl}/kumpulan-genre-anime-lengkap/`
    );
    const $ = this.cheerio.load(res.data);
    const genres: Genre[] = [];
    $(".genrepage a").each((index, el) => {
      const name = $(el).text().trim();
      const url = $(el).attr("href") || "";
      const slug = url.split("/")[4] || "";
      genres.push({
        name,
        slug,
        source: this.name,
      });
    });
    return genres;
  }
  async streams(slug: string): Promise<Stream[]> {
    const streams: Stream[] = [];
    const res = await this.api.get(`${this.baseUrl}/${slug}/`);
    const $ = this.cheerio.load(res.data);

    $(".mirror option").each((_, el) => {
      const value = $(el).attr("value")?.trim();
      if (value) {
        const name = $(el).text().trim();
        const $$ = this.cheerio.load(`<div>${atob(value)}</div>`);
        streams.push({
          name,
          url: $$("iframe").attr("src")?.trim() || "",
          source: this.name,
        });
      }
    });
    return streams;
  }

  private async findByDay(_day?: DAY_ID): Promise<Array<string>> {
    const day = _day || "random";
    const res = await this.api.get(`${this.baseUrl}/jadwal/`);
    const $ = this.cheerio.load(res.data);

    const slugs: string[] = [];
    $(".bixbox").each((_, el) => {
      const $$ = $(el);
      const $day = ($$.find(".releases h3 span").text().trim() || "")
        .toLowerCase()
        .replace("update acak", "random")
        .replace("'", "");
      if ($day == day) {
        $(el)
          .find(".bs")
          .each((_, _el) => {
            const $$$ = $(_el);
            const link = $$$.find("a").attr("href");
            const slug = link?.split("/")[4].trim() || "";
            slugs.push(slug);
          });
      }
    });
    return slugs;
  }

  private async findByAlphabet(
    alphabet: string,
    page = 1
  ): Promise<{
    slugs: Array<string>;
    hasNext: boolean;
  }> {
    const res = await this.api.get(
      `${this.baseUrl}/daftar-anime/page/${page}/`,
      {
        params: {
          show: alphabet.toUpperCase(),
        },
      }
    );

    const $ = this.cheerio.load(res.data);

    const hasNext =
      $(".hpage .r").length > 0 || $(".pagination .next").length > 0;

    const slugs: string[] = [];
    $(".bx").each((index, el) => {
      const $$ = $(el);
      let slug = $$.find(".inx h2 a").attr("href") || "";
      slug = slug.substring(0, slug.lastIndexOf("/")).split("/").pop() || "";

      slugs.push(slug);
    });
    return {
      slugs,
      hasNext,
    };
  }
}
