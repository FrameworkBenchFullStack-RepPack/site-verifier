import {
  pgTable,
  serial,
  varchar,
  foreignKey,
  smallint,
  integer,
} from "drizzle-orm/pg-core";

export const category = pgTable("category", {
  id: serial().primaryKey().notNull(),
  name: varchar({ length: 50 }).notNull(),
});

export const person = pgTable(
  "person",
  {
    id: serial().primaryKey().notNull(),
    name: varchar({ length: 100 }).notNull(),
    age: smallint().notNull(),
    categoryId: integer("category_id").notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.categoryId],
      foreignColumns: [category.id],
      name: "person_category_id_fkey",
    }),
  ],
);
