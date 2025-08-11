import { describe, expect, test } from "vitest";
import { Animasu } from "./animasu";

describe("Animasu", () => {
  test("Get Animes", async () => {
    const res = await new Animasu().getAnimes();
    expect(res.animes.length).toBeGreaterThan(1);
  });
  test("Get Animes by search", async () => {
    const res = await new Animasu().getAnimes({
      q: "naruto",
    });
    expect(res.animes[0].title.toLowerCase()).toContain("naruto");
  });
  test("Get Animes by genres", async () => {
    const res = await new Animasu().getAnimes({
      genres: ["Aksi"],
    });
    expect(res.animes.length).toBeGreaterThan(1);
  });
  test("Get Animes by day", async () => {
    const res = await new Animasu().getAnimes({
      day: "monday",
    });
    expect(res.animes.length).toBeGreaterThan(1);
  });
  test("Get Animes by alphabet", async () => {
    const res = await new Animasu().getAnimes({
      alphabet: "a",
    });
    expect(res.animes.length).toBeGreaterThan(1);
  });
  test("Get Anime Detail", async () => {
    const anime = await new Animasu().getAnime('hotel-inhumans')
    expect(anime).toBeTruthy();
  });
  test("Get Streams", async () => {
    const streams = await new Animasu().getStreams("nonton-hotel-inhumans-episode-6")
    expect(streams.length).toBeGreaterThan(1);
  })
  test("Get Genres", async () => {
    const genres = await new Animasu().getGenres();
    expect(genres.length).toBeGreaterThan(1);
  });
});
