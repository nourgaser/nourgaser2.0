// compile portfolio.handlebars and generate portfolio.html

const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");
const dirs = require("../public/data/dirs.json");

// read portfolio.handlebars
const template = fs.readFileSync(
  path.join(__dirname, "portfolio.handlebars"),
  "utf8"
);

// prepare template context
const context = [];
dirs.forEach((dir) => {
  const dirPath = path.join(__dirname, "../public/data", dir);
  const dataFile = fs.readFileSync(path.join(dirPath, "data.json"), "utf8");
  const data = JSON.parse(dataFile);

  // see any of the data.json files for the structure
  context.push({ ...data });
});

// compile template
const compiledTemplate = Handlebars.compile(template);

// generate portfolio.html
const html = compiledTemplate(context);
fs.writeFileSync(path.join(__dirname, "./portfolio.html"), html);
