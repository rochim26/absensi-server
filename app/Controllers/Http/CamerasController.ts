import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Cameras from "App/Models/Cameras";
import {
  tanggalBulanTahun,
  tanggalBulanTahunJamMenitDetik,
} from "App/Utils/utils";

export default class CamerasController {
  public async index({ response, request }: HttpContextContract) {
    try {
      let { page } = request.body();

      page = page ? page : 1;

      const camera = await Cameras.query()
        .where("created_at", "like", `${tanggalBulanTahun}%`)
        .paginate(page);

      return response.ok({
        message: "sukses",
        data: {
          camera,
        },
      });
    } catch (error) {
      return response.internalServerError({
        message: "gagal",
        data: error,
      });
    }
  }

  public async store({ request, response }: HttpContextContract) {
    try {
      const { ip_cam, check_in, check_out } = request.body();

      await Cameras.create({
        ip_cam,
        last_sync: tanggalBulanTahun + " 00:00:00",
        check_in,
        check_out,
      });

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

  public async update({ params: { id }, response }: HttpContextContract) {
    try {
      await Cameras.query().where({ id }).update({
        last_sync: tanggalBulanTahunJamMenitDetik,
      });

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

  public async destroy({ params: { id }, response }: HttpContextContract) {
    try {
      await Cameras.query().where({ id }).delete();

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
}
