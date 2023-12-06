const { DataTypes } = require('sequelize');
const sequelize = require('../config'); 

const IciciBankStatment = sequelize.define('IciciBankStatment', {
    tranId: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    valueDate: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    transactionDate: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    transactionPostedDate: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    chequeNoRefNo: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    transactionRemarks: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    withdrawalAmt: {
        type: DataTypes.DOUBLE,
        allowNull: true,
    },
    depositAmt: {
        type: DataTypes.DOUBLE,
        allowNull: true,
    },
    balance: {
        type: DataTypes.DOUBLE,
        allowNull: true,
    },
});

module.exports = IciciBankStatment;