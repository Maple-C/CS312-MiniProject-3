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

app.get("/edit/:id", async (req, res) => {
    if (!currentUser) {
        return res.send("You must be signed in to edit a post."
        );
    }
    try {

        const result =  await db.query(`select * from blogs where blog_id = $1`, [req.params.id]);

        const post = result.rows[0];

        if (result.rows.length === 0) {
            return res.send("Post not found.");
        }

        if(post.creator_user_id !== currentUser.user_id) {
            return res.send(
                "You are not authorized to edit this post."

            );
          
        }


        res.render("edit", { post }); } catch (error) {
        
        console.error(error);

        res.send("There was an error while trying to grab the post. Please try again."

        );
    }
});
        


// Hopefully acctually updates the post 
app.post("/edit/:id", async (req, res) => {
    if (!currentUser) {
        return res.send("You must be signed in to edit a post!"
        );
    }   
    try {

        const check = await db.query(`select * from blogs where blog_id = $1`, [req.params.id]);

        const post = check.rows[0];

        if (check.rows.length === 0) {
            return res.send("Post not found.");
        }

        if(post.creator_user_id !== currentUser.user_id) {
            res.send("You are not authorized to edit this post.");
            return;
        }

        await db.query(
            `update blogs set title = $1, body = $2 where blog_id = $3`,
            [
                req.body.title,
                req.body.content,
                req.params.id
            ]
        );

        res.redirect("/");

    } catch (error) {
        console.error(error);
        res.send("There was an error while trying to update the post. Please try again.");
    }
});






// for creating new post    



app.post("/create-post", async (req, res) => {

    if(!currentUser) {
        return res.send("You must be signed in to create a post."

        );
    }
    const { title, content} = req.body;

    try {

        await db.query(
            `insert into blogs
            (
                creator_name,
                creator_user_id,
                title,
                body,
                date_created
            )
            values 
            ($1, $2, $3, $4, current_timestamp)`,

            [currentUser.name, currentUser.user_id, title, content]
        );

        res.redirect("/");

    } catch (error) {
        console.error(error);
        res.send("There was an error while creating the post. Please try again.");
    }



    // let newPost = {
    //     id: Date.now(),
    //     creator: creator,
    //     title: title,
    //     content: content,
    //     category: category,
    //     createdAt: new Date().toLocaleString()
    // };

    // posts.push(newPost); //should add the post then return back home
   
    // res.redirect("/");
});

app.post ("/delete/:id", async (req, res) => {

    if(!currentUser) {
        return res.send("You must be signed in to delete a post!"
        );
    }

    console.log("delete route hit");

    try {

        const check = await db.query(`select * from blogs where blog_id = $1`, [req.params.id]);

        const post = check.rows[0];

         if (check.rows.length === 0) {
            return res.send("Post not found.");
        }


        if(post.creator_user_id !== currentUser.user_id) {
            res.send("You are not authorized to delete this post.");
            return;
        }

        await db.query('delete from blogs where blog_id = $1', [req.params.id]);

        res.redirect("/");

    } catch (error) {
        console.error(error);
        res.send("There was an error while trying to delete the post. Please try again.");
    }
});

app.get("/signin", (req, res) => {

    res.render("signin");
});

app.get("/signup", (req, res) => {

    res.render("signup");
});

app.get("/signout", (req, res) => {

    currentUser = null;
    res.redirect("/");
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
})
