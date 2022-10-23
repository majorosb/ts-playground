<template>
    <q-page class="row items-center justify-evenly">
        <pre>{{ testResult }}</pre>
        <button @click="() => test()">Fetch</button>
        <example-component title="Example component" active :todos="todos" :meta="meta"></example-component>
    </q-page>
</template>

<script setup lang="ts">
import { Todo, Meta } from 'components/models';
import ExampleComponent from 'components/ExampleComponent.vue';
import { ref } from 'vue';
import { useApi } from 'src/stores/api-instance';

const api = useApi();

const testResult = ref();
async function test() {
    testResult.value = void 0;
    const req = api.libraryController.getLibraryView({ location: 'documents', });
    const res = await req;
    testResult.value = res;
};

const todos = ref<Todo[]>([
    {
        id: 1,
        content: 'ct1'
    },
    {
        id: 2,
        content: 'ct2'
    },
    {
        id: 3,
        content: 'ct3'
    },
    {
        id: 4,
        content: 'ct4'
    },
    {
        id: 5,
        content: 'ct5'
    }
]);
const meta = ref<Meta>({
    totalCount: 1200
});
</script>
