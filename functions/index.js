const functions = require(`firebase-functions`);
const admin = require(`firebase-admin`);


var serviceAccount = require("../socialape-rome-aws-firebase-adminsdk-lzqxf-e3f8eb4559.json");

const app = require(`express`)();

//admin.initializeApp();        //Basic initializeApp
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://socialape-rome-aws.firebaseio.com"
    //storageBucket: "socialape-rome-aws.appspot.com"
});

const config = {
    apiKey: "AIzaSyBfEcbgHJHHNRxDu9-zuW2SWfmzD34IpBs",
    authDomain: "socialape-rome-aws.firebaseapp.com",
    databaseURL: "https://socialape-rome-aws.firebaseio.com",
    projectId: "socialape-rome-aws",
    storageBucket: "socialape-rome-aws.appspot.com",
    messagingSenderId: "23585518041",
    appId: "1:23585518041:web:b53fe9f2b24ac14229e9c8",
    measurementId: "G-EKC4MCNBL4"
};

const firebase = require(`firebase`);
firebase.initializeApp(config);

const db = admin.firestore();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
//Hello World Basic//
//exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello World!");
//});

//Basic Function on exporting
//exports.getScreams = functions.https.onRequest((req, res) => {
//     admin
//        .firestore()
//        .collection(`screams`)
//        .get()
//        .then((data) => {
//         let screams = [];
//         data.forEach((doc) => {
//             screams.push(doc.data());
//         });
//         return res.json(screams);
//     })
//     .catch((err) => console.error(err));
//});

//exports.createScream = functions.https.onRequest((req, res) => {
//    if(req.method !== `POST`){
//        return res.status(400).json({ error: `Method not allowed`});
//    }
//    const newScream = {
//        body: req.body.body,
//        userHandle: req.body.userHandle,
//        createdAt: admin.firestore.Timestamp.fromDate(new Date())
//    };
//
//   admin.firestore()
//        .collection(`screams`)
//        .add(newScream)
//        .then((doc) => {
//            res.json({ message: `document ${doc.id} created successfully`});
//        })
//        .catch(err => {
//            res.status(500).json({ error: `something went wrong`});
//            console.error(err);
//        });
//});


app.get(`/screams`, (req,res) => {
    db
        .collection(`screams`)
        .orderBy(`createdAt`, `desc`)
        .get()
        .then((data) => {
         let screams = [];
         data.forEach((doc) => {
             screams.push({
                 screamId: doc.id,
                 body: doc.data().body,
                 userHandle: doc.data().userHandle,
                 createdAt: doc.data().createdAt,
                 commentCount: doc.data().commentCount,
                 likeCount: doc.data().likeCount
             });
         });
         return res.json(screams);
     })
     .catch((err) => console.error(err));
})

app.post(`/scream`, (req, res) => {
    const newScream = {
        body: req.body.body,
        userHandle: req.body.userHandle,
        createdAt: new Date().toISOString()
    };

    db
        .collection(`screams`)
        .add(newScream)
        .then((doc) => {
            res.json({ message: `document ${doc.id} created successfully`});
        })
        .catch(err => {
            res.status(500).json({ error: `something went wrong`});
            console.error(err);
        });
});

// Sign up route
app.post(`/signup`, (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle,
    };

    // TODO: validate data
    let token, userId;
    db.doc(`/users/${newUser.handle}`).get()
        .then(doc => {
            if(doc.exists){
                return res.status(400).json({ handle: `this handle is already taken` });
            } else{
                return firebase
                    .auth()
                    .createUserWithEmailAndPassword(newUser.email, newUser.password)
            }
        })
        .then(data => {
            userId= data.user.uid;
            return data.user.getIdToken();
        })
        .then(idToken => {
            token = idToken;
            const userCredentials = {
                handle: newUser.handle,
                email: newUser.email,
                createdAr: new Date().toISOString(),
                userId 
            };
            return db.doc(`/users/${newUser.handle}`).set(userCredentials);
        })
        .then(() => {
            return res.status(201).json({ token }); 
        })
        .catch(err=> {
            console.error(err);
            if(err.code === `auth/email-already-in-use`){
                return res.status(400).json({ email: `Email is already in use` });
            } else {
                return res.status(500).json({ error: err.code});
            }
        });
});

exports.api = functions.https.onRequest(app);