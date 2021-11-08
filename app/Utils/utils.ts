import { DateTime } from "luxon";

export const tanggalBulanTahun = DateTime.fromISO(
  DateTime.now().toISO()
).toFormat("yyyy-LL-dd");

export const tanggalBulanTahunJamMenitDetik = DateTime.fromISO(
  DateTime.now().toISO()
).toFormat("yyyy-LL-dd HH:mm:ss");
