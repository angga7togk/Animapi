<p align="right">
  <img src="https://raw.githubusercontent.com/angga7togk/angga7togk/refs/heads/main/toga-chibi.png" width="5%">
</p>

<p align="center">
  <a href="https://github.com/angga7togk" target="_blank">
    <img src="https://i.pinimg.com/originals/30/dd/0a/30dd0aa01adf2eaef4692801e6ffb6fb.gif" width="50%">
  </a>
</p>

<h1 align="center">Animapi</h1>
<p align="center">
  <strong>
    Animapi adalah library scrapper anime streaming dengan sangat cepat dan mudah digunakan.
  </strong>
</p>
<p align="center">
  <img src="https://img.shields.io/npm/v/animapi" alt="npm version">
  <img src="https://img.shields.io/npm/dm/animapi" alt="npm download">
  <img src="https://img.shields.io/npm/l/animapi" alt="npm license">
  <img src="https://img.shields.io/github/stars/angga7togk/Animapi" alt="github stars">
</p>


---

## Installation

```bash
npm i animapi
```

### Usage

```ts
import { Otakudesu } from "animapi";

const otakudesu = new Otakudesu();

/**
 * @return
 * {
 *    hasNext: true
 *    animes: [...]
 * }
 */
const res = await otakudesu.search({
  filter: {
    keyword: "kimetsu",
  },
});
```

## Next Target 🥶

- [Anoboy](https://ww3.anoboy.app/)
- [Samehadaku](https://samehadaku.care/)
- [Kuramanime](https://v8.kuramanime.tel/)
- [Zoronime](https://zoronime.com/)
- [Anime-indo](https://anime-indo.lol/)

## Provider Supports

<p>
  <a href="https://v1.animasu.top/" target="_blank">
    <img src="https://raw.githubusercontent.com/angga7togk/Animapi/refs/heads/main/.github/images/animasu.png?raw=true" width="30%">
  </a>
  <a href="https://otakudesu.best/" target="_blank">
    <img src="https://raw.githubusercontent.com/angga7togk/Animapi/refs/heads/main/.github/images/otakudesu.png?raw=true" width="30%">
  </a>
</p>
