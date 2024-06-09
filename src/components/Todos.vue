<script setup lang="ts">
import '@/assets/main.css';
import { onMounted, ref } from 'vue';
import type { Schema } from '../../amplify/data/resource';
import { generateClient } from 'aws-amplify/data';
import { get } from 'aws-amplify/api';

// import { todo } from 'node:test';

const client = generateClient<Schema>();

// create a reactive reference to the array of todos
const todos = ref<Array<Schema['Todo']["type"]>>([]);

function listTodos() {
  client.models.Todo.observeQuery().subscribe({
    next: ({ items, isSynced }) => {
      todos.value = items
     },
  }); 
}


async function getItem() {
  try {
    const restOperation = get({ 
      apiName: 'goldenRestApi',
      path: 'items' 
    });
    const response = await restOperation.response;
    console.log('GET call succeeded: ', response);
  } catch (error) {
    console.log('GET call failed: ', JSON.parse(error.response.body));
  }
}

function createTodo() {
  client.models.Todo.create({
    content: window.prompt("Todo content"),
    createdAt: new Date()
  }).then(() => {
    // After creating a new todo, update the list of todos
    listTodos();
  });
}

function createComment(todoId: string) {
  console.log("COMMENT ID");
  console.log(todoId);
  client.models.Comment.create({
    content: window.prompt("Todo content"),
    createdAt: new Date(),
    todo_parent_id: todoId
  })
}

  
function deleteTodo(id: string) {
  client.models.Todo.delete({ id })
}
    
// fetch todos when the component is mounted
 onMounted(() => {
  listTodos();
  getItem();
});

</script>

<template>
  <main>
    <h1>My todos</h1>
    <button @click="createTodo">+ new</button>
    <ul>
      <li 
        v-for="todo in todos" 
        :key="todo.id"
      >
        {{ todo.id }} - {{ todo.content }}
        <button @click="createComment(todo.id)">+ new comment</button>
        <button @click="deleteTodo(todo.id)">- del</button>
      </li>
    </ul>
    <div>
      🥳 App successfully hosted. Try creating a new todo.
      <br />
      <a href="https://docs.amplify.aws/gen2/start/quickstart/nextjs-pages-router/">
        Review next steps of this tutorial.
      </a>
      
    </div>
  </main>
</template>
