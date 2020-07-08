const functions = require(`firebase-functions`);

var serviceAccount = require("../socialape-rome-aws-firebase-adminsdk-lzqxf-e3f8eb4559.json");

const app = require(`express`)();

const FBAuth = require(`./util/fbAuth`);

const { getAllScreams, postOneScream } = require(`./handlers/screams`);
const { signup, login, uploadImage } = require(`./handlers/users`);

// Scream routes
app.get(`/screams`, getAllScreams);
app.post(`/scream`, FBAuth, postOneScream);

// Users route
app.post(`/signup`, signup);
app.post(`/login`, login);
app.post(`/user/image`, FBAuth, uploadImage);

exports.api = functions.https.onRequest(app);