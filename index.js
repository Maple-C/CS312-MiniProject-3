import express from "express";
import pg from "pg";
const app = express();
const port = 3000;

const db = new pg.Pool({
    user: "postgres",
    host: "localhost",
    database: "BlogDB",
    password: "cs3122006",
    port: 5432,

});

    

// Middleware yay!
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

let currentUser = null;

app.get("/", (req, res) => {
    res.render("index", { posts: posts });

});

// // Bringing the homepage up 
// app.get("/", (req, res) => {
//     res.send("Homepage is now functioning properly");
// });

app.get("/edit/:id", (req, res) => {
    const post = posts.find(p => p.id == req.params.id);
    res.render("edit", { post: post });
});

// Hopefully acctually updates the post 
app.post("/edit/:id", (req, res) => {
    let post = posts.find(p => p.id == req.params.id);


    post.creator = req.body.creator;
    post.title = req.body.title;
    post.content = req.body.content;
    post.category = req.body.category;

    res.redirect("/");
});


let posts = [];

// for creating new post    



app.post("/create-post", (req, res) => {
    const { creator, title, content, category} = req.body;


    let newPost = {
        id: Date.now(),
        creator: creator,
        title: title,
        content: content,
        category: category,
        createdAt: new Date().toLocaleString()
    };

    posts.push(newPost); //should add the post then return back home
   
    res.redirect("/");
});

app.post ("/delete/:id", (req, res) => {
    posts = posts.filter(p => p.id != req.params.id);
    res.redirect("/");
});

app.get("/signin", (req, res) => {

    res.render("signin");
});

app.get("/signup", (req, res) => {

    res.render("signup");
});



app.listen(port, () => {
    console.log(`The Server is running on port ${port}!!`);
})
