import { GetDocs } from "$lib/firebase/database/client";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, cookies }) => {
 const userssss = await GetDocs("Jadeer");
    const users = userssss.docs.map((u) => {
      const { name, confirmedAt } = u.data();
    //  console.log({confirmedAt})
      return { name,phone:u.id, confirmedAt:confirmedAt?  confirmedAt.toDate().toLocaleDateString():"" };
    });
    return {
        users
    }
};
