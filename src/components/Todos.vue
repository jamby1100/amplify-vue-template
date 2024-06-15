<script setup lang="ts">
import '@/assets/main.css';
import { onMounted, ref } from 'vue';
import type { Schema } from '../../amplify/data/resource';
import { generateClient } from 'aws-amplify/data';
import { post, get } from 'aws-amplify/api';
import { uploadData } from "aws-amplify/storage";
import { getUrl } from 'aws-amplify/storage';

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


interface CommentContent {
  content: string
}

interface CommentData {
  data: Array<CommentContent>
}
// const todos = ref<Array<Schema['Todo']["type"]>>([]);
// const currentId = ref<String>

// let currentId: string;
let commentData:any = ref({})
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

let photoAttachmentData:any = ref([])
const currentIdForPhotoAttachment = ref("")

async function showPhotoAttachmentsV2(todoId: string) {
  currentIdForPhotoAttachment.value = todoId; 
  const restOperation = get({
      apiName: 'goldenRestApi',
      path: `items/${todoId}`,
  });

  const response = await restOperation.response;
  // photoAttachmentData.value = await response.body.json();
  let photoAttachmentsForTodo:any = await response.body.json();
  console.log("AND THE MASTER RESPONSE IS")
  console.log(photoAttachmentsForTodo.data)

  let imageArr = []
  
  for (var indx in photoAttachmentsForTodo.data) {
    let item = photoAttachmentsForTodo.data[indx]
    console.log("looping")
    console.log(item.imagePath)
    const linkToStorageFile = await getUrl({
      path: item.imagePath.S,
      options: {
        validateObjectExistence: false,  // defaults to false
        expiresIn: 20, // validity of the URL, in seconds. defaults to 900 (15 minutes) and maxes at 3600 (1 hour)
        useAccelerateEndpoint: false // Whether to use accelerate endpoint.
      },
    });
    console.log(linkToStorageFile.url.toString())
    imageArr.push(linkToStorageFile.url.toString())
  }

  photoAttachmentData.value = imageArr
}


function createTodo() {
  client.models.Todo.create({
    content: window.prompt("Todo content"),
    createdAt: new Date().toDateString()
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
    createdAt: new Date().toDateString(),
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
});

async function createAttachmentForTask(postBody: any) {
  try {
    const restOperation = post({
      apiName: 'goldenRestApi',
      path: 'items',
      options: {
        body: postBody
      }
    });

    const response = await restOperation.response;
    console.log('POST call succeeded: ', response);
  } catch (error:any) {
    console.log('POST call failed: ', JSON.parse(error.response.body));
  }
}

// const file = document.getElementById("file");
// const upload = document.getElementById("upload");



// upload.addEventListener("click", () => {
async function uploadFile(todoId: string) {
  // let file: any;
  const fileReader = new FileReader();
  fileReader.readAsArrayBuffer(file.files[0]);
  const imagePath = "picture-submissions/" + file.files[0].name

  fileReader.onload = async (event: any) => {
    console.log("Complete File read successfully!", event.target.result);
    try {
      await uploadData({
          data: event.target.result, 
          path: imagePath,
      })
    } catch (e) {
      console.log("error", e);
    }
  }
  
  let result = await createAttachmentForTask({"imagePath": imagePath, "todoId": todoId})
};



</script>

<template>
  <main>
    <h1>My todos</h1>
    <button @click="createTodo">+ new</button>
    <ul>
      <li 
        v-for="todo in todos" 
        :key="todo.id!"
      >
        {{ todo.id }} - {{ todo.content }}
        <button @click="createComment(todo.id!)">+ new comment</button>
        <button @click="deleteTodo(todo.id!)">- del</button>
        <button @click="showCommentsV2(todo.id!)">comments</button>
        <button @click="showPhotoAttachmentsV2(todo.id!)">photo attachments</button>

        
        <div class="">
          <input
            type="file"
            id="file"
          />
          <button id="upload" @click="uploadFile(todo.id!)">Upload File</button>
      </div>
      </li>
    </ul>

    <h1>Comments for {{ currentId }}</h1>

    <ul v-if="commentData != null">
      <li v-for="commentBody in commentData">
        {{commentBody.content}}
      </li>
    </ul>

    <h1>Photo Attachments for {{ currentIdForPhotoAttachment }}</h1>

    <ul v-if="photoAttachmentData != null">
      <li v-for="photoAttachment in photoAttachmentData">
        <img v-bind:src="photoAttachment" alt="Italian Trulli" height="200">

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
