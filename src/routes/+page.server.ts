import { GetDoc, GetDocs, UpdateDoc } from "$lib/firebase/database/client";
import { Timestamp } from "firebase/firestore";
import type { Actions, PageServerLoad } from "./$types";
import Statues from "./statuses_deduplicated.json";
import Users from "$lib/All_Users.json";
import NewUsers from "$lib/NewUsers.json";
type Status = {
  "kind": string;
  "status": string;
  "recipientId": string;
  "messageId": string;
  "statusTimestampUTC": string;
  "logTimeUTC": string;
  "requestId": string
}

const phoneNumbers = [
  "201000029789",
  "201000120398",
  "201000806958",
  "201000902630",
  "201001126058",
  "201001782069",
  "201002143403",
  "201002241210",
  "201002770419",
  "201003072942",
  "201004999545",
  "201005497527",
  "201005621054",
  "201005668962",
  "201006086953",
  "201006181041",
  "201006363063",
  "201006379390",
  "201006694505",
  "201007920254",
  "201008068125",
  "201008870929",
  "201009230973",
  "201009500495",
  "201010720638",
  "201013319139",
  "201014093353",
  "201015143936",
  "201015581018",
  "201016399164",
  "201018627647",
  "201019270172",
  "201021042698",
  "201021287515",
  "201021840400",
  "201022030088",
  "201022075414",
  "201022335598",
  "201022460004",
  "201022707095",
  "201022762569",
  "201023114847",
  "201025391133",
  "201027939291",
  "201032818227",
  "201034480009",
  "201055612678",
  "201060146898",
  "201060191166",
  "201060421742",
  "201061359917",
  "201063367781",
  "201064014783",
  "201065434507",
  "201080616241",
  "201093624001",
  "201095270960",
  "201095450650",
  "201096001250",
  "201096681212",
  "201097439645",
  "201098569999",
  "201098592659",
  "201098774190",
  "201099651930",
  "201099916334",
  "201100519724",
  "201108110274",
  "201110273343",
  "201111402422",
  "201112002685",
  "201112149995",
  "201113936587",
  "201115056225",
  "201115206841",
  "201116789254",
  "201123155515",
  "201123336663",
  "201127347337",
  "201128219091",
  "201128827804",
  "201140213213",
  "201144178383",
  "201145646505",
  "201150971893",
  "201153888827",
  "201159238742",
  "201200011420",
  "201200233000",
  "201210336672",
  "201210381219",
  "201211227894",
  "201212992186",
  "201220179736",
  "201222399152",
  "201222650814",
  "201223000982",
  "201223350322",
  "201224519823",
  "201224792454",
  "201225795986",
  "201226063747",
  "201226928907",
  "201227378611",
  "201228404078",
  "201229101538",
  "201271186332",
  "201271549047",
  "201273998787",
  "201274365307",
  "201275424728",
  "201275947070",
  "201276042771",
  "201280900754",
  "201281390764",
  "201284778484",
  "201284964292",
  "201286900029",
  "201287410748",
  "201500547272",
  "201507495566",
  "201550015037",
  "201550199903",
  "201554799098",
  "971523806669"
];

const toUTC3String = (timestamp: any): string => {
  if (!timestamp) return "";
  return timestamp.toDate().toLocaleString("en-GB", {
    timeZone: "Etc/GMT-3",
    hour12: true,
  });
}

export const load: PageServerLoad = async ({ params, cookies }) => {


  // for (const status of NewUsers) {
  //   const ms = await GetDoc("Jadeer", status.phone)
  //   if (!ms.exists()) {
  //     console.log(status)
  //   }
  // }
  // console.log({ length: NewUsers.length })

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
    const { name, confirmedAt, deliveredAt, readAt, lastUpdated, ScanTime, failed, lastErrorTitle, time, ClientName } = u.data();
    const sss = NewUsers.find((nu) => nu.phone === u.id)
    //  console.log({confirmedAt})
    // return {
    //   name, phone: u.id, confirmedAt: confirmedAt ? confirmedAt.toDate().toLocaleString
    //     () : lastUpdated ? lastUpdated.toDate().toLocaleString() : "",
    //   deliveredAt: deliveredAt ? deliveredAt.toDate().toLocaleString() : "",
    //   readAt: readAt ? readAt.toDate().toLocaleString() : "",
    //   ScanTime: ScanTime ? ScanTime.toDate().toLocaleString() : "",
    //   failed: failed ? failed ? "Yes" : "NO" : "",
    //   lastErrorTitle: lastErrorTitle ? lastErrorTitle : "",
    //   NewPatch: sss !== undefined ? "Yes" : "No"
    // };


    const user = Users.merged_json.find((r) => r.phone === u.id);
    const newUser = NewUsers.find((r) => r.phone === u.id);

    return {
      name,
      phone: u.id,
      confirmedAt: confirmedAt ? toUTC3String(confirmedAt) : lastUpdated ? toUTC3String(lastUpdated) : "",
      deliveredAt: toUTC3String(deliveredAt),
      readAt: toUTC3String(readAt),
      ClientName: ClientName ? ClientName : user?.name || newUser?.name,
      SlotTime: time,
      ScanTime: toUTC3String(ScanTime),
      failed: failed ? "Yes" : "NO",
      lastErrorTitle: lastErrorTitle ? lastErrorTitle : "",
      NewPatch: sss !== undefined ? "Yes" : "No",
    };
  });


  return {
    users
  }
};
