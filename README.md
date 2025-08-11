<p align="right">
  <img src="https://raw.githubusercontent.com/angga7togk/angga7togk/refs/heads/main/toga-chibi.png" width="5%">
</p>

<p align="center">
  <a href="https://github.com/angga7togk">
    <img src="https://i.pinimg.com/originals/30/dd/0a/30dd0aa01adf2eaef4692801e6ffb6fb.gif" width="50%">
  </a>
</p>

<h1 align="center">TaberuAPI</h1>
<p align="center">
  <strong>
    TaberuAPI is a library for free anime streaming websites
  </strong>
</p>

---

# 🫥 Introduction

TaberuAPI adalah library scrapper untuk website anime streaming dengan kecepatan yang cepat dan mudah digunakan.

## 🚀 Test Speed

Berikut adalah hasil test speed dari library ini.<br/>
Percobaan Pertama memang akan sedikit lama, tapi percobaan selanjutnya akan lebih cepat, karna disini saya memakai cache.

![Taberu Speed Test](https://github.com/angga7togk/Taberu/blob/main/test-cache.png?raw=true)

## 📝 List Source

Berikut adalah source atau website yang support di scraping

| Source            | Documentation                                                                           | Status |
| ----------------- | --------------------------------------------------------------------------------------- | ------ |
| <b>Animasu</b>    | [Lihat Dokumentasi](https://github.com/angga7togk/Taberu/blob/main/docs/animasu.md) | ✅     |
| <b>Otakudesu</b>  | -                                                                                       | ⌛     |
| <b>Zoronime</b>   | -                                                                                       | ⌛     |
| <b>Kuramanime</b> | -                                                                                       | ⌛     |

---

# ⚙️ Installation & Configuration

```bash
npm i yaoi
```

## ❔ Usage

### ES6

```ts
import { animasu } from "yaoi";

animasu
  .getAnimes({
    page: 1,
    search: "naruto",
    sort: "update",
  })
  .then(console.log);
```

### CommonJS

```js
const { animasu } = require("yaoi");
```

## Configuration Environment (ENV)

Environment berikut tidak harus diisi, karna sudah di set default.<br/>
Ini adalah untuk kebutuhan semisal domain website yang di tuju berubah.

```env
ANIMASU_BASE_URL=https://website.com

CACHE_TTL=600
```
