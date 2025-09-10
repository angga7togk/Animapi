import { Otakudesu } from ".";

const otakudesu = new Otakudesu();

(async () => {
  /**
   * @return
   * {
   *    hasNext: true
   *    animes: [...]
   * }
   */
  const res = await otakudesu.search({
    filter: { keyword: "kimetsu" },
  });

  console.log(res);
})();
