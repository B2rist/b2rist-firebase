import * as functions from "firebase-functions";
import {firestore} from "firebase-admin";
import {db} from "../index";
import * as geofire from "geofire-common";
import {Geopoint} from "geofire-common";
import QuerySnapshot = firestore.QuerySnapshot;

interface NearByPointsRequest {
  location: {
    latitude: number,
    longitude: number
},
  radius: number
}

export const getNearbyPoints = functions.https
    .onCall(async (data: NearByPointsRequest) => {
      try {
        const {location: {latitude, longitude}, radius}:
            NearByPointsRequest = data;
        const center: Geopoint = [latitude, longitude];
        // eslint-disable-next-line max-len
        functions.logger.info(`Get nearby points: ${center[0]}-${center[1]}: ${data.radius} km`,
            {structuredData: true});

        const radiusInM: number = radius * 1000;

        const bounds = geofire.geohashQueryBounds(center, radiusInM);
        const promises: Promise<QuerySnapshot>[] = [];
        for (const b of bounds) {
          const q = db.collection("test_point")
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
