// @format
const express = require("express");
const app = express();

// cors
const cors = require("cors");
app.use(cors());

// config parse
app.use(express.json()); // accept application/json
app.use(express.urlencoded({ extended: true })); // TODO: documenting

// mongodb
const mongoose = require("mongoose");

connect();

const todoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    finish: {
        type: Boolean,
        required: true
    }
});

const Todo = mongoose.model("todos", todoSchema);

app.post("/todo", async (req, res, next) => {
    const { title } = req.body;
    const todo = new Todo({
        title: title,
        finish: false
    });

    await todo.save(function(err, data) {
        if (err) return console.log(err);
        console.log(data);
    });

    await Todo.find({}, function(err, data) {
        res.send(data);
    });
});

app.get("/todo", (req, res, next) => {
    Todo.find({}, function(err, data) {
        res.send(data);
    });
});

app.post("/finish", async (req, res, next) => {
    const { id } = req.body;
    await Todo.findOne({
        _id: id
    }).exec(async (err, data) => {
        data.finish = !data.finish;
        await data.save((err, finish) => {
            if (err) return console.log(err);
            console.log(finish);
            res.send(finish);
        });
    });
});

app.post("/delete", async (req, res, next) => {
    const { id } = req.body;
    await Todo.findByIdAndRemove(id, (err, todo) => {
        // As always, handle any potential errors:
        if (err) return res.status(500).send(err);
        // We'll create a simple object to send back with a message and the id of the document that was removed
        // You can really do this however you want, though.
        return res.send({ success: true });
    });
});

function listen() {
    app.listen(3000, () => console.log("we're connected on port 3000"));
}

function connect() {
    mongoose
        .set("useFindAndModify", false)
        .connection.on("error", console.log)
        .on("disconected", connect)
        .once("open", listen);
    return mongoose.connect("mongodb://localhost:27017/todo", {
        useNewUrlParser: true
    });
}
