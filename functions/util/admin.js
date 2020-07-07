const admin = require(`firebase-admin`);

admin.initializeApp();        //Basic initializeApp
//admin.initializeApp({
//    credential: admin.credential.cert(serviceAccount),
//    databaseURL: "https://socialape-rome-aws.firebaseio.com"
//    //storageBucket: "socialape-rome-aws.appspot.com"
//});

const db = admin.firestore();

module.exports = { admin, db}