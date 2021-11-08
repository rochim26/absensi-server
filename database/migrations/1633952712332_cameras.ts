import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class Cameras extends BaseSchema {
  protected tableName = "cameras";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id");
      table.string("ip_cam");
      table.string("check_in");
      table.string("check_out");
      table.datetime("last_sync");
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
