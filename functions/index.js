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

const FBAuth = (req, res, next) => {
    let idToken;
    if(req.headers.authorization && req.headers.authorization.startsWith(`Bearer `)){
        idToken = req.headers.authorization.split(`Bearer `)[1];
    } else {
        console.error(`No token found`)
        return res.status(403).json({ error: `Unauthorized`});
    }

    admin.auth().verifyIdToken(idToken)
        .then(decodedToken => {
            req.user =decodedToken;
            console.log(decodedToken);
            return db.collection(`users`)
                .where(`userId`, `==`, req.user.uid)
                .limit(1)
                .get();
        })
        .then(data => {
            req.user.handle = data.docs[0].data().handle;
            return next();
        })
        .catch(err => {
            console.error(`Error while verifying token `, err);
            return res.status(403).json(err);
        })
}

//Post one scream
app.post(`/scream`, FBAuth, (req, res) => {
    if (req.body.body.trim() === ''){
        return res.status(400).json({ body :`Body must not be empty`});
    }

    const newScream = {
        body: req.body.body,
        userHandle: req.user.handle,
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

const isEmail = (email) => {
    const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(email.match(regEx)) return true;
    else return false;
}

const isEmpty = (string) => {
    if(string.trim() === ``) return true;
    else return false;
}

// Sign up route
app.post(`/signup`, (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle,
    };

    let errors = {};

    if(isEmpty(newUser.email)) {
        errors.email =  `Must not be empty`
    } else if(!isEmail(newUser.email)){
        errors.email = `Must be a valid email address`
    }

    if(isEmpty(newUser.password)) errors.password = `Must not be empty`;
    if(newUser.password !== newUser.confirmPassword) errors.confirmPassword = `Passwords must match`;
    if(isEmpty(newUser.handle)) errors.handle = `Must not be empty`;

    if (Object.keys(errors).length > 0) return res.status(400).json(errors);

    // TODO: validate data
    let token, userId;
    db.doc(`/users/${newUser.handle}`)
        .get()
        .then((doc) => {
            if(doc.exists){
                return res.status(400).json({ handle: `This handle is already taken` });
            } else{
                return firebase
                    .auth()
                    .createUserWithEmailAndPassword(newUser.email, newUser.password)
            }
        })
        .then((data) => {
            userId= data.user.uid;
            return data.user.getIdToken();
        })
        .then((idToken) => {
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
        .catch((err)=> {
            console.error(err);
            if(err.code === `auth/email-already-in-use`){
                return res.status(400).json({ email: `Email is already in use` });
            } else {
                return res.status(500).json({ error: err.code});
            }
        });
});

app.post(`/login`, (req, res) => {
    const user = {
        email: req.body.email,
        password: req.body.password,

    };

    let errors = {};

    if(isEmpty(user.email)) errors.email = `Must not be empty`;
    if(isEmpty(user.password)) errors.password = `Must not be empty`;

    if(Object.keys(errors).length > 0) return res.status(400).json(errors);

    firebase
        .auth()
        .signInWithEmailAndPassword(user.email, user.password)
        .then(data => {
            return data.user.getIdToken();
        })
        .then(token => {
            return res.json({ token });
        })
        .catch(err => {
            console.error(err);
            if(err.code === `auth/wrong-password`){
                return res
                .status(403)
                .json({ general: `Wrong credentials, please try again`})
            } else return res.status(500).json({error: err.code });
        });
});

exports.api = functions.https.onRequest(app);