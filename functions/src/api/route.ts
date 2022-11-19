import * as functions from "firebase-functions";
import {firestore} from "firebase-admin";
import QuerySnapshot = firestore.QuerySnapshot;
import DocumentSnapshot = firestore.DocumentSnapshot;
import DocumentReference = firestore.DocumentReference;
import {db} from "../index";

export const getRoutes = functions.https.onCall(async (data) => {
  functions.logger.info(`Get routes: ${data.id}`, {structuredData: true});
  const routes: unknown[] = [];
  const snapshot: QuerySnapshot = await db.collection("test_route").get();
  snapshot.forEach(doc => {
    const data = doc.data();
    const element = {
      id: doc.id,
      ...data,
      points: [],
      startPoint: data.startPoint.id,
    };
    routes.push(element);
  });
  return routes;
});

export const getRouteById = functions.https.onCall(async ({id}) => {
  functions.logger.info(`Get route by id: ${id}`, {structuredData: true});
  const snapshot: DocumentSnapshot = await db.collection("test_route")
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
    startPoint: data?.startPoint.id,
  };
});
