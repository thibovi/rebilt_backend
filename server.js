const express = require("express");
const bodyParser = require("body-parser");
const imageRoutes = require("./routes/ImageRoutes");

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use("/api/images", imageRoutes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
