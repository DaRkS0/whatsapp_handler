<script lang="ts">
  import CsvHandler from "$lib/CSVHandler.svelte";
  let { data } = $props();
</script>

<div class="h-full w-full flex fle-x-col items-center justify-center">
  <CsvHandler data={data.users} filename="Users">
    <button
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
    >
      Get All Users
    </button>
  </CsvHandler>
</div>
