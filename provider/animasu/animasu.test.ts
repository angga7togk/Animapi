import { describe, expect, test } from "vitest";
import { Animasu } from ".";

describe("Animasu", () => {
  test("Get Animes", async () => {
    const res = await new Animasu().search({
      filter: {
        alphabet: 'z'
      }
    });
    console.log(res)
    expect(res.animes.length).toBeGreaterThan(1);
  });
  // test("Get Animes by search", async () => {
  //   const res = await new Animasu().search("naruto");
  //   expect(res.animes[0].title.toLowerCase()).toContain("naruto");
  // });
  // test("Get Animes by genres", async () => {
  //   const res = await new Animasu().search(undefined, {
  //     filter: { genres: ["Aksi"] },
  //   });
  //   expect(res.animes.length).toBeGreaterThan(1);
  // });
  // test("Get Animes by day", async () => {
  //   const res = await new Animasu().getAnimes({
  //     day: "monday",
  //   });
  //   expect(res.animes.length).toBeGreaterThan(1);
  // });
  // test("Get Animes by alphabet", async () => {
  //   const res = await new Animasu().getAnimes({
  //     alphabet: "a",
  //   });
  //   expect(res.animes.length).toBeGreaterThan(1);
  // });
  // test("Get Anime Detail", async () => {
  //   const anime = await new Animasu().detail("hotel-inhumans");
  //   expect(anime).toBeTruthy();
  // });
  // test("Get Streams", async () => {
  //   const streams = await new Animasu().streams(
  //     "nonton-hotel-inhumans-episode-6"
  //   );
  //   expect(streams.length).toBeGreaterThan(1);
  // });
  // test("Get Genres", async () => {
  //   const genres = await new Animasu().genres();
  //   expect(genres.length).toBeGreaterThan(1);
  // });
});
