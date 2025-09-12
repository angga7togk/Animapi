import { describe, expect, test } from "vitest";
import { AnimeIndo } from ".";
describe("Anime-Indo", () => {
  test("Get Animes Detail", async () => {
    // const res = await new AnimeIndo().search({
    //   filter: {
    //     alphabet: "A",
    //     page: 2,
    //   },
    // });
    // console.log(res);

    // const genres = await new AnimeIndo().genres();

    const streams = await new AnimeIndo().streams('oshi-no-ko-2nd-season-episode-1');
    console.log(streams)
  }, 20000);
});
