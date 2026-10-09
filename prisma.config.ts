 import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  // 🟢 DAPAT PANGALAN NG FOLDER LANG ("prisma"), HINDI FILE ("schema.prisma")!
  schema: "prisma", 
  datasource: {
    url: env("DATABASE_URL"), 
  },
});
