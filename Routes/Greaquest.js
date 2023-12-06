const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');
const upload = require('../multerConfig');
const Greayquest = require('../Models/Greayquest');
const IciciBankStatment = require('../Models/IciciBankStatment');
const sequelize = require('../config');
const { literal } = require('sequelize');


// Define your routes using the Student model

router.get('/Greayquest', async (req, res) => {
    const GreayquestLoanData = await Greayquest.findAll();
    res.json(GreayquestLoanData);
});

router.post('/Greayquest/Statement', upload.single('excelFile'), async (req, res) => {

    try {
        const fileBuffer = req.file.buffer;
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(fileBuffer);

        const worksheet = workbook.getWorksheet(1);
        if (worksheet) {
            const dataToSave = [];
            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber !== 1) {
                    const rowData = {
                        applicationId: row.getCell(1).value || null,
                        studentId: row.getCell(2).value || null,
                        studentName: row.getCell(3).value || null,
                        admissionNumber: row.getCell(4).value || null,
                        studentGrNoBusFormNo: row.getCell(5).value || null,
                        institute: row.getCell(6).value || null,
                        location: row.getCell(7).value || null,
                        board: row.getCell(8).value || null,
                        productName: row.getCell(9).value || null,
                        academicYear: row.getCell(10).value || null,
                        status: row.getCell(11).value || null,
                        classStandard: row.getCell(12).value || null,
                        appliedAmount: parseFloat(row.getCell(13).value) || null,
                        createdOn: row.getCell(14).value || null,
                        label: row.getCell(15).value || null,
                        trancheAmount: parseFloat(row.getCell(16).value) || null,
                        disbursementDate: row.getCell(17).value || null,
                        utr: row.getCell(18).value || null,
                        discountPercent: parseFloat(row.getCell(19).value) || null,
                        discountAmount: parseFloat(row.getCell(20).value) || null,
                        retentionPercent: parseFloat(row.getCell(21).value) || null,
                        retentionAmount: parseFloat(row.getCell(22).value) || null,
                        disbursedAmount: parseFloat(row.getCell(23).value) || null,
                        taxRate: parseFloat(row.getCell(24).value) || null,
                        taxAmount: parseFloat(row.getCell(25).value) || null,
                        beneficiaryName: row.getCell(26).value || null,
                        accountNumber: row.getCell(27).value || null,
                        bankName: row.getCell(28).value || null,
                        ifsc: row.getCell(29).value || null,
                    }
                    dataToSave.push(rowData);
                }
            });

            await Greayquest.bulkCreate(dataToSave)
                .then(() => {
                    console.log('Data saved to the database.');
                })
                .catch(err => {
                    console.error('Error saving data to the database:', err);
                });

            res.json({ message: 'Excel data uploaded and saved to the database.' });
        } else {
            res.status(400).json({ error: 'No valid worksheet found in the Excel file.' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// function extractValuesFromTransactionRemarks(transactionRemarks) {
//     const regex = /NEFT-([A-Z0-9]+)-/; // Define your regular expression to capture the Instrument no
//     const match = transactionRemarks.match(regex);

//     const instrumentNo = match ? match[1] : null;

//     return { instrumentNo };
// }

router.get('/perform-operations', async (req, res) => {
    try {
        const data = await Greayquest.findAll({
            include: IciciBankStatment
        });

        res.json({ data: data });
    } catch (error) {
        throw new Error(`Error extracting data from the database: ${error.message}`);
    }
});


// const { literal } = require('sequelize');

// router.get('/combined-data', async (req, res) => {
//     try {
//         const result = await Greayquest.findAll({
//             attributes: [
//                 'disbursementDate',
//                 'bankName',
//                 'accountNumber',
//                 'studentId',
//                 'studentName',
//                 'board',
//                 'discountAmount',
//                 'utr'
//             ]
//         });

//         // Fetch data from IciciBankStatment
//         const statementResult = await IciciBankStatment.findAll({
//             attributes: [
//                 'tranId',
//                 'transactionDate',
//                 'depositAmt',
//                 'transactionRemarks',
//             ]
//         });
//         // Extract utr values from Greayquest result
//         const utrValues = result.map(item => item.utr);

//         // Split transactionRemarks and filter IciciBankStatment data based on the specific part
//         const filteredStatementResult = statementResult.filter(item => {
//             const splitRemarks = item.transactionRemarks.split('-');
//             const utrPart = splitRemarks[1];
//             return utrValues.includes(utrPart);
//         });
//         const filteredStatementResults = statementResult.filter(item => {
//             const transactionRemarksMatch = item.transactionRemarks.match(/\/(\d+)\//);
//             return transactionRemarksMatch && utrValues.includes(transactionRemarksMatch[1]);
//         });
//         const data = [filteredStatementResult, ...filteredStatementResults]
//         res.json({ data: data });
//     } catch (error) {
//         console.error('Error fetching combined data:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// });


router.get('/combined-data', async (req, res) => {
    try {
        const result = await Greayquest.findAll({
            attributes: [
                'disbursementDate',
                'bankName',
                'accountNumber',
                'studentId',
                'studentName',
                'board',
                'discountAmount',
                'utr'
            ]
        });

        // Fetch data from IciciBankStatment
        const statementResult = await IciciBankStatment.findAll({
            attributes: [
                'tranId',
                'transactionDate',
                'depositAmt',
                'transactionRemarks',
            ]
        });

        // Extract utr values from Greayquest result
        const utrValues = result.map(item => item.utr);

        // Split transactionRemarks and filter IciciBankStatment data based on the specific part
        const filteredStatementResult = statementResult.filter(item => {
            const splitRemarks = item.transactionRemarks.split('-');
            const utrPart = splitRemarks[1];
            return utrValues.includes(utrPart);
        });

        const filteredStatementResults = statementResult.filter(item => {
            const transactionRemarksMatch = item.transactionRemarks.match(/\/(\d+)\//);
            return transactionRemarksMatch && utrValues.includes(transactionRemarksMatch[1]);
        });

        const data = result.map(greayquestItem => {
            const matchingStatements = filteredStatementResult.concat(filteredStatementResults)
                .filter(statementItem => statementItem.transactionRemarks.includes(greayquestItem.utr));
            // if(matchingStatements.length> 0){
            //     return  data= {
            //         ...greayquestItem.dataValues,
            //         matchingStatements,
            //     };
            // }
            return {
                ...greayquestItem.dataValues,
                matchingStatements,
            };
        });

        // const data = result.map(greayquestItem => {
        //     const matchingStatementsForItem = matchingStatements.filter(statementItem =>
        //         statementItem.transactionRemarks.includes(greayquestItem.utr)
        //     );

        //     // Only include matchingStatements if it's not empty
        //     const resultItem = {
        //         ...greayquestItem.dataValues,
        //     };

        //     if (matchingStatementsForItem.length > 0) {
        //         resultItem.matchingStatements = matchingStatementsForItem;
        //     }

        //     return resultItem;
        // });


        res.json({ data });
    } catch (error) {
        console.error('Error fetching combined data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});




module.exports = router;
