import {
  Params,
  Response,
  AnimeDetail,
  Stream,
  Genre,
  AnimeSimple,
  Character,
  Episode,
  Batch,
} from "../types";
import { TaberuProvider } from "./provider";
import axios from "axios";
import * as cheerio from "cheerio";
import { convertDay } from "../utils/day-converter";

export class Animasu extends TaberuProvider {
  constructor(providerUrl?: string) {
    super(providerUrl || "https://v1.animasu.top");
  }

  async getAnimes(params?: Params): Promise<Response> {
    if (params?.day) {
      return {
        hasNext: false,
        animes: await this.findByDay(params?.day),
      };
    } else if (params?.alphabet) {
      return await this.findByAlphabet(params?.alphabet, params?.page || 1);
    }
    return await this.findAnimes(params);
  }
  async getAnime(slug: string): Promise<AnimeDetail | undefined> {
    try {
      const res = await axios.get(`${this.providerUrl}/anime/${slug}/`);

      const $ = cheerio.load(res.data);

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
          });
        });

      let status = "";
      infox.find(".spe span").each((_, el) => {
        const text = $(el).text().trim();
        if (text.toLowerCase().startsWith("status:")) {
          const value = text.split(":")[1]?.trim();
          status = value.includes("🔥")
            ? "ONGOING"
            : value.includes("Selesai")
            ? "COMPLETE"
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

      const episode = infox
        .find(".spe span")
        .filter((_, el) => $(el).text().toLowerCase().startsWith("episode:"))
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

      const posted = infox.find(".spe span[itemprop='author'] i").text().trim();

      const updateAt =
        infox
          .find(".spe span.split time[itemprop='dateModified']")
          .attr("datetime") || "";

      const episodes: Episode[] = [];
      $("#daftarepisode li").each((index, el) => {
        const a = $(el).find(".lchx a");
        const episode = a.text().trim();
        const url = a.attr("href") || "";
        const slug = url.split("/")[3] || "";
        episodes.push({
          episode,
          slug,
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
            });
          });
      });

      const characterTypes: Character[] = [];
      try {
        $("#tikar_shw a").each((index, el) => {
          const href = $(el).attr("href") || "";
          const name = $(el).text().trim();
          const slug = href.split("/")[4] || "";
          characterTypes.push({
            name,
            slug,
          });
        });
      } catch (er) {}

      const data = {
        slug,
        title,
        synonym,
        synopsis,
        posterUrl: image,
        rating: Number(rating.split(" ")[1]) || 0,
        author,
        genres,
        characterTypes,
        status,
        aired: aired || "Unknown",
        type: type || "Unknown",
        episode: episode || "Unknown",
        duration: duration || "Unknown",
        studio: studio || "Unknown",
        season: season || "Unknown",
        trailer,
        updateAt,
        episodes,
        batches,
      };
      return data;
    } catch (error) {
      console.error("Error saat mengambil data anime:", error);
    }
  }
  async getStreams(episodeSlug: string): Promise<Array<Stream>> {
    try {
      const streams: Stream[] = [];
      const res = await axios.get(`${this.providerUrl}/${episodeSlug}/`);
      const $ = cheerio.load(res.data);

      $(".mirror option").each((index, el) => {
        const value = $(el).attr("value")?.trim();
        if (value) {
          const name = $(el).text().trim();
          const $$ = cheerio.load(`<div>${atob(value)}</div>`);
          streams.push({
            name,
            url: $$("iframe").attr("src")?.trim() || "",
          });
        }
      });
      return streams;
    } catch (error) {
      console.error("Error saat mengambil data stream:", error);
      return [];
    }
  }
  async getCharacters(): Promise<Character[]> {
    try {
      const res = await axios.get(
        `${this.providerUrl}/kumpulan-tipe-karakter-lengkap/`
      );
      const $ = cheerio.load(res.data);
      const characters: Character[] = [];
      $(".genrepage a").each((index, el) => {
        const name = $(el).text().trim();
        const url = $(el).attr("href") || "";
        const slug = url.split("/")[4] || "";
        characters.push({
          name,
          slug,
        });
      });
      return characters;
    } catch (error) {
      console.error("Error saat mengambil data character:", error);
      return [];
    }
  }
  async getGenres(): Promise<Array<Genre>> {
    try {
      const res = await axios.get(
        `${this.providerUrl}/kumpulan-genre-anime-lengkap/`
      );
      const $ = cheerio.load(res.data);
      const genres: Genre[] = [];
      $(".genrepage a").each((index, el) => {
        const name = $(el).text().trim();
        const url = $(el).attr("href") || "";
        const slug = url.split("/")[4] || "";
        genres.push({
          name,
          slug,
        });
      });
      return genres;
    } catch (error) {
      console.error("Error saat mengambil data genre:", error);
      return [];
    }
  }

  private async findAnimes(
    params?: Params & {
      characterTypes?: string[];
    }
  ): Promise<Response> {
    try {
      const res = await axios.get(
        params?.q
          ? `${this.providerUrl}/page/${params.page || 1}/`
          : `${this.providerUrl}/pencarian/`,
        {
          params: {
            s: params?.q || "",
            halaman: params?.page || 1,
            urutan: params?.sort || "update",
            "genre[]": params?.genres,
            "season[]": params?.seasons,
            "karakter[]": params?.characterTypes,
            status: params?.status,
            tipe: params?.type,
          },
        }
      );
      const $ = cheerio.load(res.data);
      const animes: AnimeSimple[] = [];

      $(".bs").each((index, el) => {
        const title = $(el).find(".tt").text().trim();
        const link = $(el).find("a").attr("href");

        const slug = link?.split("/")[4].trim() || "";

        const posterUrl =
          $(el).find("img").attr("data-src") || $(el).find("img").attr("src");
        const type = $(el).find(".typez").text().trim();
        const episode = $(el).find(".epx").text().trim();

        let status = $(el).find(".sb").text().trim();
        if (status.includes("🔥")) {
          status = "ONGOING";
        } else if (status.includes("Selesai")) {
          status = "COMPLETE";
        } else {
          status = "UPCOMING";
        }

        animes.push({
          title,
          slug,
          posterUrl: posterUrl || "",
          type,
          episode,
          status: status as "COMPLETE" | "ONGOING" | "UPCOMING",
        });
      });
      const hasNext =
        $(".hpage .r").length > 0 || $(".pagination .next").length > 0;

      const data = {
        animes,
        hasNext,
      };
      return data;
    } catch (error) {
      console.error("Error saat mengambil data anime:", error);
      return {
        hasNext: false,
        animes: [],
      };
    }
  }

  private async findByDay(
    _day?:
      | "monday"
      | "tuesday"
      | "wednesday"
      | "thursday"
      | "friday"
      | "saturday"
      | "sunday"
      | "random"
  ) {
    try {
      const day = convertDay(_day || "random");
      const res = await axios.get(`${this.providerUrl}/jadwal/`);
      const $ = cheerio.load(res.data);
      const animes: AnimeSimple[] = [];

      $(".bixbox").each((index, el) => {
        const $$ = $(el);
        const $day = ($$.find(".releases h3 span").text().trim() || "")
          .toLowerCase()
          .replace("update acak", "random")
          .replace("'", "");
        if ($day == day) {
          $(el)
            .find(".bs")
            .each((_index, _el) => {
              const $$$ = $(_el);

              const title = $$$.find(".tt").text().trim();
              const link = $$$.find("a").attr("href");

              const slug = link?.split("/")[4].trim() || "";

              const image =
                $$$.find("img").attr("data-src") || $$$.find("img").attr("src");
              const type = $$$.find(".typez").text().trim();
              const episode = $$$.find(".epx").text().trim();

              let status = $$$.find(".sb").text().trim();
              if (status.includes("🔥")) {
                status = "ONGOING";
              } else if (status.includes("Selesai")) {
                status = "COMPLETE";
              } else {
                status = "UPCOMING";
              }

              animes.push({
                title,
                slug,
                posterUrl: image || "",
                type,
                episode,
                status: status as "COMPLETE" | "ONGOING" | "UPCOMING",
              });
            });
        }
      });
      return animes;
    } catch (error) {
      console.error("Error saat mengambil data anime:", error);
      return [];
    }
  }

  private async findByAlphabet(alphabet: string, page = 1): Promise<Response> {
    try {
      const res = await axios.get(
        `${this.providerUrl}/daftar-anime/page/${page}/`,
        {
          params: {
            show: alphabet.toUpperCase(),
          },
        }
      );

      const $ = cheerio.load(res.data);

      const hasNext =
        $(".hpage .r").length > 0 || $(".pagination .next").length > 0;

      const animes: AnimeSimple[] = [];
      $(".bx").each((index, el) => {
        const $$ = $(el);

        const image = $$.find(".imgx img")?.attr("data-src")?.trim() || "";

        const title = $$.find(".inx h2 a").text().trim();
        let slug = $$.find(".inx h2 a").attr("href") || "";
        slug = slug.substring(0, slug.lastIndexOf("/")).split("/").pop() || "";

        const type = $($$.find(".inx span").get(3)).text().trim();

        const episode = $($$.find(".inx span").get(4))
          .text()
          .trim()
          .replace(", ", "");

        const status = $$.find(".inx span:contains('[Selesai]')").length
          ? "COMPLETE"
          : $$.find(".inx span:contains('Ongoing')").length
          ? "ONGOING"
          : "UPCOMING";

        animes.push({
          title,
          slug,
          posterUrl: image,
          type,
          episode,
          status,
        });
      });

      const result = {
        hasNext,
        animes: animes,
      };

      return result;
    } catch (error) {
      console.error("Error fetching anime data:", error);

      return {
        hasNext: false,
        animes: [],
      };
    }
  }
}
