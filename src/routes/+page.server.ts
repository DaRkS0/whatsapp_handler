import { GetDoc, GetDocs, UpdateDoc } from "$lib/firebase/database/client";
import { Timestamp } from "firebase/firestore";
import type { Actions, PageServerLoad } from "./$types";
import Statues from "./statuses_deduplicated.json";

type Status = {
  "kind": string;
  "status": string;
  "recipientId": string;
  "messageId": string;
  "statusTimestampUTC": string;
  "logTimeUTC": string;
  "requestId": string
}
export const load: PageServerLoad = async ({ params, cookies }) => {


  // for (const status of Statues) {
  //   const ms = await GetDoc("Jadeer", status.recipientId)
  //   if (ms.exists()) {
  //     const test = ms.data()[`${status.status}At`];
  //     if (!test) {
  //       await UpdateDoc("Jadeer", status.recipientId, {
  //         [`${status.status}At`]: Timestamp.fromDate(new Date(status.statusTimestampUTC))
  //       });
  //       console.log(`Updated ${status.status}At for ${status.recipientId}`);
  //     }
  //   }
  // }


  //   let notex: string[] = []
  // for (const status of Statues) {
  //   const ms = await GetDoc("Jadeer", status.recipientId)
  //   if (!ms.exists() || notex.includes(status.recipientId)) {

  //     if (!notex.includes(status.recipientId))
  //       notex.push(status.recipientId)

  //     await UpdateDoc("Jadeer", status.recipientId, {
  //       [`${status.status}At`]: Timestamp.fromDate(new Date(status.statusTimestampUTC))
  //     });

  //     console.log(`Updated ${status.status}At for ${status.recipientId}`);
  //   }
  // }

  const userssss = await GetDocs("Jadeer");
  const users = userssss.docs.map((u) => {
    const { name, confirmedAt, deliveredAt, readAt, lastUpdated, ScanTime, failed,lastErrorTitle } = u.data();
    //  console.log({confirmedAt})
    return {
      name, phone: u.id, confirmedAt: confirmedAt ? confirmedAt.toDate().toLocaleString
        () : lastUpdated ? lastUpdated.toDate().toLocaleString() : "",
      deliveredAt: deliveredAt ? deliveredAt.toDate().toLocaleString() : "",
      readAt: readAt ? readAt.toDate().toLocaleString() : "",
      ScanTime: ScanTime ? ScanTime.toDate().toLocaleString() : "",
      failed: failed ? failed ? "Yes" : "NO" : "",
      lastErrorTitle: lastErrorTitle ? lastErrorTitle : ""
    };
  });
  return {
    users
  }
};
