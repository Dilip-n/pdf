var Minio = require("minio");

var minioClient = new Minio.Client({
  endPoint: "play.min.io",
  port: 9000,
  useSSL: true,
  accessKey: "minioadmin",
  secretKey: "minioadmin",
});

var file = "101134.pdf";

var metaData = {
  "Content-Type": "application/pdf",
  //   "X-Amz-Meta-Testing": 1234,
  //   example: 5678,
};
// Using fPutObject API upload your file to the bucket europetrip.
minioClient.fPutObject(
  "pdfnotifier",
  "urlscreenshots.pdf",
  file,
  metaData,
  function (err, etag) {
    if (err) return console.log(err);
    console.log("File uploaded successfully.");
  }
);

minioClient.presignedUrl(
  "GET",
  "pdfnotifier",
  "urlscreenshots.pdf",
  24 * 60 * 60,
  function (err, presignedUrl) {
    if (err) return console.log(err);
    console.log(presignedUrl);
  }
);

// function makeid(length) {
//   var result = "IOT";
//   var characters =
//     "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
//   var charactersLength = characters.length;
//   for (var i = 0; i < length; i++) {
//     result += characters.charAt(Math.floor(Math.random() * charactersLength));
//   }
//   return result;
// }
// const sr1 = makeid(5);
// console.log(sr1);
// console.log(sr1);
