import { DateTime } from "luxon";
import { BaseModel, column } from "@ioc:Adonis/Lucid/Orm";

export default class Cameras extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public ip_cam: string;

  @column()
  public last_sync: string;

  @column()
  public check_in: string;

  @column()
  public check_out: string;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
