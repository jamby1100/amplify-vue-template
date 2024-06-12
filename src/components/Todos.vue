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

// interface CommentData {
//   data: Array<Object>
// }
// const todos = ref<Array<Schema['Todo']["type"]>>([]);
// const currentId = ref<String>

// let currentId: string;
let commentData = ref({})
const currentId = ref("")

async function showCommentsV2(todoId: string) {
  console.log("entering showCommentsV2")
  currentId.value = todoId;

  client.models.Comment.listCommentByTodo_parent_id({
    todo_parent_id: todoId
  }).then((d) => {
    console.log("BEFORE DATA IS")
    console.log(commentData)
    console.log("d")
    console.log(d)
    commentData.value = d.data
    console.log("AFTER DATA IS")
    console.log(commentData)
  })
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

async function createComment(todoId: string) {
  console.log("COMMENT ID");
  console.log(todoId);
  await client.models.Comment.create({
    content: window.prompt("Todo content"),
    createdAt: new Date(),
    todo_parent_id: todoId
  })
  await showCommentsV2(todoId);
}

  
async function deleteTodo(id: string) {
  await client.models.Todo.delete({ id })
  listTodos();
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
        <button @click="showCommentsV2(todo.id)">comments</button>
      </li>
    </ul>

    <h1>Comments for {{ currentId }}</h1>

    <ul v-if="commentData != null">
      <li v-for="commentBody in commentData">
        {{commentBody.content}}
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
