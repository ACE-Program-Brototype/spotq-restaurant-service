import app from "./app.js";
import { DatabaseService } from "./infrastructure/database/db.js";
import { PORT } from "./shared/constants/app.constants.js";

async function bootstrap() {
  try {
    await DatabaseService.connect();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start application", error);
    process.exit(1);
  }
}

bootstrap();