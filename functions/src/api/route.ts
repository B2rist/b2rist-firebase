import * as functions from "firebase-functions";
import {firestore} from "firebase-admin";
import QuerySnapshot = firestore.QuerySnapshot;
import DocumentSnapshot = firestore.DocumentSnapshot;
import DocumentReference = firestore.DocumentReference;
import {db} from "../index";
import {CallableContext} from "firebase-functions/lib/common/providers/https";

export const getAll = functions.https.onCall(async (data) => {
  functions.logger.info(`Get routes: ${data.id}`, {structuredData: true});
  const routes: unknown[] = [];
  const snapshot: QuerySnapshot = await db.collection("route").get();
  snapshot.forEach((doc) => {
    const data = doc.data();
    const element = {
      id: doc.id,
      ...data,
      points: [],
    };
    routes.push(element);
  });
  return routes;
});

export const getById = functions.https.onCall(async ({id}) => {
  functions.logger.info(`Get route by id: ${id}`, {structuredData: true});
  const snapshot: DocumentSnapshot = await db.collection("route")
      .doc(id).get();
  if (!snapshot.exists) {
    throw new functions.https.HttpsError("not-found", "Not found");
  }
  const data = snapshot.data();
  const points: unknown[] = [];
  const pointsRefs: DocumentReference[] = data?.points;
  for (const pointRef of pointsRefs) {
    const pointSnapshot: DocumentSnapshot = await pointRef.get();
    const pointData = pointSnapshot.data();
    points.push({id: pointSnapshot.id, ...pointData});
  }
  return {
    id: snapshot.id,
    ...data,
    points,
  };
});

export const getAllByUser = functions.https.onCall(
    async (_, context: CallableContext) => {
      if (!context.auth) {
        throw new functions.https.HttpsError("failed-precondition",
            "The function must be called while authenticated.");
      }
      const email = context.auth.token?.email;
      functions.logger.info(`Get user routes: ${email}`,
          {structuredData: true});
      const routes: unknown[] = [];
      const snapshot: QuerySnapshot = await db.collection("route")
          .where("user", "==", email)
          .get();
      snapshot.forEach((doc) => {
        const data = doc.data();
        const element = {
          id: doc.id,
          ...data,
          points: [],
        };
        routes.push(element);
      });
      return routes;
    });
