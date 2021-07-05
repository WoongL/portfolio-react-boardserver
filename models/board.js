module.exports = function (sequelize, dataTypes) {
  const board = sequelize.define("board", {
    title: {
      type: dataTypes.STRING(30),
      allowNull: false,
    },
    content: {
      type: dataTypes.STRING(1000),
      allowNull: false,
    },
    writer: {
      type: dataTypes.STRING(15),
      allowNull: false,
    },
    pw: {
      type: dataTypes.STRING(20),
      allowNull: false,
    },
    hit: {
      type: dataTypes.INTEGER(10),
      allowNull: false,
    },
  });

  board.associate = function (models) {
    board.hasMany(models.reply, { foreignKey: "boardid", sourceKey: "id" });
  };

  return board;
};
