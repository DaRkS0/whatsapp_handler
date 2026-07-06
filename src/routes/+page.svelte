<script lang="ts">
  import CsvHandler from "$lib/CSVHandler.svelte";
  let { data } = $props();

  function getDay1Scans(users: typeof data.users) {
    const day1Scans = users
      .filter(
        (user) =>
          user.ScanTime.length > 0 && !user.ClientName.toLowerCase().includes("test"),
      )
      .toSorted((a, b) => a.SlotTime.localeCompare(b.SlotTime))
      .map((user) => {
        const { ClientName, SlotTime, ScanTime, phone } = user;
        return { ClientName, phone, SlotTime, ScanTime };
      });
    console.log(day1Scans);
    return day1Scans;
  }

  function parseUKDateTime(dateStr: string): Date | null {
  // Matches "D/M/YYYY, h:mm:ss AM/PM" or "D/M/YYYY h:mm:ss AM/PM"
  const match = dateStr.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4}),?\s+(\d{1,2}):(\d{2}):(\d{2})\s*(AM|PM|am|pm)$/
  );
  if (!match) return null;

  const [, dayStr, monthStr, yearStr, hourStr, minStr, secStr, ampm] = match;

  let day = parseInt(dayStr, 10);
  let month = parseInt(monthStr, 10) - 1; // JS months are 0-indexed
  let year = parseInt(yearStr, 10);
  let hour = parseInt(hourStr, 10);
  const min = parseInt(minStr, 10);
  const sec = parseInt(secStr, 10);

  if (ampm.toUpperCase() === "PM" && hour !== 12) hour += 12;
  if (ampm.toUpperCase() === "AM" && hour === 12) hour = 0;

  return new Date(year, month, day, hour, min, sec);
}

function isJuly7(dateStr: string): boolean {
  const date = parseUKDateTime(dateStr);
  if (!date) return false;
  return date.getMonth() === 6 && date.getDate() === 7; // month 6 = July (0-indexed)
}

  function getDay2Scans(users: typeof data.users) {
    const day1Scans = users
      .filter(
        (user) =>
          user.ScanTime.length > 0 && !user.ClientName.toLowerCase().includes("test")&&user.NewPatch==="Yes"&&isJuly7(user.ScanTime),
      )
      .toSorted((a, b) => a.SlotTime.localeCompare(b.SlotTime))
      .map((user) => {
        const { ClientName, SlotTime, ScanTime, phone } = user;
        return { ClientName, phone, SlotTime, ScanTime };
      });
    console.log(day1Scans);
    return day1Scans;
  }
</script>

<div class="h-full w-full flex flex-col items-center justify-center gap-6">
  <p class="font-bold text-xl mb-4">
    Total Scans: {getDay2Scans(data.users).length}
  </p>
  <CsvHandler
    data={data.users.sort((a, b) => b.ScanTime.length - a.ScanTime.length)}
    filename="Users"
  >
    <button
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
    >
      Get All Users
    </button>
  </CsvHandler>

  <CsvHandler data={getDay1Scans(data.users)} filename="Day1Scans">
    <button
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
    >
      Get Day 1 Scans
    </button>
    
  </CsvHandler>


  <CsvHandler data={getDay2Scans(data.users)} filename="Day2Scans">
    <button
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
    >
      Get Day 2 Scans
    </button>
    
  </CsvHandler>
</div>
