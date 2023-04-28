// middlewares/auth-middleware.js

const jwt = require('jsonwebtoken');
const { Users } = require('../models');

module.exports = async (req, res, next) => {
  const { authorization } = req.cookies;

  if (!authorization) {
    res.status(400).json({
      errorMessage: '로그인이 필요한 기능입니다.',
    });
    return;
  }

  const [tokenType, token] = authorization.split(' ');

  if (tokenType !== 'Bearer' || !token) {
    res.status(401).json({
      message: '전달된 쿠키에서 오류가 발생하였습니다.',
    });
    return;
  }

  try {
    const decodedToken = jwt.verify(token, 'customized_secret_key');
    const userId = decodedToken.userId;

    const user = await Users.findOne({ where: { userId } });
    if (!user) {
      res.clearCookie('authorization');
      return res
        .status(401)
        .json({ message: '토큰 사용자가 존재하지 않습니다.' });
    }
    res.locals.user = user; //res.locals.user 자체가 객체

    next();
  } catch (error) {
    res.clearCookie('authorization');
    return res.status(401).json({
      message: '비정상적인 요청입니다.',
    });
  }
};

//npx sequelize model:generate --name Comments --attributes email:string,password:string
//npx sequelize model:generate --name Likes --attributes email:string,password:string---> migration 내가 어떻게 테이블을 구성할껀지에 대한 규칙이 생기는거고

//db: migrate? 실제로 Comments라는 테이블이 생성되는거죠

//생성된 테이블한테 가서 관계를 설정해주고 1:1, 컬럼의 속성들을 만져줌
