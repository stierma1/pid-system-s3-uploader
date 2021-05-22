const System = require("pid-system");
const AWS = require('aws-sdk');
var fs = require('fs');

module.exports = async function() {
    this.dictionary.instanceId = Date.now();
    System.send("system-logger", [Date.now(), "INFO", "s3-uploader", this.dictionary.instanceId, "created"]);
    System.send("system-configuration", ["s3-uploader", this]);
    while (true) {
        let [localFilePath, s3Params, rej, res] = await this.receive();

        System.send("system-logger", [Date.now(), "INFO", "s3-uploader", this.dictionary.instanceId, "message received"]);
        System.send("system-logger", [Date.now(), "DEBUG", "s3-uploader", this.dictionary.instanceId, "message received: ", [localFilePath, s3Params]]);

        try {
            await new Promise((resolve, reject) => {
              AWS.config.update({
                  region: this.dictionary.region || "us-west-2"
              });
              s3 = new AWS.S3({
                  apiVersion: '2006-03-01'
              });
                var fileStream = fs.createReadStream(localFilePath);
                fileStream.on('error', function(err) {
                    reject(err);
                });
                s3Params.Body = fileStream;
                s3.upload(s3Params, (er, data) => {
                    if (er) {
                        reject(er);
                    } else {
                        resolve(data);
                    }
                })

            })
            System.send("system-logger", [Date.now(), "INFO", "s3-uploader", this.dictionary.instanceId, "done"]);
            res?.();
        } catch (e) {
            System.send("system-logger", [Date.now(), "ERROR", "s3-uploader", this.dictionary.instanceId, "unable to upload:" + "\r\n" + e.stack]);
            rej?.(e);
        }

    }
}
