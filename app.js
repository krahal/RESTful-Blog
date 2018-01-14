var express           = require("express"),
    app               = express(),
    bodyParser        = require("body-parser"),
    mongoose          = require("mongoose"),
    methodOverride    = require("method-override"),
    expressSanitizer  = require("express-sanitizer");

var url = process.env.DATABASEURL || "mongodb://localhost/restful-blog";
// APP CONFIG
mongoose.connect(url, {useMongoClient: true}); // connect mongoose
mongoose.Promise = global.Promise; 

app.set("view engine", "ejs");  // set up ejs
app.use(express.static("public"));  // allow our own stylesheets
app.use(bodyParser.urlencoded({extended: true})); // set up body-parser
app.use(methodOverride("_method"));
app.use(expressSanitizer());

// MONGOOSE/MODEL CONFIG
var blogSchema = new mongoose.Schema({
  title: String,
  image: String,
  body: String,
  created: {type: Date, default: Date.now}
});
var Blog = mongoose.model("Blog", blogSchema);

// RESTFUL ROUTES

// ROOT - redirects to INDEX
app.get("/", function(req, res){
  res.redirect("/blogs");
})

//INDEX - show all blog posts
app.get("/blogs", function(req, res){
  // data from database
  Blog.find({}, function(err, blogs){
    if(err){
      console.log("ERROR");
    } else {
      // send data to index.ejs variable "blogs"
      res.render("index", {blogs: blogs});
    }
  });
});

// NEW - show new blog post form
app.get("/blogs/new", function(req, res){
  res.render("new");
});

// CREATE - create a new blog post, then redirct to INDEX
app.post("/blogs", function(req, res){
  // sanitize blog body to ensure no scripts can be run
  req.body.blog.body = req.sanitize(req.body.blog.body);
  // create blog
  Blog.create(req.body.blog, function(err, newBlog){
    if(err){
      res.render("new");
    } else {
      // then, redirect to INDEX
      res.redirect("/blogs");
    }
  })
});

// SHOW - show info about one specific blog post
app.get("/blogs/:id", function(req, res){
  // look for blog in db via id
  Blog.findById(req.params.id, function(err, foundBlog){
    if(err){
      res.redirect("/blogs");
    } else {
      // pass found blog object to show.ejs blog variable
      res.render("show", {blog: foundBlog});
    }
  });
});

// EDIT - show edit form for one blog post
app.get("/blogs/:id/edit", function(req, res){
  Blog.findById(req.params.id, function(err, foundBlog){
    if(err){
      res.redirect("/blogs");
    } else {
      res.render("edit", {blog: foundBlog});
    }
  })
});

// UPDATE - Update a particular blog post, then redirect to SHOW
app.put("/blogs/:id", function(req, res){
  // sanitize blog body to ensure no scripts can be run
  req.body.blog.body = req.sanitize(req.body.blog.body);
  // find blog post and update it
  Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
    if(err){
      res.redirect("/blogs");
    } else {
      res.redirect("/blogs/" + req.params.id);
    }
  });
});

// DELETE - delete a particular blog post, then redirect to INDEX
app.delete("/blogs/:id", function(req, res){
  // destroy blog
  Blog.findByIdAndRemove(req.params.id, function(err, deletedBlog){
    if(err){
      res.redirect("/blogs");
    } else {
      // redirect somewhere
      res.redirect("/blogs");
    }
  });
}); 

// set up express server
var port = process.env.PORT || 3000;
app.listen(port, process.env.IP, function(){
  console.log("BLOG SERVER STARTED")
});

