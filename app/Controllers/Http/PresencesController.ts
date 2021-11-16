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

export default class PresencesController {
  public async index({ request, response }: HttpContextContract) {
    try {
      let { page } = request.qs();

      const presence = await Presence.query()
        .where("created_at", "like", `${tanggalBulanTahun}%`)
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
}
