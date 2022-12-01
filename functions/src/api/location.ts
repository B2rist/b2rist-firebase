import * as functions from "firebase-functions";
import {firestore} from "firebase-admin";
import {db} from "../index";
import * as geofire from "geofire-common";
import DocumentSnapshot = firestore.DocumentSnapshot;

export const getGeoHashByPointId= functions.https.onCall(async ({id}) => {
  functions.logger.info(`Calculate geo hash by point id: ${id}`,
      {structuredData: true});
  const snapshot: DocumentSnapshot = await db.collection("test_point")
      .doc(id).get();
  if (!snapshot.exists) {
    throw new functions.https.HttpsError("not-found", "Not found");
  }
  const data = snapshot.data();
  return geofire.geohashForLocation(
      [data?.location._latitude, data?.location._longitude]);
});
