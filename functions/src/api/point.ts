import * as functions from "firebase-functions";
import {firestore} from "firebase-admin";
import {db} from "../index";
import * as geofire from "geofire-common";
import {Geopoint} from "geofire-common";
import QuerySnapshot = firestore.QuerySnapshot;
import {CallableContext} from "firebase-functions/lib/common/providers/https";
import DocumentSnapshot = firestore.DocumentSnapshot;

interface AllNearByRequest {
  location: {
    latitude: number,
    longitude: number
},
  radius: number,
  languages: string[] | string
}

export const getAllNearby = functions.https
    .onCall(async (data: AllNearByRequest) => {
      try {
        const {location: {latitude, longitude}, radius, languages}:
            AllNearByRequest = data;
        const center: Geopoint = [latitude, longitude];
        const lang = [languages].flat();
        // eslint-disable-next-line max-len
        functions.logger.info(`Get nearby points: ${center[0]},${center[1]} radius: ${data.radius} km languages: ${lang.join(",")}`);

        const radiusInM: number = radius * 1000;

        const bounds = geofire.geohashQueryBounds(center, radiusInM);
        const promises: Promise<QuerySnapshot>[] = [];
        for (const b of bounds) {
          const q = db.collection("test_point")
              .where("language", "in", lang)
              .orderBy("geohash")
              .startAt(b[0])
              .endAt(b[1]);

          promises.push(q.get());
        }

        const snapshots: QuerySnapshot[] = await Promise.all(promises);
        const matchingPoints = [];

        for (const snap of snapshots) {
          for (const doc of snap.docs) {
            const {_latitude: lat, _longitude: lng} = doc.get("location");

            const distance = geofire.distanceBetween([lat, lng], center);
            if (distance <= radius) {
              matchingPoints.push(doc);
            }
          }
        }
        return matchingPoints.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
          };
        });
      } catch (error) {
        if (error instanceof Error) {
          functions.logger.error(error.message);
          throw new functions.https.HttpsError(
              "invalid-argument", error.message
          );
        }
        functions.logger.error(error);
        throw new functions.https
            .HttpsError("unknown", "Internal server error");
      }
    });

export const getById = functions.https.onCall(async ({id}) => {
  functions.logger.info(`Get point by id: ${id}`, {structuredData: true});
  const snapshot: DocumentSnapshot = await db.collection("test_point")
      .doc(id).get();
  if (!snapshot.exists) {
    throw new functions.https.HttpsError("not-found", "Not found");
  }
  const data = snapshot.data();
  return {
    id: snapshot.id,
    ...data,
  };
});

export const getAllByUser = functions.https.onCall(
    async (_, context: CallableContext) => {
      if (!context.auth) {
        throw new functions.https.HttpsError("failed-precondition",
            "The function must be called while authenticated.");
      }
      const email = context.auth.token?.email;
      functions.logger.info(`Get user points: ${email}`,
          {structuredData: true});
      const points: unknown[] = [];
      const snapshot: QuerySnapshot = await db.collection("test_point")
          .where("user", "==", email).get();
      snapshot.forEach((doc) => {
        const data = doc.data();
        const element = {
          id: doc.id,
          ...data,
        };
        points.push(element);
      });
      return points;
    });
