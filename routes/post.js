var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
var models = require("./../models");
var Post = mongoose.model("Post");
var User = mongoose.model("User");
var Comment = mongoose.model("Comment");

router.get("/", (req, res, next) => {
  Post.find()
    .populate("author")
    .then(posts => {
      res.render("posts/postsIndex", { posts });
    })
    .catch(e => res.status(500).send(e.stack));
});

router.get("/new", (req, res) => {
  res.render("posts/new");
});

router.get("/:id/edit", (req, res) => {
  Post.findById(req.params.id)
    .then(post => {
      res.render("posts/edit", { post });
    })
    .catch(e => res.status(500).send(e.stack));
});

router.put("/:id", (req, res) => {
  console.log(req.body);
  var postParams = {
    title: req.body.post.title,
    body: req.body["post[body]"]
  };

  Post.findByIdAndUpdate(req.params.id, postParams)
    .then(post => {
      req.method = "GET";
      res.redirect(`/posts/${post.id}`);
    })
    .catch(e => res.status(500).send(e.stack));
});

router.get("/:id", (req, res) => {
  Post.findById(req.params.id)
    .populate({
      path: "children author",
      populate: {
        path: "children author",
        populate: { path: "children author" }
      }
    })
    .then(post => {
      console.log(JSON.stringify(post, null, 2));
      User.findById(req.session.userId).then(user => {
        post.authorName = user.username;
        res.render("posts/show", { post });
      });
    })
    .catch(e => res.status(500).send(e.stack));
});

router.post("/", (req, res) => {
  var post = new Post({
    author: req.session.userId,
    title: req.body["post[title]"],
    body: req.body["post[body]"],
    children: []
  });

  post
    .save()
    .then(post => {
      res.redirect(`/posts/${post.id}`);
    })
    .catch(e => res.status(500).send(e.stack));
});

router.delete("/:id", (req, res) => {
  Post.findByIdAndRemove(req.params.id)
    .then(() => {
      req.method = "GET";
      res.redirect("/posts");
    })
    .catch(e => res.status(500).send(e.stack));
});

module.exports = router;
