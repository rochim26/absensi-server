import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class Presences extends BaseSchema {
  protected tableName = "presences";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id");
      table.string("photo_in");
      table.boolean("mask_in");
      table.float("temperature_in", 2);
      table.datetime("check_in");
      table.float("similar_in", 2);
      table.string("display_name");
      table.string("photo_out");
      table.boolean("mask_out");
      table.float("temperature_out", 2);
      table.datetime("check_out");
      table.float("similar_out", 2);
      table
        .integer("camera_id")
        .unsigned()
        .references("cameras.id")
        .onDelete("CASCADE");

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp("created_at", { useTz: true });
      table.timestamp("updated_at", { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
