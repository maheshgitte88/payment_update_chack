const { DataTypes } = require('sequelize');
const sequelize = require('../config'); 

const FeeFromLoanTracker = sequelize.define('FeeFromLoanTracker', {
    date_of_Payment: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    mode_of_payment: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    MITSDE_Bank_Name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    instrument_No: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    amount: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    clearance_Date: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    student_Name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    student_Email_ID: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    course_Name:{
        type: DataTypes.STRING,
        allowNull: true,
    },
    finance_charges: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    Bank_tranId: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    transactionRemarks: {
        type: DataTypes.STRING,
        allowNull: true,
    },
});

module.exports = FeeFromLoanTracker;
