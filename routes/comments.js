const express = require('express');
const { Comments, Posts } = require('../models');
const { Users } = require('../models');
const authMiddleware = require('../middlewares/auth-middleware.js');
const router = express.Router();

//댓글 등록
router.post('/posts/:postId/comments', authMiddleware, async (req, res) => {
  try {
    const postId = req.params.postId;
    const { userId } = res.locals.user; //사용자 인증이 완료된
    const { content } = req.body;

    // 게시글이 존재하지 않을 경우
    const post = await Posts.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: '게시글이 존재하지 않습니다.' });
    }

    const comment = await Comments.create({
      //변수가 안쓰이는디
      UserId: userId,
      PostId: postId,
      comment: content,
    });

    return res.status(201).json({ message: '댓글을 작성하였습니다.' }); //작성한 데이터를 보려면?..
  } catch (err) {
    // 예외 처리되지 않은 모든 에러는 이곳에서 처리합니다.
    console.error(err);
    return res.status(400).json({ message: '댓글 작성에 실패하였습니다.' });
  }
});

//특정 게시물의 댓글 조회 //comments mig, model에 nickname 칼럼이 없음..
router.get('/posts/:postId/comments', authMiddleware, async (req, res) => {
  try {
    const postId = req.params.postId;
    const comments = await Comments.findAll({
      where: { PostId: postId },
      attributes: ['commentId', 'UserId', 'comment', 'createdAt', 'updatedAt'],
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({ comments: comments });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: '댓글 조회에 실패하였습니다.' });
  }
});

//댓글 수정
router.put(
  '/posts/:postId/comments/:commentId',
  authMiddleware,
  async (req, res) => {
    try {
      const { commentId } = req.params;
      const { content } = req.body;

      const existsComment = await Comments.findByPk(commentId);

      if (!existsComment) {
        return res.status(400).json({ message: '댓글을 찾을 수 없습니다.' });
      }

      existsComment.comment = content;
      await existsComment.save();

      res.status(200).json({ message: '댓글을 수정했습니다.', existsComment });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: '댓글 수정에 실패했습니다.' });
    }
  }
);

// //댓글삭제
router.delete(
  '/posts/:postId/comments/:commentId',
  authMiddleware,
  async (req, res) => {
    try {
      const { commentId } = req.params;

      const comment = await Comments.findByPk(commentId);
      if (comment) {
        await comment.destroy();
        res.json({ message: '댓글을 삭제하였습니다.' });
      } else {
        return res.status(400).json({ message: '해당 ID의 댓글이 없습니다.' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ errorMessage: '댓글 삭제에 실패하였습니다.' });
    }
  }
);

module.exports = router;
