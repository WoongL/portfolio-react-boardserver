const express = require("express");
const cors = require("cors");
const app = express();
const models = require("./models");
const sequelize = require("sequelize");
const op = sequelize.Op;

const port =   8080;

app.use(express.json());
app.use(cors());


// 게시판 검색 api , search키워드로 쿼리 주면 해당문자열 검색 구현 
app.get("/board",(req,res)=>{
    
    let searchText = req.query.search; 
     
    models.Board.findAll({ 
        attributes:[
            "id",
            "title",
            "writer",
            "hit",
        ], 
    
        where :{            
            title : {
                 [op.like] : "%"+(searchText!=null?searchText:"")+"%",
            },
        },
    

    }).then((result)=>{
        res.send({board: result});
    }).catch((error)=>{
        console.error(error);
        res.status(400).send("error",error);
    });
});

app.get("/board/:id",(req,res)=>{
    const params = req.params;
    const {id} = params;

    models.Board.findOne({
        attributes:[
            "id",
            "title",
            "content",
            "writer",
            "hit",
        ], 
        where: {
            id,
          },
    })
    .then((result) => { 
        res.send({
            board: result,
        });
      })
      .catch((error) => {
        console.error(error);
        res.status(400).send("게시글 조회에 문제가 발생했습니다.");
      });
})

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
  