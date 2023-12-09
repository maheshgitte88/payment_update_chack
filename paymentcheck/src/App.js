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

  const todayDate = new Date();
  const options = { day: 'numeric', month: 'short', year: 'numeric' };

  const formattedDate = new Intl.DateTimeFormat('en-US', options).format(todayDate);

  const Generatereport = async () => {
    const TrackerOnlyPrope = await axios.get('http://localhost:9000/api/propelled-only-data');
    const TrackerOnlyGreq = await axios.get('http://localhost:9000/api/greaquest-only-data');
    alert('Congratulations! Report Generated Successfully.');
  }
  const GeneratereportWithIcici = async () => {
    const TrackerWithIciciPrope = await axios.get('http://localhost:9000/api/propelled-combined-data');
    const TrackerWithIciciGreq = await axios.get('http://localhost:9000/api/combined-data');
    alert('Congratulations! Report Generated Successfully.');
  }

  return (
    <div className="container">
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <a className="navbar-brand text-white ps-3" href="#"><img style={{ width: "150px" }} src='https://res.cloudinary.com/dtgpxvmpl/image/upload/v1702100329/mitsde_logo_vmzo63.png' /></a>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav"
          aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ml-auto">
            <li className='ps-2' >
              <button className="btn btn-primary">
                <CSVLink className="text-white" data={data} headers={headers} filename={`${formattedDate}_Only_Traker.csv`}>
                  Download Only Traker
                </CSVLink>
              </button>
            </li>
            <li className='ps-2'>
              <button className="btn btn-primary">
                <CSVLink className="text-white" data={dataWithIcici} headers={headers} filename={`${formattedDate}_Tracker_With_ICICI_BANK.csv`}>
                  Download Traker With ICICI BANK
                </CSVLink>
              </button>
            </li>
            <li className='ps-5'>

            </li>
            <li className='ps-5'>
              <button className="btn btn-primary" onClick={Generatereport}>
                Generate Report
              </button>
            </li>
            <li className='ps-2'>
              <button className="btn btn-primary" onClick={GeneratereportWithIcici}>
                Generate Report With ICICI
              </button>
            </li>
          </ul>
        </div>
      </nav>
      <GrerqUploadStatement />
    </div>
  );
}

export default App;
