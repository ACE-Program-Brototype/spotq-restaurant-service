import app from "./app.js";
import { PORT } from "./shared/constants/app.constants.js";


app.listen(PORT, () => {
  console.log(`Restaurant Service running on port ${PORT}`);
});