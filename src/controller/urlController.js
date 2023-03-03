const urlModel = require("../model/urlModel");
const validUrl = require("valid-url");
const shortid = require("shortid");
const redis = require("redis");
const { promisify } = require("util");

require("dotenv").config();

//Connect to redis
const redisClient = redis.createClient(
  process.env.REDIS_PORT, //port
  process.env.REDIS_HOST, //host
  { no_ready_check: true }
);
redisClient.auth(process.env.REDIS_PASSWORD, function (err) {
  //pw
  if (err) throw err;
});

redisClient.on("connect", async function () {
  console.log("Connected to Redis..");
});

//1. connect to the server
//2. use the commands :

//Connection setup for redis

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);

const isValid = function (value) {
  if (typeof value === "undefined" || value === null) return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  if (typeof value === "number") return false;
  return true;
};

module.exports.createUrl = async function (req, res) {
  try {
    let data = req.body;
    if (!Object.keys(data).length)
      return res.status(400).send({
        status: false,
        message: "Bad Request, Please enter the details in the request body.",
      });
    const longUrl = data.longUrl;
    if (!isValid(longUrl))
      return res
        .status(400)
        .send({ status: false, message: "Long Url is required" });

    if (!validUrl.isWebUri(longUrl)) {
      return res
        .status(400)
        .send({ status: false, message: "Please enter valid LongUrl" });
    }

    let uniqueUrl = await urlModel
      .findOne({ longUrl })
      .select({ _id: 0, __v: 0, createdAt: 0, updatedAt: 0 });
    if (uniqueUrl) {
      return res.status(200).send({
        status: true,
        message: "This is already created",
        data: uniqueUrl,
      });
    }

    const urlCode = shortid.generate(longUrl).toLowerCase();
    const shortUrl = `${req.protocol}://${req.headers.host}/` + urlCode;

    data.urlCode = urlCode;
    data.shortUrl = shortUrl;

    let Data = {
      longUrl: longUrl,
      shortUrl: shortUrl,
      urlCode: urlCode,
    };

    let urlCreated = await urlModel.create(Data);
    return res
      .status(201)
      .send({ status: true, message: "Success", data: Data });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

//********************************getApi ***********************************************************************//

module.exports.redirectUrl = async function (req, res) {
  try {
    let urlCode = req.params.urlCode;
    let urlcache = await GET_ASYNC(`${urlCode}`);
    if (urlcache) {
      return res.status(302).redirect(urlcache);
    }
    const findUrlCode = await urlModel
      .findOne({ urlCode })
      .select({ createdAt: 0, updatedAt: 0, __v: 0, _id: 0 });
    if (!findUrlCode)
      return res
        .status(404)
        .send({ status: false, message: "url code not Found" });
    await SET_ASYNC(`${urlCode}`, findUrlCode.longUrl);
    return res.status(302).redirect(findUrlCode.longUrl);
  } catch (error) {
    return res.status(500).send({ status: false, error: error.message });
  }
};
