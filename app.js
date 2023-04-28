// model을 이용해 테이블 생성하는 코드

// const { sequelize } = require('./models/index.js');

// async function main() {
//   // model을 이용해 데이터베이스에 테이블을 삭제 후 생성합니다.
//   await sequelize.sync({ force: true });
// }

// main();

// app.js

const express = require('express');
const cookieParser = require('cookie-parser');
const usersRouter = require('./routes/users.js');
const postsRouter = require('./routes/posts.js');
const commentsRouter = require('./routes/comments.js');
const likesRouter = require('./routes/likes.js');
// const swaggerUi = require('swagger-ui-express');
// const swaggerFile = require('./swagger-output.json');

const app = express();
const PORT = 3000;

// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
app.use(express.json());
app.use(cookieParser());
app.use('/api', [usersRouter, postsRouter, commentsRouter, likesRouter]);
// app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.listen(PORT, () => {
  console.log(PORT, '포트 번호로 서버가 실행되었습니다.');
});
