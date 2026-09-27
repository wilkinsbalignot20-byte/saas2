 import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"), // <--- ITO LAMANG ANG DAPAT MATIRA DITO!
  },
});
