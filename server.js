const express = require("express");
const mongoose = require("mongoose");
const schema = require("./models/shortUrls");
const alert = require("alert-node");
const app = express();
app.use(express.urlencoded({ extended: false }));
mongoose.set("useFindAndModify", false);
mongoose.connect("mongodb://localhost/urlShortner", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const model = mongoose.model("ShortUrl", schema);
app.set("view engine", "ejs");

app.get("/", async (req, res) => {
  const shortUrls = await model.find();
  res.render("index", { shortUrls: shortUrls });
});

app.post("/shortUrls", async (req, res) => {
  await model.create({ full: req.body.fullUrl });
  res.redirect("/");
});

app.get("/:shortUrl", async (req, res) => {
  const shortUrlGot = await model
    .findOneAndUpdate(
      { short: req.params.shortUrl },
      { $inc: { clicks: 1 } },
      { new: true }
    )
    .select({ short: 1, full: 1, clicks: 1 });

  try {
    if (!shortUrlGot) return res.sendStatus(404);

    res.status(301).redirect(shortUrlGot.full);
  } catch (error) {
    res.render("model");
  }
});

app.listen(process.env.PORT || 5000);
