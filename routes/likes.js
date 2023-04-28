const express = require('express');
const authMiddleware = require('../middlewares/auth-middleware');
const { Likes, Users, Posts } = require('../models');
const router = express.Router();

//특정 게시물에 좋아요 추가
router.put('/posts/:postId/likes', authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params; //좋아요를 누르고자 하는 게시물의 id
    const { userId } = res.locals.user;

    // 이미 좋아요를 누른 게시글인지 확인
    const existingLike = await Likes.findOne({
      where: { PostId: postId, UserId: userId },
    });

    if (existingLike) {
      await Likes.destroy({ where: { PostId: postId, UserId: userId } });
      return res.status(200).json({ message: '좋아요를 취소하였습니다.' });
    }

    // 좋아요 추가
    await Likes.create({ PostId: postId, UserId: userId }); //누가 뭘 좋아요했는지

    res.json({ message: '게시글에 좋아요를 등록하였습니다.' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: '좋아요 등록에 실패하였습니다.' });
  }
});

router.get('/posts/likes', authMiddleware, async (req, res) => {
  try {
    const { userId } = res.locals.user;

    // 좋아요한 게시글의 id를 가져옴
    const likedPostIds = await Likes.findAll({
      attributes: ['PostId'],
      where: { UserId: userId },
    });

    // 좋아요한 게시글들을 가져옴
    const likedPosts = await Posts.findAll({
      where: { id: likedPostIds.map((like) => like.PostId) },
      include: { model: Users, attributes: ['id', 'nickname'] },
    });

    // 각 게시글에 대해 좋아요 수 계산
    const postsWithLikeCounts = likedPosts.map((post) => {
      const likeCount = likedPostIds.filter(
        (like) => like.PostId === post.id
      ).length;
      return { ...post.toJSON(), likeCount };
    });

    // 좋아요 수에 따라 정렬
    const sortedPosts = postsWithLikeCounts.sort(
      (a, b) => b.likeCount - a.likeCount
    );

    res.json({ likedPosts: sortedPosts });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: '게시글 조회에 실패하였습니다.' });
  }
});

// 특정 게시물에 좋아요 삭제
// router.put('/posts/:postId/likes', authMiddleware, async (req, res) => {
//   try {
//     const { postId } = req.params;
//     const { userId } = req.user;

//     // 좋아요 삭제

//     res.json({ message: '게시글의 좋아요를 취소하였습니다.' });
//   } catch (error) {
//     console.error(error);
//     res.status(400).json({ message: '좋아요 취소에 실패하였습니다.' });
//   }
// });

module.exports = router;
