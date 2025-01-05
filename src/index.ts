import cors from "cors";
import express, { Request, Response } from "express";
import mongoose from "mongoose";
import QueryBuilder from "./builder/QueryBuilder";

const app = express();

// Connect to MongoDB
mongoose.connect(
	"mongodb+srv://task-master:rjr5Vv0ChZQi3W4j@cluster0.messj.mongodb.net/tasksdb"
);

app.get("/", (req: Request, res: Response) => {
	res.send("Welcome to the Task Manager API");
});

// Task Schema
const taskSchema = new mongoose.Schema({
	title: { type: String, required: true },
	description: { type: String },
	priority: { type: String, enum: ["low", "medium", "high"], required: true },
	dueDate: { type: Date },
	isCompleted: { type: Boolean, default: false },
});

const Task = mongoose.model("Task", taskSchema);

app.use(express.json());
app.use(cors({ origin: "http://localhost:5173" }));

// Get all tasks
app.get("/api/tasks", async (req: Request, res: Response) => {
	try {
		const queryBuilder = new QueryBuilder<typeof Task>(Task.find(), req.query);

		// Add query builder methods to the query
		queryBuilder
			.search(["title"]) // You can add more searchable fields
			.filter()
			.sort()
			.paginate()
			.fields();

		// Execute the query
		const tasks = await queryBuilder.modelQuery;

		// Count total documents and calculate pagination info
		const pagination = await queryBuilder.countTotal();

		res.json({
			tasks,
			pagination,
		});
	} catch (error) {
		res.status(500).json({ message: "Error retrieving tasks", error });
	}
});

// Create new task
app.post("/api/tasks", async (req: Request, res: Response) => {
	const task = new Task(req.body);
	const savedTask = await task.save();
	res.status(201).json(savedTask);
});

// Update task by ID
app.patch("/api/tasks/:id", async (req: Request, res: Response) => {
	const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
	});
	res.json(updatedTask);
});

// Delete task by ID
app.delete("/api/tasks/:id", async (req: Request, res: Response) => {
	await Task.findByIdAndDelete(req.params.id);
	res.json({ message: "Task deleted" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
