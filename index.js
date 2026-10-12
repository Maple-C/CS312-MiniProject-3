import express from "express";
const app = express();
const port = 3000;

// Middleware yay!
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");


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

app.listen(port, () => {
    console.log(`The Server is running on port ${port}!!`);
})