import Drive from "@ioc:Adonis/Core/Drive";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Database from "@ioc:Adonis/Lucid/Database";
import Cameras from "App/Models/Cameras";
import Presence from "App/Models/Presence";
import {
  tanggalBulanTahun,
  tanggalBulanTahunJamMenitDetik,
} from "App/Utils/utils";
import axios from "axios";
import { DateTime } from "luxon";
const Excel = require("exceljs");

export default class PresencesController {
  public async index({ request, response }: HttpContextContract) {
    try {
      let { page } = request.qs();

      const presence = await Presence.query()
        .where("check_in", "like", `${tanggalBulanTahun}%`)
        .orderBy("check_in", "desc")
        .paginate(page);

      return response.ok({
        message: "sukses",
        data: {
          presence,
        },
      });
    } catch (error) {
      return response.ok({
        message: "gagal",
        data: error,
      });
    }
  }

  public async groupDate({ response }: HttpContextContract) {
    try {
      const presence = await Database.rawQuery(
        "select distinct(check_in) from presences"
      );

      return response.ok({
        message: "sukses",
        data: {
          presence,
        },
      });
    } catch (error) {
      return response.ok({
        message: "gagal",
        data: error,
      });
    }
  }

  public async create({}: HttpContextContract) {}

  public async store({ request, response }: HttpContextContract) {
    try {
      let {
        photo_in,
        mask_in,
        temperature_in,
        display_name,
        similar_in,
        check_in,
        camera_id,
      } = request.body();

      display_name = display_name
        ? display_name
        : `Tidak dikenal-${tanggalBulanTahunJamMenitDetik}`;

      const fileName = `face/${new Date().getTime()}.jpeg`;
      await Drive.put(fileName, Buffer.from(photo_in, "base64"));

      const check = await Presence.query()
        .where("display_name", display_name)
        .first();

      const camera = await Cameras.query().where("id", camera_id).first();

      if (!camera) {
        return response.notFound({
          message: "Data tidak ditemukan",
        });
      }

      if (check) {
        if (check_in > camera.check_out) {
          await Presence.query().where("display_name", display_name).update({
            photo_out: fileName,
            mask_out: mask_in,
            temperature_out: temperature_in,
            similar_out: similar_in,
            check_out: check_in,
          });
        } else {
          await Presence.query().where("display_name", display_name).update({
            photo_in: fileName,
            mask_in,
            temperature_in,
            similar_in,
          });
        }
      } else {
        await Presence.create({
          display_name,
          photo_in: fileName,
          mask_in,
          temperature_in,
          similar_in,
          check_in: check_in,
          camera_id,
        });

        try {
          await axios.post(`https://whatsapp.smarteschool.net/send-message`, {
            number: `${display_name.split("-")[0]}@c.us`,
            message: `${
              display_name.split("-")[1]
            } sudah hadir di sekolah pukul ${check_in} dengan suhu tubuh ${Math.abs(
              temperature_in
            )}℃ dan dalam keadaan ${
              mask_in ? "menggunakan masker" : "tidak menggunakan masker"
            }`,
          });
        } catch (err) {
          console.log(err.response.data);
        }
      }

      return response.ok({
        message: "sukses",
        data: {},
      });
    } catch (error) {
      return response.internalServerError({
        message: "gagal",
        data: error,
      });
    }
  }

  public async show({}: HttpContextContract) {}

  public async edit({}: HttpContextContract) {}

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}

  public async downloadAbsensiFaceRecog({}: // response,
  // request,
  HttpContextContract) {
    // const { tanggal_awal, tanggal_akhir, rombel_id } = request.body();
    // const keluarantanggalseconds =
    //   tanggalBulanTahunJamMenitDetik + new Date().getTime();

    // const checkInDistinct = await Database.raw(
    //   "SELECT DISTINCT DATE_FORMAT(check_in, '%Y-%m-%d') as checkInDistinct from presences WHERE check_in BETWEEN ? AND  ?",
    //   [tanggal_awal, tanggal_akhir]
    // );

    // let { page } = request.qs();

    // const presence = await Presence.query()
    //   .whereBetween("check_in", [`${tanggal_awal}`, `${tanggal_akhir}`])
    //   .orderBy("check_in", "desc")
    //   .distinct("check_in");

    // // loop pertama untuk nge looping data Siswa
    // const rekapAbsenSiswa = await Promise.all(
    //   presence.map(async (d) => {
    //     let namaSiswa = d.display_name.split("-")[1];
    //     let waSiswa = d.display_name.split("-")[0];
    //     let totalSakit = 0;
    //     let totalHadir = 0;
    //     let totalTelat = 0;
    //     let totalIzin = 0;
    //     let totalAlpa = 0;

    //     loop ketiga untuk nge looping absen Siswa
    //     if (
    //       (await Promise.all(
    //         checkInDistinct.find(async (tanggal) => {
    //           tanggal.checkInDistinct ==
    //             DateTime.fromJSDate(new Date()).toFormat("YYYY-MM-DD");
    //         })
    //       )) !== undefined
    //     ) {
    //       totalHadir = totalHadir + 1;

    //       if (DateTime.fromJSDate(new Date()).toFormat("HH:mm:ss") > "06.30") {
    //         totalTelat = totalTelat + 1;
    //       }
    //     }

    //     totalAlpa =
    //       checkInDistinct[0].length - (totalSakit + totalHadir + totalIzin);

    //     return {
    //       namaSiswa,
    //       waSiswa,
    //       totalSakit,
    //       totalHadir,
    //       totalTelat,
    //       totalIzin,
    //       totalAlpa,
    //     };
    //   })
    // );

    // return rekapAbsenSiswa;

    let workbook = new Excel.Workbook();

    let worksheet = workbook.addWorksheet(`RekapAbsen`);
    // const awal = DateTime.fromJSDate(new Date(tanggal_awal)).toFormat(
    //   "DD-MM-YYYY"
    // );
    // const akhir = DateTime.fromJSDate(new Date(tanggal_akhir)).toFormat(
    //   "DD-MM-YYYY"
    // );
    // worksheet.getCell("A5").value = `Diunduh tanggal ${keluarantanggalseconds}`;
    // worksheet.addConditionalFormatting({
    //   ref: `A1:G4`,
    //   rules: [
    //     {
    //       type: "expression",
    //       formulae: ["MOD(ROW()+COLUMN(),1)=0"],
    //       style: {
    //         font: {
    //           name: "Times New Roman",
    //           family: 4,
    //           size: 16,
    //           bold: true,
    //         },
    //         alignment: {
    //           vertical: "middle",
    //           horizontal: "center",
    //         },
    //       },
    //     },
    //   ],
    // });
    // worksheet.addConditionalFormatting({
    //   ref: `A4:G4`,
    //   rules: [
    //     {
    //       type: "expression",
    //       formulae: ["MOD(ROW()+COLUMN(),1)=0"],
    //       style: {
    //         font: {
    //           name: "Times New Roman",
    //           family: 4,
    //           size: 12,
    //           bold: true,
    //         },
    //         alignment: {
    //           vertical: "middle",
    //           horizontal: "center",
    //         },
    //       },
    //     },
    //   ],
    // });
    // worksheet.mergeCells(`A1:G1`);
    // worksheet.mergeCells(`A2:G2`);
    // worksheet.mergeCells(`A3:G3`);
    // worksheet.mergeCells(`A4:G4`);
    // worksheet.addConditionalFormatting({
    //   ref: `A6:G6`,
    //   rules: [
    //     {
    //       type: "expression",
    //       formulae: ["MOD(ROW()+COLUMN(),1)=0"],
    //       style: {
    //         font: {
    //           name: "Times New Roman",
    //           family: 4,
    //           size: 12,
    //           bold: true,
    //         },
    //         alignment: {
    //           vertical: "middle",
    //           horizontal: "center",
    //         },
    //         fill: {
    //           type: "pattern",
    //           pattern: "solid",
    //           bgColor: { argb: "C0C0C0", fgColor: { argb: "C0C0C0" } },
    //         },
    //         border: {
    //           top: { style: "thin" },
    //           left: { style: "thin" },
    //           bottom: { style: "thin" },
    //           right: { style: "thin" },
    //         },
    //       },
    //     },
    //   ],
    // });

    // await Promise.all(
    //   rekapAbsenSiswa.map(async (d, idx) => {
    //     worksheet.addConditionalFormatting({
    //       ref: `B${(idx + 1) * 1 + 6}:G${(idx + 1) * 1 + 6}`,
    //       rules: [
    //         {
    //           type: "expression",
    //           formulae: ["MOD(ROW()+COLUMN(),1)=0"],
    //           style: {
    //             font: {
    //               name: "Times New Roman",
    //               family: 4,
    //               size: 11,
    //               // bold: true,
    //             },
    //             alignment: {
    //               vertical: "middle",
    //               horizontal: "left",
    //             },
    //             border: {
    //               top: { style: "thin" },
    //               left: { style: "thin" },
    //               bottom: { style: "thin" },
    //               right: { style: "thin" },
    //             },
    //           },
    //         },
    //       ],
    //     });
    //     worksheet.addConditionalFormatting({
    //       ref: `A${(idx + 1) * 1 + 6}`,
    //       rules: [
    //         {
    //           type: "expression",
    //           formulae: ["MOD(ROW()+COLUMN(),1)=0"],
    //           style: {
    //             font: {
    //               name: "Times New Roman",
    //               family: 4,
    //               size: 11,
    //               // bold: true,
    //             },
    //             alignment: {
    //               vertical: "middle",
    //               horizontal: "center",
    //             },
    //             border: {
    //               top: { style: "thin" },
    //               left: { style: "thin" },
    //               bottom: { style: "thin" },
    //               right: { style: "thin" },
    //             },
    //           },
    //         },
    //       ],
    //     });
    //     worksheet.getRow(6).values = [
    //       "No",
    //       "Nama",
    //       "Whatsapp",
    //       "Hadir",
    //       "Telat",
    //       "Sakit",
    //       "Izin",
    //       "Alpa",
    //     ];

    //     worksheet.columns = [
    //       { key: "no" },
    //       { key: "user" },
    //       { key: "whatsapp" },
    //       { key: "hadir" },
    //       { key: "telat" },
    //       { key: "sakit" },
    //       { key: "izin" },
    //       { key: "alpa" },
    //     ];

    //     let row = worksheet.addRow({
    //       no: `${idx + 1}`,
    //       user: d ? d.namaSiswa : "-",
    //       whatsapp: d ? d.waSiswa : "-",
    //       hadir: d ? d.totalHadir : "-",
    //       telat: d ? d.totalTelat : "-",
    //       sakit: d ? d.totalSakit : "-",
    //       izin: d ? d.totalIzin : "-",
    //       alpa: d ? d.totalAlpa : "-",
    //     });
    //   })
    // );

    // worksheet.getCell("A1").value = "Rekap Absen";
    // worksheet.getCell("A4").value = `${awal} sampai ${akhir}`;

    // worksheet.views = [
    //   {
    //     state: "frozen",
    //     xSplit: 2,
    //     ySplit: 6,
    //     topLeftCell: "A6",
    //     activeCell: "A6",
    //   },
    // ];

    let namaFile = `/uploads/rekap-absen-face-recognition.xlsx`;

    // save workbook to disk
    await workbook.xlsx.writeFile(`public${namaFile}`);

    return namaFile;
  }
}
