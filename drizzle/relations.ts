import { relations } from "drizzle-orm/relations";
import { category, person } from "./schema";

export const personRelations = relations(person, ({ one }) => ({
  category: one(category, {
    fields: [person.categoryId],
    references: [category.id],
  }),
}));

export const categoryRelations = relations(category, ({ many }) => ({
  people: many(person),
}));
