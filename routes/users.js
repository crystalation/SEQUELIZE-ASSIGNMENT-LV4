// routes/users.route.js
const express = require('express');
const { Users } = require('../models');
const jwt = require('jsonwebtoken');
const router = express.Router();

//회원가입 API
router.post('/signup', async (req, res) => {
  try {
    const { nickname, password, confirm } = req.body;
    console.log(Users);

    // 동일한 가입자가 있는지 nickname을 통해 확인합니다.
    const isExistUser = await Users.findOne({ where: { nickname } });

    if (isExistUser) {
      return res.status(409).json({ message: '이미 존재하는 닉네임입니다.' });
    }

    // 닉네임 길이 제한
    if (nickname.length < 3) {
      return res
        .status(412)
        .json({ errorMessage: '닉네임 형식이 일치하지 않습니다.' });
    }

    // 닉네임 형식
    const nicknameRegex = /^[a-zA-Z0-9]+$/;
    if (!nicknameRegex.test(nickname)) {
      return res
        .status(412)
        .json({ errorMessage: '닉네임 형식이 일치하지 않습니다.' });
    }

    // 닉네임 4자리 이상, 닉네임과 같은 값 포함
    if (password.length < 4 || password.includes(nickname)) {
      return res
        .status(412)
        .json({ errorMessage: '패스워드에 닉네임이 포함되어있습니다.' });
    }

    // 비번 재확인
    if (password !== confirm) {
      return res.status(412).json({
        errorMessage: '확인용 패스워드가 일치하지 않습니다.',
      });
    }

    // Users 테이블에 사용자 정보를 추가합니다.
    await Users.create({ nickname, password });

    return res.status(201).json({ message: '회원가입이 완료되었습니다.' });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ errorMessage: '회원가입에 실패하였습니다.' });
  }
});

// 로그인
router.post('/login', async (req, res) => {
  try {
    const { nickname, password } = req.body;
    //사용자가 존재하는지 찾아보자
    const user = await Users.findOne({ where: { nickname } });
    if (!user) {
      return res
        .status(401)
        .json({ message: '닉네임 또는 패스워드를 확인해주세요.' });
    } else if (user.password !== password) {
      return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
    }

    //jwt를 생성하고
    const token = jwt.sign({ userId: user.userId }, 'customized_secret_key'); //user안에 있는 userId,
    //쿠키를 발급
    res.cookie('authorization', `Bearer ${token}`);
    //response할당
    return res.status(200).json({ message: '로그인 성공' });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: '서버 에러' });
  }
});

module.exports = router;
