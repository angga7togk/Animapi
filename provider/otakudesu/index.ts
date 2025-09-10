import { parseDate } from "../../utils/date-converter";
import { DAY_ID } from "../../utils/day-converter";
import { Provider } from "..";
import {
  SearchOptions,
  SearchResult,
  Anime,
  Genre,
  Stream,
  ProviderOptions,
  Status,
  Episode,
  Batch,
} from "../index.types";
import { getEmbedUrl, getNonceCode } from "./helper";

export class Otakudesu extends Provider {
  constructor(options?: ProviderOptions) {
    super("otakudesu", {
      baseUrl: "https://otakudesu.best",
      cache: true,
      ...options,
    });
  }

  async search(options?: SearchOptions): Promise<SearchResult> {
    const { keyword, alphabet, day, status, genres, page } =
      options?.filter || {};

    let hasNext = false;
    let slugs: string[] = [];
    if (genres) {
      const r = await this.searchByGenre(genres[0], page);
      hasNext = r.hasNext;
      slugs = r.slugs;
    } else if (day) {
      slugs = await this.searchByDay(day);
    } else if (alphabet) {
      slugs = await this.searchByAlphabet(alphabet);
    } else if (keyword) {
      const res = await this.api.get(`${this.baseUrl}`, {
        params: {
          s: keyword,
          post_type: "anime",
        },
      });
      const $ = this.cheerio.load(res.data);
      $("#venkonten .venutama ul li h2 a").each((_, el) => {
        slugs.push(
          $(el).attr("href")?.split("/anime/")[1].replace("/", "").trim() || ""
        );
      });
    } else {
      const r = await this.searchByStatus(status, page);
      hasNext = r.hasNext;
      slugs = r.slugs;
    }
    return {
      hasNext,
      animes: (
        await Promise.all(
          slugs.map((slug) =>
            this.limit(async () => {
              return await this.detail(slug);
            })
          )
        )
      ).filter((anime): anime is Anime => anime !== undefined),
    };
  }

  async detail(slug: string): Promise<Anime | undefined> {
    const res = await this.api.get(`${this.baseUrl}/anime/${slug}/`);
    const $ = this.cheerio.load(res.data);

    const image = $(".fotoanime img").attr("src")?.trim();
    const synopsis = $(".sinopc p")
      .toArray()
      .map((p) => $(p).text().trim())
      .join("\n\n");

    let title;
    let titleJapan;
    let score;
    let producers: string[] = [];
    let type;
    let status: Status = "UNKNOWN";
    let duration;
    let aired: Date | undefined;
    let studios: string[] = [];
    let genres: Genre[] = [];
    let episodes: Episode[] = [];
    let batches: Batch[] = [];

    $(".infozin .infozingle p").each((_, el) => {
      const $$ = $(el);
      const [key, value] = $$.text().split(":");
      if (key.toLowerCase().trim() === "genre") {
        $$.find("a").each((_, a) => {
          const $a = $(a);
          const slug =
            $a
              .attr("href")
              ?.trim()
              .split("/genres/")[1]
              .replace("/", "")
              .trim() || "";
          genres.push({
            name: $a.text(),
            slug,
            source: this.name,
          });
        });
      }

      switch (key.trim().toLowerCase()) {
        case "judul":
          title = value.trim();
          break;
        case "japanese":
          titleJapan = value.trim();
          break;
        case "skor":
          score = Number(value.trim()) || 0;
          break;
        case "produser":
          producers = value
            .trim()
            .split(",")
            .map((s) => s.trim());
          break;
        case "tipe":
          type = value.trim();
          break;
        case "status":
          const v = value.trim().toLowerCase();
          status =
            v === "completed"
              ? "FINISHED"
              : v === "ongoing"
              ? "ONGOING"
              : "UNKNOWN";
          break;
        case "durasi":
          duration = value.trim();
          break;
        case "tanggal rilis":
          aired = parseDate(value.trim()) || undefined;
          break;
        case "studio":
          studios = value
            .trim()
            .split(",")
            .map((s) => s.trim());
          break;
      }
    });

    for (const el of $(".episodelist ul li span a").toArray()) {
      const $a = $(el);
      const href = $a.attr("href")?.trim() || "";
      if (href.includes("/episode/")) {
        episodes.push({
          name: $a.text(),
          slug: href.split("/episode/")[1].replace("/", "") || "",
          source: this.name,
        });
      } else if (href.includes("/batch/")) {
        const slug = href.split("/batch/")[1].replace("/", "") || "";
        batches = await this.batches(slug);
      }
    }

    return {
      slug,
      title: title || "",
      titleAlt: titleJapan,
      synopsis,
      posterUrl: image || "",
      type,
      rating: score,
      duration,
      aired,
      status,
      studios,
      genres,
      producers,
      episodes,
      characterTypes: [],
      batches,
      source: this.name,
    };
  }

  async genres(): Promise<Genre[]> {
    const res = await this.api.get(`${this.baseUrl}/genre-list/`);
    const $ = this.cheerio.load(res.data);
    const genres: Genre[] = [];
    $(".genres a").each((_, el) => {
      const $a = $(el);
      genres.push({
        name: $a.text().trim(),
        slug:
          $a
            .attr("href")
            ?.trim()
            .split("/genres/")[1]
            .replace("/", "")
            .trim() || "",
        source: this.name,
      });
    });
    return genres;
  }

  async streams(slug: string): Promise<Stream[]> {
    const nonce = await getNonceCode(this.api, this.baseUrl);

    const res = await this.api.get(`${this.baseUrl}/episode/${slug}/`);
    const $ = this.cheerio.load(res.data);

    return await Promise.all(
      $(".mirrorstream ul li a")
        .toArray()
        .map((el) =>
          this.limit(async () => {
            const $a = $(el);
            const content = JSON.parse(atob($a.attr("data-content") || ""));
            const url = await getEmbedUrl(
              this.api,
              this.baseUrl,
              nonce,
              content.id,
              content.i,
              content.q
            );
            return {
              name: content.q,
              url,
              source: this.name,
            } as Stream;
          })
        )
    );
  }

  private async batches(batchSlug: string): Promise<Batch[]> {
    const res = await this.api.get(`${this.baseUrl}/batch/${batchSlug}/`);

    const $ = this.cheerio.load(res.data);
    const urlGroups = $(".download2 .batchlink ul li")
      .toString()
      .split("</li>")
      .filter((item) => item.trim() !== "")
      .map((item) => `${item}<li>`);

    const batches: Batch[] = [];

    urlGroups.forEach((urlGroup) => {
      const $ = this.cheerio.load(urlGroup);
      const providers = $("a")
        .toString()
        .split("</a>")
        .filter((item) => item.trim() !== "")
        .map((item) => `${item}</a>`);

      const resolution = $("li strong")
        .text()
        .replace(/([A-z][A-z][0-9] )/, "");
      const file_size = $("li i").text();

      providers.forEach((provider) => {
        const $ = this.cheerio.load(provider);
        batches.push({
          name: $("a").text(),
          url: $("a").attr("href") || "",
          resolution,
          file_size,
          source: this.name,
        });
      });
    });

    return batches;
  }

  private async searchByDay(day: DAY_ID): Promise<string[]> {
    const res = await this.api.get(`${this.baseUrl}/jadwal-rilis/`);
    if (res.status !== 200) {
      return [];
    }

    const $ = this.cheerio.load(res.data);
    const slugs: string[] = [];

    $(".kgjdwl321 .kglist321").each((_, el) => {
      const $$ = $(el);
      const _day = $$.find("h2").first().text().trim().toLowerCase();
      if (_day == day) {
        $$.find("ul li a").each((_, el) => {
          slugs.push(
            $(el).attr("href")?.split("/anime/")[1].replace("/", "").trim() ||
              ""
          );
        });
      }
    });
    return slugs;
  }

  private async searchByAlphabet(alphabet: string): Promise<string[]> {
    const res = await this.api.get(`${this.baseUrl}/anime-list/`);
    if (res.status !== 200) {
      return [];
    }

    const $ = this.cheerio.load(res.data);
    const slugs: string[] = [];

    const section = $(
      `.bariskelom .barispenz a[name="${alphabet.toUpperCase()}"]`
    );

    section
      .closest(".bariskelom")
      .find(".bariskelom ul li a")
      .each((_, el) => {
        slugs.push(
          $(el).attr("href")?.split("/anime/")[1].replace("/", "").trim() || ""
        );
      });

    return slugs;
  }

  private async searchByGenre(
    genre: string,
    page = 1
  ): Promise<{
    slugs: string[];
    hasNext: boolean;
  }> {
    const res = await this.api.get(
      `${this.baseUrl}/genres/${genre}/page/${page}/`
    );
    if (res.status !== 200) {
      return {
        hasNext: false,
        slugs: [],
      };
    }
    const $ = this.cheerio.load(res.data);
    const hasNext = $(".next ").length > 0;
    const slugs: string[] = [];
    $(".venser .col-anime-title a").each((_, el) => {
      const $a = $(el);
      slugs.push(
        $a.attr("href")?.split("/anime/")[1].replace("/", "").trim() || ""
      );
    });
    return {
      slugs,
      hasNext,
    };
  }

  private async searchByStatus(
    status: Status = "FINISHED",
    page = 1
  ): Promise<{
    slugs: string[];
    hasNext: boolean;
  }> {
    const res = await this.api.get(
      status === "FINISHED"
        ? `${this.baseUrl}/complete-anime/page/${page}/`
        : `${this.baseUrl}/ongoing-anime/page/${page}/`
    );
    if (res.status !== 200) {
      return {
        hasNext: false,
        slugs: [],
      };
    }

    const $ = this.cheerio.load(res.data);

    const hasNext = $(".next ").length > 0;
    const slugs: string[] = [];
    $(".venutama .venz ul li a").each((_, el) => {
      const $a = $(el);
      slugs.push(
        $a.attr("href")?.split("/anime/")[1].replace("/", "").trim() || ""
      );
    });
    return {
      slugs,
      hasNext,
    };
  }
}
