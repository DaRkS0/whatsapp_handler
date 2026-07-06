<script lang="ts">
  import CsvHandler from "$lib/CSVHandler.svelte";
  let { data } = $props();
</script>

<div class="h-full w-full flex flex-col items-center justify-center">
  <p class="font-bold text-xl mb-4">Total Scans: {data.users.filter((u) => u.ScanTime.length > 0).length}</p>
  <CsvHandler data={data.users.sort((a, b) => b.ScanTime.length - a.ScanTime.length)} filename="Users">
    <button
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
    >
      Get All Users
    </button>
  </CsvHandler>
</div>
