import {React,useState} from 'react';
import Dropzone from 'react-dropzone';
import PropTypes from 'prop-types';
import './Dropzone.css';
import Papa from 'papaparse';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';


export default function DropZone() {

  const [pair, setPair] = useState([]);

  const getHighestPair = (employees) => {
    let pairs = {};
    let daysTogether = {};
    if (employees) {
      employees.forEach((employeeOne) => {
          employees.slice(employees.indexOf(employeeOne) + 1, employees.length).forEach((employeeTwo) => {

          if (employeeOne.EmpId !== employeeTwo.EmpId) {

            const startDate1 = new Date(employeeOne.DateFrom);
            const endDate1 = employeeOne.DateTo === "NULL" ? new Date() : new Date(employeeOne.DateTo);
            const startDate2 = new Date(employeeTwo.DateFrom);
            const endDate2 = employeeTwo.DateTo === "NULL" ? new Date() : new Date(employeeTwo.DateTo);

            if (employeeOne.ProjectId === employeeTwo.ProjectId) {
              if (startDate1 <= endDate2 && startDate2 <= endDate1) {
                
                const start = startDate1 <= startDate2 ? startDate2 : startDate1;
                const end = endDate1 <= endDate2 ? endDate1 : endDate2;
                if (end >= startDate2) {
                  const diffTime = Math.abs(end - start);
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  const x = `${employeeOne.EmpId}${employeeTwo.EmpId}`;
  
                  if (!daysTogether[x]) {
                    Object.assign(daysTogether, { [x]: 0 });
                  }
                  daysTogether[x] = 1 * daysTogether[x] + diffDays;
  
                  if (!pairs[x]) {
                    Object.assign(pairs, { [x]: [] });
                  }
                  pairs[x] = [...pairs[x], [employeeOne.EmpId, employeeTwo.EmpId, employeeOne.ProjectId, diffDays]];
                }
              }
            }
          }
        });
      });
    }
    return pairs[
      Object.keys(daysTogether).reduce((a, b) =>
        daysTogether[a] > daysTogether[b] ? a : b
      )
    ];
  }


  const handleDropAccepted = (acceptedFiles) =>{
    if (document.getElementsByClassName('fileNameZone')[0].hasChildNodes()) {
      let fileNameZone = document.getElementsByClassName('fileNameZone')[0];
      fileNameZone.removeChild(fileNameZone.firstChild);  
    }
    const files = acceptedFiles.map(file => (
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
          results.data.sort(function(a, b) { 
            return a.EmpId - b.EmpId || a.ProjectId - b.ProjectId;
          });
          let result = getHighestPair(results.data);
          setPair(result);
        },
      }),
      <li key={file.path}>
      </li>
    ));


    var nodes = document.createElement('LI');                 
    var textnodes = document.createTextNode(files[0].key);         
    nodes.appendChild(textnodes);                              
    document.getElementsByClassName('fileNameZone')[0].appendChild(nodes);  
  };

  return (
    <div className='container'>
      <Dropzone
        multiple={false}
        maxFiles= {1}
        onDropAccepted={handleDropAccepted}
        acceptedFormats={['text/csv', '.csv', 'application/csv']}>
        {({getRootProps, getInputProps}) => (
          <section>
            <div {...getRootProps({className: 'dropzone'})}>
              <input {...getInputProps()} />
              <p className="dropZoneText">
                      Click to select your file or drag and drop it here <span className="files">(.xls)</span>
              </p>
            </div>
          </section>
        )}
      </Dropzone>
      <div className="actions">
        <p className = "fileNameZone"></p>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Employee ID #1</TableCell>
                <TableCell align="right">Employee ID #2</TableCell>
                <TableCell align="right">Project ID</TableCell>
                <TableCell align="right">Days worked</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pair.map((row) => (
                <TableRow
                  key={row[3]}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {row[0]}
                  </TableCell>
                  <TableCell align="right">{row[1]}</TableCell>
                  <TableCell align="right">{row[2]}</TableCell>
                  <TableCell align="right">{row[3]}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
}

DropZone.propTypes = {
  handleClick: PropTypes.func,
  disabled: PropTypes.bool,
  costModelName: PropTypes.string
};
