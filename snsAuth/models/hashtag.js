module.exports = function(sequelize, DataTypes){
    sequelize.define(
        'hashtag',
        {
            title:{
                type: DataTypes.STRING(30),
                allowNull: false,
                unique: true
            }
        },
        {
            timestamps: true,
            paranoid: true
        }
    );
};
