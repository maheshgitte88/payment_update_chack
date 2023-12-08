import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button } from 'react-bootstrap';

function GrerqUploadStatement() {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('excelFile', file);

    try {
      await axios.post('http://localhost:9000/api/greayquest-statement', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('File uploaded successfully');
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Upload Greayquest Statement</h2>
      <Form>
        <div>
          <input
            label="Choose Greayquest Statement Excel File"
            onChange={handleFileChange}
            custom
          />
        </div>
        <Button variant="primary" onClick={handleUpload}>
          Upload
        </Button>
      </Form>
    </div>
  );
}

export default GrerqUploadStatement;
