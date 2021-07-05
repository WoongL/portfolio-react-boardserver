module.exports = function (sequelize, dataTypes) {
  const reply = sequelize.define("reply", {
    boardid: {
      type: dataTypes.INTEGER,
      allowNull: false,
    },
    content: {
      type: dataTypes.STRING(200),
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
  });

  reply.associate = function (models) {
    reply.belongsTo(models.board, { foreignKey: "boardid", sourceKey: "id" });
  };

  return reply;
};
