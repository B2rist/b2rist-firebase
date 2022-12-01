import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

exports.route = require("./api/route");
exports.point = require("./api/point");
exports.location = require("./api/location");

admin.initializeApp(functions.config().firebase);

export const db = admin.firestore();
