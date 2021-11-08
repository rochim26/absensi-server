import { DateTime } from "luxon";
import {
  BaseModel,
  BelongsTo,
  belongsTo,
  column,
  hasMany,
} from "@ioc:Adonis/Lucid/Orm";
import Cameras from "./Cameras";

export default class Presence extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public photo_in: string;

  @column()
  public photo_out: string;

  @column()
  public mask_in: boolean;

  @column()
  public mask_out: boolean;

  @column()
  public temperature_in: number;

  @column()
  public temperature_out: number;

  @column()
  public display_name: string;

  @column()
  public similar_in: number;

  @column()
  public similar_out: number;

  @column()
  public check_in: DateTime;

  @column()
  public check_out: DateTime;

  @column()
  public camera_id: number;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @belongsTo(() => Cameras)
  public camera: BelongsTo<typeof Cameras>;
}
