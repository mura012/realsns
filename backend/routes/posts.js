const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");

//投稿を作成する
router.post("/", async (req, res) => {
  const newPost = new Post(req.body);
  try {
    const savedPost = await newPost.save();
    return res.status(200).json(savedPost);
  } catch (error) {
    return res.status(500).json(error);
  }
});

//情報を更新する
router.put("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.updateOne({
        $set: req.body,
      });
      return res.status(200).json("投稿編集に成功しました");
    } else {
      return res.status(403).json("他の人の投稿を編集できません");
    }
  } catch (error) {
    res.status(403).json(error);
  }
});
//投稿を削除する
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.deleteOne();
      return res.status(200).json("投稿を削除しました");
    } else {
      return res.status(403).json("他の人の投稿を削除できません");
    }
  } catch (error) {
    res.status(403).json(error);
  }
});
//ある特定の投稿を取得する
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    return res.status(200).json(post);
  } catch (error) {
    res.status(403).json(error);
  }
});

//特定の投稿にいいねをする
//ユーザーのフォロー
router.put("/:id/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    //まだ投稿にいいねが押されていなかったら押せる
    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({
        $push: {
          likes: req.body.userId,
        },
      });

      return res.status(200).json("いいねしました");
    } else {
      //投稿に既にいいねが押されていたら
      //いいねしているユーザーIDをとりのぞく
      await post.updateOne({
        $pull: {
          likes: req.body.userId,
        },
      });
      return res.status(403).json("投稿のいいねを外しました");
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

//タイムラインの投稿を取得
router.get("/timeline/all", async (req, res) => {
  try {
    const currentUser = await User.findById(req.body.userId);
    const userPosts = await Post.find({ usreId: currentUser._id });
    //自分がフォローしている友達の投稿内容を全て取得する
    const friendPosts = await Promise.all(
      currentUser.followings.map((friendId) => {
        return Post.find({ usreId: friendId });
      })
    );
    return res.status(200).json(userPosts.concat(...friendPosts));
  } catch (error) {
    return res.status(500).json(error);
  }
});

module.exports = router;
