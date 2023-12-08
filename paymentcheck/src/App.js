import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CSVLink } from 'react-csv';
import './App.css';
import GrerqUploadStatement from './Comp/GrerqUploadStatement';

function App() {
  const [data, setData] = useState([]);
  const [dataWithIcici, setDatawithIcici] = useState([])
  useEffect(() => {
    axios.get('http://localhost:9000/api/loanFeeTransactions')
      .then(response => setData(response.data))
      .catch(error => console.error('Error fetching data:', error));

    axios.get('http://localhost:9000/api/FeeFromLoanTracker')
      .then(response => setDatawithIcici(response.data))
      .catch(error => console.error('Error fetching data:', error));

  }, []);

  const headers = [
    { label: 'Date of Payment', key: 'date_of_Payment' },
    { label: 'Mode of Payment', key: 'mode_of_payment' },
    { label: 'MITSDE Bank Name', key: 'MITSDE_Bank_Name' },
    { label: 'Instrument No', key: 'instrument_No' },
    { label: 'Amount', key: 'amount' },
    { label: 'Clearance Date', key: 'clearance_Date' },
    { label: 'Student Name', key: 'student_Name' },
    { label: 'Student Email ID', key: 'student_Email_ID' },
    { label: 'Course Name', key: 'course_Name' },
    { label: 'Finance Charges', key: 'finance_charges' },
    { label: 'Bank TranId', key: 'Bank_tranId' },
    { label: 'Transaction Remarks', key: 'transactionRemarks' },
  ];
console.log(dataWithIcici, 34)

  return (
    <div className="App">
      <CSVLink data={data} headers={headers} filename={'Only_loan_transactions.csv'}>
        Download Excel Only Traker
      </CSVLink> 
      <hr/>
      <CSVLink data={dataWithIcici} headers={headers} filename={'loan_Tracker_ICICI_BANK.csv'}>
        Download Excel With ICICI BANK 
      </CSVLink>
      <hr/>
      <GrerqUploadStatement/>
    </div>
  );
}

export default App;
