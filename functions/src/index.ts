import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {firestore} from "firebase-admin";
import QuerySnapshot = firestore.QuerySnapshot;

admin.initializeApp(functions.config().firebase);
const db = admin.firestore();

export const getRoutes = functions.https.onCall((data, context) => {
  const email = context.auth?.token?.email;
  functions.logger.info(`Get routes: ${data.id} by email:${email}`,
      {structuredData: true});
  return new Promise((resolve, reject) => {
    const routes: unknown[] = [];
    db.collection("test_route").get()
        .then((snapshot: QuerySnapshot) => {
          snapshot.forEach((doc) => {
            const data = doc.data();
            const element = {
              id: doc.id,
              ...data,
              points: [],
              startPoint: data.startPoint.id,
            };
            routes.push(element);
          });
          resolve(routes);
        }).catch((error) => reject(new Error(error)));
  });
});
