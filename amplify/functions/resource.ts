import { defineFunction, secret } from '@aws-amplify/backend';
// import { StringParameter } from '@aws-amplify/ssm'

export const addAttachmentToTodoTask = defineFunction({
  // optionally specify a name for the Function (defaults to directory name)
  name: 'add-attachment-to-todo-task',
  // optionally specify a path to your handler (defaults to "./handler.ts")
  entry: './handlers/attachments/create_attachment_handler.ts',
  environment: {
    NAME: "World",
    SOME_VAR: "nice",
    SOMETHING: "hey",
    DYNAMODB_TABLE_NAME_MASTER: ""
  },
  timeoutSeconds: 900, // 1 minute timeout
  memoryMB: 256 // allocate 256 MB of memory to the function.
});

export const showAttachmentsForTodoTask = defineFunction({
  // optionally specify a name for the Function (defaults to directory name)
  name: 'show-attachments-of-todo-task',
  // optionally specify a path to your handler (defaults to "./handler.ts")
  entry: './handlers/attachments/show_attachments_for_todo_task.ts',
  environment: {
    NAME: "World",
    SOME_VAR: "nice",
    SOMETHING: "hey",
    DYNAMODB_TABLE_NAME_MASTER: ""
  },
  timeoutSeconds: 900, // 1 minute timeout
  memoryMB: 256 // allocate 256 MB of memory to the function.
});