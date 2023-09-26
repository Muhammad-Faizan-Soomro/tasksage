import express from "express";
import bodyParser from "body-parser";
import mongoose, { Schema } from "mongoose";
import _ from "lodash";

const app = express();
const port = 3000;
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-faizan:Faizan11002200@cluster0.spoi2xa.mongodb.net/todolistDB");

const taskSchema = new Schema ({
    name: String
});

const listSchema = new Schema ({
    name: String,
    task: [taskSchema]
});

const Task = mongoose.model("task",taskSchema);


const item1 = new Task({
    name: 'Welcome to TaskSage'
});

const item2 = new Task({
    name: 'Click on Add Task button to add your task'
});

const item3 = new Task({
    name: '<-- Click here to delete the task'
});

const defaultItems = [item1,item2,item3];

const List = mongoose.model("list",listSchema);

app.use(bodyParser.urlencoded({extended: true}));

app.get("/",async (req,res)=>{
    let todayTask = await Task.find({});
    if (todayTask.length === 0) {
        Task.insertMany([
            { name: 'Welcome to TaskSage' },
            { name: 'Click on Add Task button to add your task' },
            { name: '<-- Click here to delete the task' }
        ]);
        res.redirect("/");
    } else {
        res.render("index.ejs", {tasks: todayTask});
    };
})

app.post("/",async (req,res)=>{
    const listName = req.body.list;
    const userTask = new Task(
        { name: req.body.task }
    );


    if(listName === 'today'){
        userTask.save();
        res.redirect("/");
    } else {
        const oldList = await List.find({ name: listName });
        oldList[0].task.push(userTask);
        const updatedList = oldList[0].task;
        const listUpdate = await List.findOneAndUpdate({ name: listName }, {task: updatedList}).exec();
        res.redirect("/"+listName);
    };
})

app.post("/delete", async (req,res)=>{
    const listName = Object.keys(req.body);
    if(listName[0] === 'today') {
        const deleteTask = Object.values(req.body)[0];
        await Task.findByIdAndDelete(deleteTask).exec();
        res.redirect("/");
    } else {
        const deleteListTask = Object.values(req.body)[0];
        await List.findOneAndUpdate({ name: listName }, { $pull: {task: {_id: deleteListTask}} }).exec();
        res.redirect("/"+listName);
    };
});

// app.get("/work",(req,res)=>{
//     if(workTask.length===0) {
//         res.render("index.ejs", {title: "Work Task"});
//     } else {
//         res.render("index.ejs", {title: "Work Task", tasks: workTask});
//     }
    
// })

app.get("/:route",async (req,res)=>{
    const listName = _.capitalize(req.params.route);

    const result = await List.find({ name: listName });

    if(await List.findOne({ name: listName }).exec()){
        res.render("index.ejs", {title: listName, tasks: result[0].task});
    } else {
        const list = new List({
            name: listName,
            task: defaultItems
        });
        list.save();
        res.redirect("/"+listName);
    }
});

// app.post("/work",(req,res)=>{
//     if(todayTask.length<=5) {
//         workTask.push(req.body.task);
//     }
//     res.redirect("/work");
// })


app.listen(port);