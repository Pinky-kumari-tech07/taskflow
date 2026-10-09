
jest.mock("../models/Task", () => ({
  find: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
}));

const request = require("supertest");
const app = require("../app");
const Task = require("../models/Task");

describe("TaskFlow API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 1. Health check
  test("GET /api/health returns HTTP 200", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe(
      "TaskFlow server is healthy"
    );
  });

  // 2. Unknown route
  test("unknown route returns HTTP 404", async () => {
    const response = await request(app).get(
      "/api/unknown-route"
    );

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(
      "Route not found: GET /api/unknown-route"
    );
  });

  // 3. Fetch all tasks
  test("GET /api/tasks returns an empty task list", async () => {
    Task.find.mockReturnValue({
      sort: jest.fn().mockResolvedValue([]),
    });

    const response = await request(app).get("/api/tasks");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      count: 0,
      data: [],
    });
  });

  // 4. Reject an invalid task ID
  test("GET /api/tasks/:id rejects an invalid task ID", async () => {
    const response = await request(app).get(
      "/api/tasks/invalid-id"
    );

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid task ID");
    expect(Task.findById).not.toHaveBeenCalled();
  });

  // 5. Task not found
  test("GET /api/tasks/:id returns 404 when the task does not exist", async () => {
    Task.findById.mockResolvedValue(null);

    const response = await request(app).get(
      "/api/tasks/000000000000000000000000"
    );

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Task not found");
  });

  // 6. Reject an empty title
  test("POST /api/tasks rejects an empty title", async () => {
    const response = await request(app)
      .post("/api/tasks")
      .send({ title: "   " });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "Task title is required"
    );
    expect(Task.create).not.toHaveBeenCalled();
  });

  // 7. Create a task
  test("POST /api/tasks creates a task", async () => {
    const createdTask = {
      _id: "507f1f77bcf86cd799439011",
      title: "Learn Jest",
      description: "Write backend API tests",
      status: "Pending",
    };

    Task.create.mockResolvedValue(createdTask);

    const response = await request(app)
      .post("/api/tasks")
      .send({
        title: "Learn Jest",
        description: "Write backend API tests",
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.title).toBe("Learn Jest");

    expect(Task.create).toHaveBeenCalledWith({
      title: "Learn Jest",
      description: "Write backend API tests",
      status: undefined,
      dueDate: null,
    });
  });

  // 8. Update a task
  test("PUT /api/tasks/:id updates a task", async () => {
    const updatedTask = {
      _id: "507f1f77bcf86cd799439011",
      title: "Learn Jest and Supertest",
      status: "In Progress",
    };

    Task.findByIdAndUpdate.mockResolvedValue(updatedTask);

    const response = await request(app)
      .put("/api/tasks/507f1f77bcf86cd799439011")
      .send({
        title: "Learn Jest and Supertest",
        status: "In Progress",
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.title).toBe(
      "Learn Jest and Supertest"
    );

    expect(Task.findByIdAndUpdate).toHaveBeenCalledWith(
      "507f1f77bcf86cd799439011",
      {
        title: "Learn Jest and Supertest",
        status: "In Progress",
      },
      { new: true, runValidators: true }
    );
  });

  // 9. Delete a task
  test("DELETE /api/tasks/:id deletes a task", async () => {
    Task.findByIdAndDelete.mockResolvedValue({
      _id: "507f1f77bcf86cd799439011",
      title: "Old task",
    });

    const response = await request(app).delete(
      "/api/tasks/507f1f77bcf86cd799439011"
    );

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe(
      "Task deleted successfully"
    );
  });

  // 10. Safe error response when fetching tasks fails
  test("GET /api/tasks returns a safe HTTP 500 when the database fails", async () => {
    Task.find.mockReturnValue({
      sort: jest.fn().mockRejectedValue(
        new Error("Sensitive database connection details")
      ),
    });

    const response = await request(app).get("/api/tasks");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      success: false,
      message: "An unexpected error occurred. Please try again.",
    });

    expect(JSON.stringify(response.body)).not.toContain(
      "Sensitive database connection details"
    );
  });

  // 11. Safe error response when deleting a task fails
  test("DELETE /api/tasks/:id returns a safe HTTP 500 when the database fails", async () => {
    Task.findByIdAndDelete.mockRejectedValue(
      new Error("Sensitive database connection details")
    );

    const response = await request(app).delete(
      "/api/tasks/507f1f77bcf86cd799439011"
    );

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      success: false,
      message: "An unexpected error occurred. Please try again.",
    });

    expect(JSON.stringify(response.body)).not.toContain(
      "Sensitive database connection details"
    );
  });

  // 12. Safe error response when creating a task fails
  test("POST /api/tasks returns a safe HTTP 500 when the database fails", async () => {
    Task.create.mockRejectedValue(
      new Error("Sensitive database connection details")
    );

    const response = await request(app)
      .post("/api/tasks")
      .send({ title: "Test task" });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      success: false,
      message: "An unexpected error occurred. Please try again.",
    });

    expect(JSON.stringify(response.body)).not.toContain(
      "Sensitive database connection details"
    );
  });

  // 13. Safe error response when updating a task fails
  test("PUT /api/tasks/:id returns a safe HTTP 500 when the database fails", async () => {
    Task.findByIdAndUpdate.mockRejectedValue(
      new Error("Sensitive database connection details")
    );

    const response = await request(app)
      .put("/api/tasks/507f1f77bcf86cd799439011")
      .send({ title: "Updated task" });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      success: false,
      message: "An unexpected error occurred. Please try again.",
    });

    expect(JSON.stringify(response.body)).not.toContain(
      "Sensitive database connection details"
    );
  });
});