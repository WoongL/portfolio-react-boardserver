const express = require("express");
const cors = require("cors");
const app = express();
const models = require("./models");
const sequelize = require("sequelize");
const op = sequelize.Op;

const port = 8080;

app.use(express.json());
app.use(cors());

// 게시판 검색 api , search키워드로 쿼리 주면 해당문자열 검색 구현
app.get("/board", (req, res) => {
  let querysearchtext = req.query.search;

  models.Board.findAll({
    attributes: ["id", "title", "writer", "hit", "createdAt"],

    where: {
      title: {
        [op.like]: "%" + (querysearchtext != null ? querysearchtext : "") + "%",
      },
    },
  })
    .then((result) => {
      res.send({ board: result });
    })
    .catch((error) => {
      console.error(error);
      res.status(400).send("error", error);
    });
});

//게시글 조회 / 쿼리로 pw 값주면 게시글의 비밀번호 맞는지 검사
app.get("/board/:id", (req, res) => {
  const params = req.params;
  const { id } = params;
  let querypw = req.query.pw;
  console.log(querypw);
  if (querypw != null) {
    models.Board.findOne({
      attributes: ["pw"],
      where: {
        id,
      },
    })
      .then((result) => {
        res.send(querypw == result.pw);
      })
      .catch((error) => {
        console.error(error);
        res.status(400).send("패스워드 확인에 문제가 발생했습니다.");
      });
  } else {
    models.Board.findOne({
      attributes: ["id", "title", "content", "writer", "hit", "createdAt"],
      where: {
        id,
      },
    })
      .then((result) => {
        var board = result;
        board.hit++;

        //   조회수 상승 구현  향후 로그인기능 구현시 1계정단 1번만 실행하는 부분 추가 예정
        models.Board.update(
          {
            hit: board.hit,
          },
          {
            where: {
              id,
            },
          }
        )
          .then((result2) => {
            res.send({
              board,
            });
          })
          .catch((error) => {});
      })
      .catch((error) => {
        console.error(error);
        res.status(400).send("게시글 조회에 문제가 발생했습니다.");
      });
  }
});

app.put("/board/:id", (req, res) => {
  const params = req.params;
  const body = req.body;
  const { id } = params;
  const { title, content, writer, pw } = body;
  if (!title || !content || !writer || !pw) {
    res.status(400).send("모든 필드를 입력해주세요");
  }

  models.Board.update(
    {
      title,
      content,
      writer,
      pw,
    },
    {
      where: {
        id,
      },
    }
  )
    .then((result) => {
      res.send({
        result,
      });
    })
    .catch((error) => {});
});

//게시글 작성
app.post("/board", (req, res) => {
  const body = req.body;
  const { title, content, writer, pw } = body;
  if (!title || !content || !writer || !pw) {
    res.status(400).send("모든 필드를 입력해주세요");
  }

  models.Board.create({
    title,
    content,
    writer,
    pw,
    hit: "0",
  })
    .then((result) => {
      res.send(result);
    })
    .catch((error) => {
      res.status(400), send("글 작성 실패");
    });
});

app.delete("/board/:id", (req, res) => {
  const params = req.params;
  const { id } = params;
  models.Board.destroy({
    where: {
      id,
    },
  })
    .then((result) => {
      res.send({ result });
    })
    .catch((error) => {
      console.error(error);
      res.status(400).send("게시글 삭제에 문제가 발생했습니다.");
    });
});

app.listen(port, () => {
  console.log("서버 정상동작중");
  models.sequelize
    .sync()
    .then(() => {
      console.log("db 연결 성공");
    })
    .catch((eff) => {
      console.log(err);
      console.log("db 연결 에러");
      process.exit();
    });
});
