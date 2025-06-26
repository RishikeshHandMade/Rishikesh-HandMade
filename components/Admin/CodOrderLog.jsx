"use client";
import React from "react";

const beige = "#f8f6f1";
const border = "1px solid #222";

const statusOptions = [
  "Delivered",
  "Shipped",
  "Delete",
  "In Chat",
  "On Process",
  "Pending",
];

const columns = [
  "Date",
  "Order Number",
  "Name",
  "Order Status Action",
  "Chat",
  "View",
];

function DropdownIcon() {
  return (
    <svg width="16" height="16" fill="none" stroke="#222" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
  );
}

function ChatIcon() {
  return (
    <svg width="20" height="20" fill="none" stroke="#222" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
  );
}

function EyeIcon() {
  return (
    <svg width="20" height="20" fill="none" stroke="#222" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M2 12C4.5 7 12 7 12 7s7.5 0 10 5c-2.5 5-10 5-10 5s-7.5 0-10-5z"/></svg>
  );
}

const CodOrderLog = () => {
  return (
    <div className="codorder-root">
      {/* Header and Filters */}
      <div className="codorder-header-row">
        <div className="codorder-title-col">
          <div className="codorder-filters-row">
            <div className="codorder-filter">
              <select>
                <option>Search By Year</option>
              </select>
              <span className="dropdown-icon"><DropdownIcon /></span>
            </div>
            <div className="codorder-filter">
              <select>
                <option>Search By Month</option>
              </select>
              <span className="dropdown-icon"><DropdownIcon /></span>
            </div>
            <div className="codorder-filter">
              <select>
                <option>Search By Date</option>
              </select>
              <span className="dropdown-icon"><DropdownIcon /></span>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="codorder-table-wrap">
        <table className="codorder-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i}>
                {/* Date */}
                <td></td>
                {/* Order Number */}
                <td></td>
                {/* Name */}
                <td></td>
                {/* Order Status Action (dropdown) */}
                <td>
                  <div className="codorder-status-dropdown">
                    <select>
                      {statusOptions.map((status) => (
                        <option key={status}>{status}</option>
                      ))}
                    </select>
                    <span className="dropdown-icon"><DropdownIcon /></span>
                  </div>
                </td>
                {/* Chat */}
                <td>
                  <button className="icon-btn"><ChatIcon /></button>
                </td>
                {/* View */}
                <td>
                  <button className="icon-btn"><EyeIcon /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="codorder-pagination-row">
        <div className="pagination">
          <button className="icon-btn" aria-label="Prev">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              className={`page-btn${num === 1 ? " active" : ""}`}
            >
              {num}
            </button>
          ))}
          <button className="icon-btn" aria-label="Next">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2"><path d="M9 6l6 6-6 6"/></svg>
          </button>
        </div>
        <div className="showing-label">Showing 50 Data</div>
      </div>

      <style jsx>{`
        .codorder-root {
          background: ${beige};
          padding: 32px 16px 24px 16px;
          min-height: 100vh;
          font-family: 'Inter', Arial, sans-serif;
        }
        .codorder-header-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 18px;
          margin-bottom: 34px;
        }
        .codorder-title-col {
          flex: 2 1 340px;
          min-width: 260px;
        }
        .codorder-title-col h2 {
          margin: 0 0 22px 0;
          font-size: 2rem;
          font-weight: 700;
          text-align: left;
        }
        .codorder-filters-row {
          display: flex;
          gap: 18px;
          margin-bottom: 6px;
        }
        .codorder-filter {
          position: relative;
          background: #fff;
          border-radius: 8px;
          border: ${border};
          box-shadow: 0 1px 2px rgba(0,0,0,0.03);
          padding: 2px 10px 2px 14px;
          min-width: 150px;
          height: 40px;
          display: flex;
          align-items: center;
        }
        .codorder-filter select {
          border: none;
          outline: none;
          font-size: 1rem;
          background: transparent;
          flex: 1;
          appearance: none;
          padding-right: 20px;
        }
        .dropdown-icon {
          position: absolute;
          right: 12px;
          pointer-events: none;
        }
        .codorder-status-col {
          flex: 1 1 180px;
          min-width: 170px;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 10px;
        }
        .codorder-status-btn {
          background: #fff;
          border-radius: 8px;
          border: ${border};
          font-weight: 500;
          font-size: 1rem;
          padding: 7px 0;
          width: 110px;
          text-align: center;
          margin-bottom: 2px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.04);
        }
        .codorder-table-wrap {
          overflow-x: auto;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        .codorder-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          background: ${beige};
        }
        .codorder-table th, .codorder-table td {
          border: ${border};
          padding: 12px 10px;
          text-align: left;
          background: ${beige};
          font-size: 1rem;
        }
        .codorder-table th {
          font-weight: 700;
          background: #f3ede2;
        }
        .codorder-table td {
          min-width: 80px;
        }
        .codorder-status-dropdown {
          position: relative;
          display: flex;
          align-items: center;
          background: #fff;
          border-radius: 8px;
          border: ${border};
          height: 36px;
          min-width: 120px;
        }
        .codorder-status-dropdown select {
          border: none;
          outline: none;
          font-size: 1rem;
          background: transparent;
          flex: 1;
          appearance: none;
          padding-right: 20px;
        }
        .codorder-status-dropdown .dropdown-icon {
          position: absolute;
          right: 12px;
          pointer-events: none;
        }
        .icon-btn {
          background: none;
          border: none;
          padding: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .codorder-pagination-row {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 24px;
          margin-top: 28px;
          flex-wrap: wrap;
        }
        .pagination {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .page-btn {
          background: #fff;
          border: ${border};
          border-radius: 6px;
          width: 32px;
          height: 32px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.14s, color 0.14s;
        }
        .page-btn.active {
          background: #222;
          color: #fff;
        }
        .showing-label {
          margin-left: auto;
          font-size: 1rem;
          color: #444;
          font-weight: 500;
        }
        @media (max-width: 900px) {
          .codorder-header-row {
            flex-direction: column;
            align-items: stretch;
            gap: 18px;
          }
          .codorder-status-col {
            flex-direction: row;
            align-items: flex-start;
            gap: 10px;
          }
        }
        @media (max-width: 600px) {
          .codorder-table th, .codorder-table td {
            font-size: 0.92rem;
            padding: 8px 6px;
          }
          .codorder-title-col h2 {
            font-size: 1.3rem;
          }
          .codorder-filter {
            max-width: 100%;
            min-width: 90px;
          }
        }
      `}</style>
    </div>
  );
};

export default CodOrderLog;
