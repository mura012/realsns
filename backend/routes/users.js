const { application } = require("express");
const User = require("../models/User");

const router = require("express").Router();

//CRUD
//ユーザー情報の更新
router.put("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).json("ユーザー情報が更新されました");
    } catch (error) {
      return res.status(500).json(error);
    }
  } else {
    return res.status(403).json("別の人のアカウントです");
  }
});
//ユーザー情報の削除
router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      res.status(200).json("ユーザー情報が削除されました");
    } catch (error) {
      return res.status(500).json(error);
    }
  } else {
    return res.status(403).json("別の人のアカウントです");
  }
});

//ユーザー情報の取得
router.get("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      const user = await User.findById(req.params.id);
      const { password, updatedAt, ...other } = user._doc;
      res.status(200).json(other);
    } catch (error) {
      return res.status(500).json(error);
    }
  } else {
    return res.status(403).json("別の人のアカウントです");
  }
});

//ユーザーのフォロー
router.put("/:id/follow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      //フォロワーに自分がいなかったらフォローできる
      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({
          $push: {
            followers: req.body.userId,
          },
        });
        await currentUser.updateOne({
          $push: {
            followings: req.params.id,
          },
        });
        return res.status(200).json("フォローに成功しました");
      } else {
        return res
          .status(403)
          .json("あなたは既にこのユーザーをフォローしています");
      }
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    return res.status(500).json("自分自身をフォローできません");
  }
});
//ユーザーのフォローをはずす
router.put("/:id/unfollow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      //フォロワーに存在したらフォローを外せる
      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({
          $pull: {
            followers: req.body.userId,
          },
        });
        await currentUser.updateOne({
          $pull: {
            followings: req.params.id,
          },
        });
        return res.status(200).json("フォロー解除しました");
      } else {
        return res
          .status(403)
          .json("あなたはこのユーザーをフォローしていません");
      }
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    return res.status(500).json("自分自身をフォロー解除できません");
  }
});

module.exports = router;
