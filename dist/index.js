"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const QueryBuilder_1 = __importDefault(require("./builder/QueryBuilder"));
const app = (0, express_1.default)();
// Connect to MongoDB
mongoose_1.default.connect("mongodb+srv://task-master:rjr5Vv0ChZQi3W4j@cluster0.messj.mongodb.net/tasksdb");
app.get("/", (req, res) => {
    res.send("Welcome to the Task Manager API");
});
// Task Schema
const taskSchema = new mongoose_1.default.Schema({
    title: { type: String, required: true },
    description: { type: String },
    priority: { type: String, enum: ["low", "medium", "high"], required: true },
    dueDate: { type: Date },
    isCompleted: { type: Boolean, default: false },
});
const Task = mongoose_1.default.model("Task", taskSchema);
app.use(express_1.default.json());
app.use((0, cors_1.default)({ origin: "http://localhost:5173" }));
// Get all tasks
app.get("/api/tasks", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const queryBuilder = new QueryBuilder_1.default(Task.find(), req.query);
        // Add query builder methods to the query
        queryBuilder
            .search(["title"]) // You can add more searchable fields
            .filter()
            .sort()
            .paginate()
            .fields();
        // Execute the query
        const tasks = yield queryBuilder.modelQuery;
        // Count total documents and calculate pagination info
        const pagination = yield queryBuilder.countTotal();
        res.json({
            tasks,
            pagination,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Error retrieving tasks", error });
    }
}));
// Create new task
app.post("/api/tasks", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const task = new Task(req.body);
    const savedTask = yield task.save();
    res.status(201).json(savedTask);
}));
// Update task by ID
app.patch("/api/tasks/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const updatedTask = yield Task.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
    });
    res.json(updatedTask);
}));
// Delete task by ID
app.delete("/api/tasks/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task deleted" });
}));
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
