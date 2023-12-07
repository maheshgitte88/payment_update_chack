const { DataTypes } = require('sequelize');
const sequelize = require('../config'); 

const Greayquest = sequelize.define('Greayquest', {
    applicationId: { type: DataTypes.INTEGER, allowNull: false },
    studentId: { type: DataTypes.STRING },
    studentName: { type: DataTypes.STRING },
    admissionNumber: { type: DataTypes.STRING },
    studentGrNoBusFormNo: { type: DataTypes.STRING },
    institute: { type: DataTypes.STRING },
    location: { type: DataTypes.STRING },
    board: { type: DataTypes.STRING },
    productName: { type: DataTypes.STRING },
    academicYear: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING },
    classStandard: { type: DataTypes.STRING },
    appliedAmount: { type: DataTypes.FLOAT },
    createdOn: { type: DataTypes.DATE },
    label: { type: DataTypes.STRING },
    trancheAmount: { type: DataTypes.FLOAT },
    disbursementDate: { type: DataTypes.STRING },
    utr: { type: DataTypes.STRING },
    discountPercent: { type: DataTypes.FLOAT },
    discountAmount: { type: DataTypes.FLOAT },
    retentionPercent: { type: DataTypes.FLOAT },
    retentionAmount: { type: DataTypes.FLOAT },
    disbursedAmount: { type: DataTypes.FLOAT },
    taxRate: { type: DataTypes.FLOAT },
    taxAmount: { type: DataTypes.FLOAT },
    beneficiaryName: { type: DataTypes.STRING },
    accountNumber: { type: DataTypes.STRING },
    bankName: { type: DataTypes.STRING },
    ifsc: { type: DataTypes.STRING },
});

module.exports = Greayquest;



