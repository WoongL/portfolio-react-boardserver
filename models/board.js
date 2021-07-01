module.exports = function (sequelize, dataTypes) {
    const board = sequelize.define("Board", {
      
      title: {
        type: dataTypes.STRING(30),
        allowNull: false,
      },
      content : {
          type : dataTypes.STRING(1000),
          allowNull : false,
      },
      writer : {
        type: dataTypes.STRING(15),
        allowNull: false,
      },
      pw :{
        type: dataTypes.STRING(20),
        allowNull: false,
      },
      hit:{
        type: dataTypes.INTEGER(10),
        allowNull: false,
      }

    });

    return board;
  };
  