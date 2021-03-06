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
  let pagescale = req.query.pagescale != null ? req.query.pagescale : 10;
  let page = req.query.page != null ? req.query.page : 1;
  let offset = (page - 1) * pagescale;

  models.board
    .findAll({
      limit: pagescale,
      offset,
      attributes: ["id", "title", "writer", "hit", "createdAt"],
      where: {
        title: {
          [op.like]:
            "%" + (querysearchtext != null ? querysearchtext : "") + "%",
        },
      },
    })
    .then((result) => {
      models.board
        .findAll({
          attributes: [[models.sequelize.fn("count", "*"), "count"]],

          where: {
            title: {
              [op.like]:
                "%" + (querysearchtext != null ? querysearchtext : "") + "%",
            },
          },
        })
        .then((count) => {
          res.send({ board: result, count: count[0] });
        })
        .catch((error) => {
          console.error(error);
          res.status(400).send("error", error);
        });
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

  if (querypw != null) {
    models.board
      .findOne({
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
    models.board
      .findOne({
        attributes: ["id", "title", "content", "writer", "hit", "createdAt"],
        where: {
          id,
        },
      })
      .then((result) => {
        var board = result;
        board.hit++;

        //   조회수 상승 구현  향후 로그인기능 구현시 1계정단 1번만 실행하는 부분 추가 예정
        models.board
          .update(
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

  models.board
    .update(
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

  models.board
    .create({
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
  models.board
    .destroy({
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

//// 댓글의 비밀번호

//해당 인덱스(id) 글의 댓글을 불러오는 api
app.get("/reply/:boardid", (req, res) => {
  const params = req.params;
  const { boardid } = params;

  models.reply
    .findAll({
      attributes: ["id", "content", "writer", "createdAt"],

      where: {
        boardid,
      },
    })
    .then((result) => {
      res.send({ reply: result });
    })
    .catch((error) => {
      console.error(error);
      res.status(400).send("error", error);
    });
});
//해당 글 id에 댓글 작성
app.post("/reply/:boardid", (req, res) => {
  const params = req.params;
  const { boardid } = params;
  const body = req.body;
  const { content, writer, pw } = body;

  if (!content || !writer || !pw) {
    res.status(400).send("모든 필드를 입력해주세요");
  }
  models.reply
    .create({
      boardid,
      content,
      writer,
      pw,
    })
    .then((result) => {
      res.send(result);
    })
    .catch((error) => {
      res.status(400), send("글 작성 실패");
    });
});

app.get("/replypwcheck/:id", (req, res) => {
  const params = req.params;
  const { id } = params;
  let querypw = req.query.pw;
  if (querypw != null) {
    models.reply
      .findOne({
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
    models.reply
      .findOne({
        attributes: ["content", "writer", "pw"],
        where: {
          id,
        },
      })
      .then((result) => {
        res.send(result);

        //   조회수 상승 구현  향후 로그인기능 구현시 1계정단 1번만 실행하는 부분 추가 예정
      })
      .catch((error) => {
        console.error(error);
        res.status(400).send("댓글 조회에 문제가 발생했습니다.");
      });
  }
});

app.put("/reply/:id", (req, res) => {
  const params = req.params;
  const body = req.body;
  const { id } = params;
  const { content, writer, pw } = body;
  if (!content || !writer || !pw) {
    res.status(400).send("모든 필드를 입력해주세요");
  }

  models.reply
    .update(
      {
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

app.delete("/reply/:id", (req, res) => {
  const params = req.params;
  const { id } = params;
  models.reply
    .destroy({
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
