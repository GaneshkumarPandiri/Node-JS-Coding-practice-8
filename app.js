const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();
app.use(express.json());

//API1
const convertDbObjectToResponseObjectAPI1 = (dbObject) => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    priority: dbObject.priority,
    status: dbObject.status,
  };
};

app.get("/todos/", async (request, response) => {
  const { status = "", priority = "", search_q = "" } = request.query;
  if (status !== "") {
    const listOfTodoQuery = `SELECT * FROM todo WHERE status ='${status}';`;
    const listOfTodos = await db.all(listOfTodoQuery);
    const listOfTodosResult = listOfTodos.map((item) =>
      convertDbObjectToResponseObjectAPI1(item)
    );
    response.send(listOfTodosResult);
  } else if (priority !== "") {
    const listOfTodoQuery = `SELECT * FROM todo WHERE priority = '${priority}';`;
    const listOfTodos = await db.all(listOfTodoQuery);
    const listOfTodosResult = listOfTodos.map((item) =>
      convertDbObjectToResponseObjectAPI1(item)
    );
    response.send(listOfTodosResult);
  } else if (search_q !== "") {
    const listOfTodoQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%';`;
    const listOfTodos = await db.all(listOfTodoQuery);
    const listOfTodosResult = listOfTodos.map((item) =>
      convertDbObjectToResponseObjectAPI1(item)
    );
    response.send(listOfTodosResult);
  } else {
    const listOfTodoQuery = `SELECT * FROM todo WHERE status LIKE '%${status}%' AND priority = '${priority}';`;
    const listOfTodos = await db.all(listOfTodoQuery);
    const listOfTodosResult = listOfTodos.map((item) =>
      convertDbObjectToResponseObjectAPI1(item)
    );
    response.send(listOfTodosResult);
  }
});

//API2
const convertDbObjectToResponseObjectAPI2 = (dbObject) => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    priority: dbObject.priority,
    status: dbObject.status,
  };
};
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const todoQuery = `SELECT * FROM todo WHERE id = '${todoId}';`;
  const todoResponse = await db.get(todoQuery);
  response.send(todoResponse);
});

//API3
app.post("/todos/", async (request, response) => {
  const todoDetails = request.body;
  const { id, todo, priority, status } = todoDetails;
  const addTodoQuery = `INSERT INTO todo (id, todo, priority, status)
                                VALUES ('${id}',
                                        '${todo}',
                                        '${priority}',
                                        '${status}');`;
  const addResponse = db.run(addTodoQuery);
  response.send("Todo Successfully Added");
});
//API4
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { status = "", priority = "", todo = "" } = request.body;
  if (status !== "") {
    const statusUpdateQuery = `UPDATE todo 
                                 SET status = '${status}'
                                 WHERE id = '${todoId}';`;
    const dbStatusUpdateResponse = await db.run(statusUpdateQuery);
    response.send("Status Updated");
  } else if (priority !== "") {
    const statusUpdateQuery = `UPDATE todo 
                                 SET priority = '${priority}'
                                 WHERE id = '${todoId}';`;
    const dbStatusUpdateResponse = await db.run(statusUpdateQuery);
    response.send("Priority Updated");
  } else if (todo !== "") {
    const statusUpdateQuery = `UPDATE todo 
                                 SET todo = '${todo}'
                                 WHERE id = '${todoId}';`;
    const dbStatusUpdateResponse = await db.run(statusUpdateQuery);
    response.send("Todo Updated");
  }
});
//API5
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `DELETE FROM todo
                            WHERE id = '${todoId}';`;
  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});
module.exports = app;
