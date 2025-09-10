import { AxiosStatic } from "axios";
import * as cheerio from "cheerio";

/**
 * ? INI CODE ACTION AJAX WORDPRESS BUAT NGAMBIL 'nonce' BUAT REQUEST ke 'https://otakudesu.best/wp-admin/admin-ajax.php'
 * ? MAAFKAN SAYA ATMIN OTAKUDESU MWHEHEEH
 */
export const ACTION_GET_NONCE_CODE = "aa1208d27f29ca340c92c66d1926f13f";
/**
 * ? SETELAH AMBIL NONCE CODE TADI SEKARANG AMBIL STREAM EMBED URL PAKAI NONCE CODE TADI
 * ? SEKALI LAGI MAAFKAN SAYA ATMIN OTAKUDESU MWHEHEHE
 */
export const ACTION_GET_EMBED_CODE = "2a3505c93b0035d3f455df82bf976b84";

export async function getNonceCode(api: AxiosStatic, baseUrl: string) {
  const res = await api.post(
    `${baseUrl}/wp-admin/admin-ajax.php`,
    new URLSearchParams({
      action: ACTION_GET_NONCE_CODE,
    }).toString(),
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }
  );
  if (res.status !== 200) {
    return undefined;
  }
  return res.data.data;
}

export async function getEmbedUrl(
  api: AxiosStatic,
  baseUrl: string,
  nonce: string,
  id: string,
  i: string,
  q: string
) {
  const res = await api.post(
    `${baseUrl}/wp-admin/admin-ajax.php`,
    new URLSearchParams({
      action: ACTION_GET_EMBED_CODE,
      nonce,
      id,
      i,
      q,
    }).toString(),
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      timeout: 15000, // 15 detik
    }
  );
  if (res.status !== 200) {
    return undefined;
  }
  const iframe = atob(res.data.data);
  const $ = cheerio.load(iframe);
  return $("iframe").attr("src");
}
