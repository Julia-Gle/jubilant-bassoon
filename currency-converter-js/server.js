import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = 8080;
const EXCHANGE_RATE_API_KEY = "05c0302df3769315b599d3a363df7ddc";

app.use(express.json());
app.use(express.static("client"));

app.get("/api/convert", async (req, res) => {
  const { from, to, amount } = req.query;
  if (!from || !to || !amount) {
    return res.status(400).json({ error: "No parameters from, to, amount" });
  }

  if (typeof from !== "string" || from.length !== 3) {
    return res.status(400).json({ error: "Invalid from currency code" });
  }

  if (typeof to !== "string" || to.length !== 3) {
    return res.status(400).json({ error: "Invalid to currency code" });
  }

  const amountNum = parseFloat(amount);
  if (isNaN(amountNum)) {
    return res.status(400).json({ error: "Amount must be a number" });
  }

  if (amountNum <= 0) {
    return res.status(400).json({ error: "Amount must be positive" });
  }

  try {
    const response = await fetch(`https://api.exchangerate.host/convert?access_key=${EXCHANGE_RATE_API_KEY}&from=${from}&to=${to}&amount=${amount}`);
    const data = await response.json();
    console.log(data);
    if (!data.success) {
      return res.status(400).json({
        error: "Currency conversion failed",
        details: (data.error && data.error.info) || "error from exchange rate API",
        apiResponse: data,
      });
    }

    const result = {
      from: data.query.from,
      to: data.query.to,
      amount: parseFloat(data.query.amount),
      rate: data.info.quote,
      result: data.result,
    };
    console.log(result);
    res.json(result);
  } catch (error) {
    console.error("Error calling exchange rate API:", error);
    res.status(500).json({
      error: "Failed to convert currency",
      details: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
