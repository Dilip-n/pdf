/*jshint esversion: 8 */
const path = require("path");
//Get all the settings
const setting = require("./settings.dev");

module.exports = {
  appName: "Bin Monitoring Backend",

  env: setting.appEnv,
  port: setting.appPort,
  logs: setting.appLog,

  //ip:'localhost', //This will not let app accesible on LAN
  ip: setting.appHost,

  root: path.normalize(`${__dirname}/../..`), // root
  base: path.normalize(`${__dirname}/..`), // base

  loginAPIServer: setting.loginAPIServer,

  logFileName: {
    info: "info.log",
    error: "exceptions.log",
  },
  db: {
    pg: {
      // PGSQL - Sample URI
      // uri: 'postgres://user:pass@example.com:5432/dbname'
      uri: (() => {
        //If Username Password is set
        if (setting.pgdbIsAuth === "true") {
          return `postgres://${setting.pgdbUsername}:${setting.pgdbPassword}@${setting.pgdbHost}:${setting.pgdbPort}/${setting.pgDbName}`;
        }
        //Without auth
        return `postgres://${setting.pgdbHost}:${setting.pgdbPort}/${setting.pgDbName}`;
      })(),

      masterDb: `${setting.pgDbName}`,
      options: {},
      host: setting.pgdbHost,
      port: setting.pgdbPort,
      username: setting.pgdbUsername,
      password: setting.pgdbPassword,
    },
  },
  jwtSignature: {
    accessSecret: setting.accessTokenSecret,
    refreshSecret: setting.refreshTokenSecret,
  },
  deviceLimit: setting.deviceLimit,
  emailSettings: {
    user: setting.mailUser,
    password: setting.mailPassword,
    host: setting.mailHost,
    port: setting.mailPort,
    secure: setting.mailSecure,
    unauthorized: setting.mailUnauthorized,
  },
  minio: {
    minioHost:
      process.env.CORE_API_MINIO_HOST ||
      process.env.MINIO_HOST ||
      // "play.min.io",
      "iot.hyperthings.in",
    // "192.168.99.100",

    minioPort:
      process.env.CORE_API_MINIO_PORT ||
      process.env.MINIO_PORT ||
      //  "9443",
      // 9000,
      17206,
    minioUsername:
      process.env.CORE_API_MINIO_ACCESS_KEY ||
      process.env.MINIO_ACCESS_KEY ||
      "xcHwoEOYiOYDksDz",
    // "minioadmin",
    minioPassword:
      process.env.CORE_API_MINIO_ACCESS_KEY ||
      process.env.MINIO_SECRET_KEY ||
      "nAZSIkmTHnxDlyeY",
    // "minioadmin",
  },
};
