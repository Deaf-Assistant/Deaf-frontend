const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

app.post("/auth/register", (req, res) => {
  const { name, email, role } = req.body;
  return res.status(201).json({
    token: "mock-token",
    user: { id: "u1", name, email, role },
  });
});

app.post("/auth/login", (req, res) => {
  const { email } = req.body;
  return res.json({
    token: "mock-token",
    user: { id: "u1", name: "Demo", email, role: "STUDENT" },
  });
});

app.get("/courses", (_req, res) => res.json([]));

app.listen(8080, () => console.log("Mock API running on http://localhost:8080"));
