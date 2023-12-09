const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');
const upload = require('../multerConfig');
const Greayquest = require('../Models/Greayquest');
const IciciBankStatment = require('../Models/IciciBankStatment');
const sequelize = require('../config');
const { literal } = require('sequelize');
const FeeFromLoanTracker = require('../Models/FeeFromLoanTracker');
const LoanFeeOnlyTranstions = require('../Models/LoanFeeOnlyTranstions');


// Define your routes using the Student model

router.get('/Greayquest', async (req, res) => {
    const GreayquestLoanData = await Greayquest.findAll();
    res.json(GreayquestLoanData);
});

router.post('/greayquest-statement', upload.single('excelFile'), async (req, res) => {

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
                        applicationId: String(row.getCell(1).value) || null,
                        studentId: String(row.getCell(2).value) || null,
                        studentName: String(row.getCell(3).value) || null,
                        admissionNumber: String(row.getCell(4).value) || null,
                        studentGrNoBusFormNo: String(row.getCell(5).value) || null,
                        institute: String(row.getCell(6).value) || null,
                        location: String(row.getCell(7).value) || null,
                        board: String(row.getCell(8).value) || null,
                        productName: String(row.getCell(9).value) || null,
                        academicYear: String(row.getCell(10).value) || null,
                        status: String(row.getCell(11).value) || null,
                        classStandard: String(row.getCell(12).value) || null,
                        appliedAmount: parseFloat(row.getCell(13).value) || null,
                        createdOn: String(row.getCell(14).value) || null,
                        label: String(row.getCell(15).value) || null,
                        trancheAmount: parseFloat(row.getCell(16).value) || null,
                        disbursementDate: String(row.getCell(17).value) || null,
                        utr: String(row.getCell(18).value) || null,
                        discountPercent: parseFloat(row.getCell(19).value) || null,
                        discountAmount: parseFloat(row.getCell(20).value) || null,
                        retentionPercent: parseFloat(row.getCell(21).value) || null,
                        retentionAmount: parseFloat(row.getCell(22).value) || null,
                        disbursedAmount: parseFloat(row.getCell(23).value) || null,
                        taxRate: parseFloat(row.getCell(24).value) || null,
                        taxAmount: parseFloat(row.getCell(25).value) || null,
                        beneficiaryName: String(row.getCell(26).value) || null,
                        accountNumber: String(row.getCell(27).value) || null,
                        bankName: String(row.getCell(28).value) || null,
                        ifsc: String(row.getCell(29).value) || null,
                    }
                    dataToSave.push(rowData);
                }
            });

            await Promise.all(dataToSave.map(async (rowData) => {
                const existingRecord = await Greayquest.findOne({ where: { utr: rowData.utr } });

                if (!existingRecord) {
                    await Greayquest.create(rowData);
                    console.log(`Record with UTR ${rowData.utr} created.`);
                } else {
                    console.log(`Record with UTR ${rowData.utr} already exists. Skipping.`);
                }
            }));

            console.log('All data saved to the database.');
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

async function saveCombinedDataToDatabase(data) {
    try {
        for (const item of data) {
            console.log(item.utr, item.tranId, 128);

            // Try to find an existing record based on Bank_tranId (tranId)
            const existingRecord = await FeeFromLoanTracker.findOne({
                where: { Bank_tranId: item.tranId }
            });

            if (existingRecord) {
                // Update the existing record
                await FeeFromLoanTracker.update({
                    date_of_Payment: item.disbursementDate,
                    mode_of_payment: 'Loan',
                    MITSDE_Bank_Name: `${item.bankName} ${item.accountNumber}`,
                    instrument_No: item.utr,
                    amount: item.depositAmt,
                    clearance_Date: item.transactionDate,
                    student_Name: item.studentName,
                    student_Email_ID: item.studentId,
                    course_Name: item.board,
                    finance_charges: item.discountAmount,
                    transactionRemarks: item.transactionRemarks,
                }, {
                    where: { Bank_tranId: item.tranId }
                });

                console.log('Existing CombinedData instance updated:', item.tranId);
            } else {
                // Create a new record if it doesn't exist
                const [FeeFromLoanTrackerInstance, created] = await FeeFromLoanTracker.findOrCreate({
                    where: { Bank_tranId: item.tranId },
                    defaults: {
                        date_of_Payment: item.disbursementDate,
                        mode_of_payment: 'Loan',
                        MITSDE_Bank_Name: `${item.bankName} ${item.accountNumber}`,
                        instrument_No: item.utr,
                        amount: item.depositAmt,
                        clearance_Date: item.transactionDate,
                        student_Name: item.studentName,
                        student_Email_ID: item.studentId,
                        course_Name: item.board,
                        finance_charges: item.discountAmount,
                        Bank_tranId: item.tranId,
                        transactionRemarks: item.transactionRemarks,
                    },
                });

                if (created) {
                    console.log('New CombinedData instance created:', item.tranId);
                } else {
                    console.log('CombinedData instance already exists:', item.tranId);
                }
            }
        }

        console.log('Data saved to the database.');
    } catch (error) {
        console.error('Error saving data to the database:', error);
        throw error;
    }
}


// async function saveCombinedDataToDatabase(data) {
//     try {
//         for (const item of data) {
//             console.log(item.utr, item.tranId, 128);
//             const [FeeFromLoanTrackerInstance, created] = await FeeFromLoanTracker.findOrCreate({
//                 where: { Bank_tranId: item.tranId },
//                 defaults: {
//                     date_of_Payment: item.disbursementDate,
//                     mode_of_payment: 'Loan',
//                     MITSDE_Bank_Name: `${item.bankName} ${item.accountNumber}`,
//                     instrument_No: item.utr,
//                     amount: item.depositAmt,
//                     clearance_Date: item.transactionDate,
//                     student_Name: item.studentName,
//                     student_Email_ID: item.studentId,
//                     course_Name: item.board,
//                     finance_charges: item.discountAmount,
//                     Bank_tranId: item.tranId,
//                     transactionRemarks: item.transactionRemarks,
//                 },
//             });

//             if (created) {
//                 console.log('New CombinedData instance created:', FeeFromLoanTrackerInstance.get());
//             } else {
//                 console.log('CombinedData instance already exists:', FeeFromLoanTrackerInstance.get());
//             }
//         }
//         console.log('Data saved to the database.');
//     } catch (error) {
//         console.error('Error saving data to the database:', error);
//         throw error;
//     }
// }



router.get('/combined-data', async (req, res) => {
    try {
        // Fetch data from IciciBankStatment
        const statementResult = await IciciBankStatment.findAll({
            attributes: [
                'tranId',
                'transactionDate',
                'depositAmt',
                'transactionRemarks',
            ]
        });

        // Fetch data from Greayquest
        const greayquestResult = await Greayquest.findAll({
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

        // Extract utr values from Greayquest result
        const utrValues = greayquestResult.map(item => item.utr);

        // Filter Greayquest data based on utr values
        const filteredGreayquestResult = greayquestResult.filter(item => utrValues.includes(item.utr));

        // Combine IciciBankStatment data with matching Greayquest records
        const data = statementResult.map(statementItem => {
            const matchingGreayquest = filteredGreayquestResult.find(greayquestItem => {
                return statementItem.transactionRemarks.includes(greayquestItem.utr);
            });

            return {
                ...statementItem.dataValues,
                ...matchingGreayquest?.dataValues, // Merge Greayquest data
            };
        });

        // Save combined data to the database
        saveCombinedDataToDatabase(data);

        res.json({ data });
    } catch (error) {
        console.error('Error fetching combined data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



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

//         const data = result.map(greayquestItem => {
//             const matchingStatements = filteredStatementResult.concat(filteredStatementResults)
//                 .filter(statementItem => statementItem.transactionRemarks.includes(greayquestItem.utr));
//             // if(matchingStatements.length> 0){
//             //     return  data= {
//             //         ...greayquestItem.dataValues,
//             //         matchingStatements,
//             //     };
//             // }
//             return {
//                 ...greayquestItem.dataValues,
//                 matchingStatements,
//             };
//         });

//         // const data = result.map(greayquestItem => {
//         //     const matchingStatementsForItem = matchingStatements.filter(statementItem =>
//         //         statementItem.transactionRemarks.includes(greayquestItem.utr)
//         //     );

//         //     // Only include matchingStatements if it's not empty
//         //     const resultItem = {
//         //         ...greayquestItem.dataValues,
//         //     };

//         //     if (matchingStatementsForItem.length > 0) {
//         //         resultItem.matchingStatements = matchingStatementsForItem;
//         //     }

//         //     return resultItem;
//         // });


//         saveCombinedDataToDatabase(data)

//         res.json({ data });
//     } catch (error) {
//         console.error('Error fetching combined data:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// });




async function saveCombinedDataWithToDatabase(data) {
    try {
        for (const item of data) {
            if (item.matchingStatements.length > 0) {
                console.log(item.utr, item.matchingStatements[0].tranId, 128);
                const [LoanFeeOnlyTranstionsInstance, created] = await LoanFeeOnlyTranstions.findOrCreate({
                    where: { Bank_tranId: item.matchingStatements[0].tranId },
                    defaults: {
                        date_of_Payment: item.disbursementDate,
                        mode_of_payment: 'Loan',
                        MITSDE_Bank_Name: `${item.bankName} ${item.accountNumber}`,
                        instrument_No: item.utr,
                        amount: item.matchingStatements[0].depositAmt,
                        clearance_Date: item.matchingStatements[0].transactionDate,
                        student_Name: item.studentName,
                        student_Email_ID: item.studentId,
                        course_Name: item.board,
                        finance_charges: item.discountAmount,
                        Bank_tranId: item.matchingStatements[0].tranId,
                        transactionRemarks: item.matchingStatements[0].transactionRemarks,
                    },
                });

                if (created) {
                    console.log('New CombinedData instance created:', LoanFeeOnlyTranstionsInstance.get());
                } else {
                    console.log('CombinedData instance already exists:', LoanFeeOnlyTranstionsInstance.get());
                }
            }
        }

        console.log('Data saved to the database.');
    } catch (error) {
        console.error('Error saving data to the database:', error);
        throw error;
    }
}

router.get('/greaquest-only-data', async (req, res) => {
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

        const statementResult = await IciciBankStatment.findAll({
            attributes: [
                'tranId',
                'transactionDate',
                'depositAmt',
                'transactionRemarks',
            ]
        });

        const utrValues = result.map(item => item.utr);

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

            return {
                ...greayquestItem.dataValues,
                matchingStatements,
            };
        });
        saveCombinedDataWithToDatabase(data)
        res.json({ data });
    } catch (error) {
        console.error('Error fetching combined data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



module.exports = router;
