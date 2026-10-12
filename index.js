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

app.get("/", async (req, res) => {

    try {

        const results = await db.query('select * from blogs ORDER BY date_created desc');

        res.render("index", { posts: results.rows });
    
    }catch (error) {
        console.error(error);
        res.send("There was an error while trying to grab the posts. Please try again.");

    }


    // res.render("index", { posts: posts });

});

// // Bringing the homepage up 
// app.get("/", (req, res) => {
//     res.send("Homepage is now functioning properly");
// });

app.get("/edit/:id", (req, res) => {
    const post = posts.find(p => p.blog_id == req.params.id);
    res.render("edit", { post: post });
});

// Hopefully acctually updates the post 
app.post("/edit/:id", (req, res) => {
    let post = posts.find(p => p.blog_id == req.params.id);


    post.creator = req.body.creator;
    post.title = req.body.title;
    post.content = req.body.content;
    post.category = req.body.category;

    res.redirect("/");
});


let posts = [];

// for creating new post    



app.post("/create-post", async (req, res) => {

    const { creator, title, content} = req.body;

   
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
    posts = posts.filter(p => p.blog_id != req.params.id);
    res.redirect("/");
});

app.get("/signin", (req, res) => {

    res.render("signin");
});

app.get("/signup", (req, res) => {

    res.render("signup");
});


app.post("/signin", async (req, res) => {

    const { user_id, password } = req.body;

    try {

        const result = await db.query(
            'select * from users where user_id = $1 and password = $2',
            [user_id, password]
        );

        if(result.rows.length === 0) {

            res.send("This is Invalid user_id or password. Please try again.");

        } else {

            currentUser = result.rows[0];

            res.redirect("/");

        }

    } catch (error) {
        console.error(error);
        res.send("There was an error while signing in. Please try again.");

    }


    
});


app.post ("/signup", async (req, res) => {

    const { user_id, name, password } = req.body;

    try {

        const result = await db.query(
            'select * from users where user_id = $1',

            [user_id]

        );

        if(result.rows.length > 0) {

            res.send("This user_id is already taken. Please try again.");

        } else {

            await db.query(
                'insert into users (user_id, password, name) values ($1, $2, $3)',
                [user_id, password, name]

            );

            res.redirect("/signin");

        }

    } catch (error  ) {

        console.error(error);
        res.send("There was an error while signing up. Please try again.");

    }
});





app.listen(port, () => { 
    console.log(`The Server is running on port ${port}!!`);
});
