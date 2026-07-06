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

  function getDay2Scans(users: typeof data.users) {
    const day1Scans = users
      .filter(
        (user) =>
          user.ScanTime.length > 0 && !user.ClientName.toLowerCase().includes("test")&&user.NewPatch==="Yes",
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
