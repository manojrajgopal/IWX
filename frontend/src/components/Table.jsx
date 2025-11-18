import React from 'react';
import './Table.css';

const Table = ({
  headers = [],
  rows = [],
  className = '',
  responsive = true
}) => {
  return (
    <div className={`table-container ${responsive ? 'responsive' : ''} ${className}`}>
      <table>
        {headers.length > 0 && (
          <thead>
            <tr>
              {headers.map((header, index) => (
                <th key={index}>{header}</th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
