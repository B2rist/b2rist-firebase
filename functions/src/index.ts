import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

exports.route = require("./api/route");

admin.initializeApp(functions.config().firebase);

export const db = admin.firestore();


