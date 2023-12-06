const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');
const upload = require('../multerConfig');
const Propelled = require('../Models/Propelled');
const IciciBankStatment = require('../Models/IciciBankStatment');
const FeeFromLoanTracker = require('../Models/FeeFromLoanTracker');

router.post('/propelled-statement', upload.single('excelFile'), async (req, res) => {
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
                        loanApplicationId: row.getCell(1).value || null,
                        financeReference: row.getCell(2).value || null,
                        applicationStartedOn: row.getCell(3).value || null,
                        applicationCompletedOn: row.getCell(4).value || null,
                        applicationRejectedOn: row.getCell(5).value || null,
                        applicationRejectedReason: row.getCell(6).value || null,
                        borrowerName: row.getCell(7).value || null,
                        borrowerMobileNumber: row.getCell(8).value || null,
                        borrowerCurrentState: row.getCell(9).value || null,
                        borrowerPermanentState: row.getCell(10).value || null,
                        emailId: row.getCell(11).value || null,
                        nbfc: row.getCell(12).value || null,
                        instituteName: row.getCell(13).value || null,
                        courseName: row.getCell(14).value || null,
                        discountedCourseFee: parseFloat(row.getCell(15).value) || null,
                        loanAmount: parseFloat(row.getCell(16).value) || null,
                        numberOfAdvanceEMI: parseFloat(row.getCell(17).value) || null,
                        advanceEMIAmount: parseFloat(row.getCell(18).value) || null,
                        tenureMonths: parseFloat(row.getCell(19).value) || null,
                        subventionPercentage: parseFloat(row.getCell(20).value) || null,
                        subventionAmount: parseFloat(row.getCell(21).value) || null,
                        subventionGST: parseFloat(row.getCell(22).value) || null,
                        totalSubventionAmount: parseFloat(row.getCell(23).value) || null,
                        approvedOn: row.getCell(24).value || null,
                        loanDocumentationDoneOn: row.getCell(25).value || null,
                        disbursedAmount: parseFloat(row.getCell(26).value) || null,
                        dateOfDisbursement: row.getCell(27).value || null,
                        utrNo: row.getCell(28).value || null,
                        nachType: row.getCell(29).value || null,
                        borrowerROI: parseFloat(row.getCell(30).value) || null,
                        status: row.getCell(31).value || null,
                        loanDocumentationStatus: row.getCell(32).value || null,
                        instituteReference: row.getCell(33).value || null,
                        instituteNotes: row.getCell(34).value || null,
                        invoiceMonth: row.getCell(35).value || null,
                        agent: row.getCell(36).value || null,
                        agentEmail: row.getCell(37).value || null,
                        agentMobile: row.getCell(38).value || null,
                        agentComment: row.getCell(39).value || null,
                        actualLoanAmount: parseFloat(row.getCell(40).value) || null,
                        subventionFinanceCharges: parseFloat(row.getCell(41).value) || null,
                        borrowerName2: row.getCell(42).value || null,
                        emailId2: row.getCell(43).value || null,
                    };
                    dataToSave.push(rowData);
                }
            });

            // Assuming your model for the new record type is named OtherRecordType
            await Propelled.bulkCreate(dataToSave)
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



async function saveCombinedDataToDatabase(data) {
    try {
        for (const item of data) {
            if (item.matchingStatements.length > 0) {
                const [FeeFromLoanTrackerInstance, created] = await FeeFromLoanTracker.findOrCreate({
                    where: { utrNo: item.utrNo, tranId: item.matchingStatements[0].tranId },
                    defaults: {
                        date_of_Payment: item.dateOfDisbursement,
                        mode_of_payment: 'Loan',
                        MITSDE_Bank_Name: 'ICICI A/C 098505011038',
                        instrument_No: item.utrNo,
                        amount: item.matchingStatements[0].depositAmt,
                        clearance_Date: item.matchingStatements[0].transactionDate,
                        student_Name: item.borrowerName,
                        student_Email_ID: item.emailId,
                        finance_charges: item.subventionFinanceCharges,
                        Bank_tranId: item.matchingStatements[0].tranId,
                        transactionRemarks: item.matchingStatements[0].transactionRemarks,
                    },
                });

                if (created) {
                    console.log('New CombinedData instance created:', FeeFromLoanTrackerInstance.get());
                } else {
                    console.log('CombinedData instance already exists:', FeeFromLoanTrackerInstance.get());
                }
            }
        }

        console.log('Data saved to the database.');
    } catch (error) {
        console.error('Error saving data to the database:', error);
        throw error;
    }
}


router.get('/propelled-combined-data', async (req, res) => {
    try {
        const result = await Propelled.findAll({
            attributes: [
                'dateOfDisbursement',
                'emailId',
                'borrowerName',
                'subventionFinanceCharges',
                'utrNo'
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

        const utrValues = result.map(item => item.utrNo);

        const filteredStatementResult = statementResult.filter(item => {
            const splitRemarks = item.transactionRemarks.split('-');
            const utrPart = splitRemarks[1];
            return utrValues.includes(utrPart);
        });

        const filteredStatementResults = statementResult.filter(item => {
            const transactionRemarksMatch = item.transactionRemarks.match(/\/(\d+)\//);
            return transactionRemarksMatch && utrValues.includes(transactionRemarksMatch[1]);
        });

        const data = result.map(propelledItem => {
            const matchingStatements = filteredStatementResult.concat(filteredStatementResults)
                .filter(statementItem => statementItem.transactionRemarks.includes(propelledItem.utrNo));
            return {
                ...propelledItem.dataValues,
                matchingStatements,
            };
        });
        saveCombinedDataToDatabase(data)
        res.json({ data });
    } catch (error) {
        console.error('Error fetching combined data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


module.exports = router;
