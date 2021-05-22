const System = require("pid-system");
const path = require("path");

const Bucket = "test.tinspoon.net";
const Key = "some/test/key.json";
const testFile = path.join(__dirname, "../package.json");

(async function(){
  const l = await System.spawn(path.join(__dirname, "/system-logger"), null);

  await System.register("system-logger", l);

  const p = await System.spawn(path.join(__dirname, "../src/s3-uploader"), null);

  await new Promise((re, je) => {
    p.send([testFile, {Bucket, Key, "ContentType": "application/json"}, je, re]);
  })
})();
