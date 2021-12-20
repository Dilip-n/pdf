const { Client } = require("pg");
//Import Events
const EventEmitter = require("events");
//Import Util
const util = require("util");

const puppeteer = require("puppeteer");

var Minio = require("minio");

const { db, minio } = require("./config/adaptor");

(async () => {
  const client = new Client(db.pg.uri);
  try {
    await client.connect();
    console.log("DataBase connected!");
  } catch (e) {
    console.log("DataBase Not connected", e);
  }

  var minioClient = new Minio.Client({
    endPoint: minio.minioHost,
    port: minio.minioPort,
    useSSL: false,
    accessKey: minio.minioUsername,
    secretKey: minio.minioPassword,
  });
  // Build and instantiate our custom event emitter
  function DbEventEmitter() {
    EventEmitter.call(this);
  }
  util.inherits(DbEventEmitter, EventEmitter);

  const dbEventEmitter = new DbEventEmitter();

  // Handle New devices
  dbEventEmitter.on("new_data", async (msg) => {
    const url = msg.endpoint;

    const browser = await puppeteer.launch({
      headless: true,
    });
    const webPage = await browser.newPage();
    await webPage.setViewport({ width: 1400, height: 1000 });
    await webPage.goto(url, {
      waitUntil: "networkidle0",
    });
    const pdf = await webPage.pdf({
      printBackground: true,
      format: "letter",
      printBackground: true,
      displayHeaderFooter: true,
      margin: {
        top: "20px",
        bottom: "40px",
        left: "20px",
        right: "20px",
      },
    });
    await browser.close();

    var metaData = {
      "Content-Type": "application/pdf",
      //   "X-Amz-Meta-Testing": 1234,
      //   example: 5678,
    };
    function makeid(length) {
      var result = "IOT";
      var characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      var charactersLength = characters.length;
      for (var i = 0; i < length; i++) {
        result += characters.charAt(
          Math.floor(Math.random() * charactersLength)
        );
      }
      return result;
    }
    const sr1 = makeid(5);

    // Using fPutObject API upload your file to the bucket europetrip.
    minioClient.putObject(
      "s4maps",
      `${sr1}.pdf`,
      pdf,
      metaData,
      function (err, etag) {
        if (err) return console.log(err);
        console.log("File uploaded successfully.");

        minioClient.presignedUrl(
          "GET",
          "s4maps",
          `${sr1}.pdf`,
          24 * 60 * 60,
          function (err, presignedUrl) {
            if (err) return console.log(err);
            console.log(presignedUrl);
            const query = {
              text: "UPDATE dbrecords SET result_pdf_url = $1,status=$2 WHERE id = $3",
              values: [presignedUrl, true, msg.id],
            };

            client.query(query, (err, res) => {
              if (err) {
                console.log(err.stack);
              } else {
                console.log(res.rowCount);
              }
            });
          }
        );
      }
    );
  });

  client.on("notification", function (msg) {
    let payload = JSON.parse(msg.payload);

    dbEventEmitter.emit(msg.channel, payload);
  });
  // client.query("LISTEN new_data");
  client.query("LISTEN updatenotifier");
})();
