const express = require("express");
const cors = require("cors");
const app = express();
const models = require("./models");

const port =   8080;

app.use(express.json());
app.use(cors());

app.get("/board",(req,res)=>{
    
    let searchText = req.query.search;
    console.log(searchText);
     
    models.Board.findAll({ 
        attributes:[
            "id",
            "title",
            "writer",
            "hit",
        ],
             
        


    }).then((result)=>{
        res.send({board: result});
    }).catch((error)=>{
        res.status(400).send("error",error);
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
  