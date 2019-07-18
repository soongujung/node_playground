module.exports = function(sequelize, DataTypes){
    sequelize.define(
        'post',
        {
            content:{
                type: DataTypes.STRING(300),
                allowNull: false,
            },
            img:{
                type: DataTypes.STRING(200),
                allowNull: true,
            },
        },
        {
            timestamps: true,
            paranoid: true,
        }
    )
};

