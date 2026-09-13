const express = require("express");
const cors = require("cors");

const inspectionRoutes = require("./routes/inspection");

const app = express();

const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    service: "METRIFY Backend",
    status: "running",
  });
});

app.use("/api/inspection", inspectionRoutes);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`METRIFY backend running on port ${PORT}`);
});