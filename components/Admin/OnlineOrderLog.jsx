"use client";
import React from "react";

const beige = "#f8f6f1";
const border = "1px solid #222";
const grey = "#ededed";

const statusOptions = [
  "Shipped",
  "Delete (Reject)",
  "In Chat",
  "On Process",
  "Pending",
  "Delivered",
];

const columns = [
  "Date",
  "Order Number",
  "Order Price",
  "Name",
  "Payment Status",
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

const OnlineOrderLog = () => {
  return (
    <div className="onlineorder-root">
      {/* Header and Filters */}
      <div className="onlineorder-header-row">
        <div className="onlineorder-title">ONLINE PAYMENT ORDER LOG</div>
        <div className="onlineorder-status-dropdown">
          <select defaultValue="Delivered">
            {statusOptions.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
          <span className="dropdown-icon"><DropdownIcon /></span>
        </div>
      </div>

      {/* Filters Row */}
      <div className="onlineorder-filters-row">
        <div className="onlineorder-filter">
          <select>
            <option>Search By Year</option>
          </select>
          <span className="dropdown-icon"><DropdownIcon /></span>
        </div>
        <div className="onlineorder-label">Month / Date</div>
      </div>

      {/* Table */}
      <div className="onlineorder-table-wrap">
        <table className="onlineorder-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  className={col === "Order Price" || col === "Payment Status" ? "grey-header" : ""}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i}>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td>
                  <button className="icon-btn"><ChatIcon /></button>
                </td>
                <td>
                  <button className="icon-btn"><EyeIcon /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="onlineorder-pagination-row">
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
        .onlineorder-root {
          background: ${beige};
          padding: 32px 16px 24px 16px;
          min-height: 100vh;
          font-family: 'Inter', Arial, sans-serif;
        }
        .onlineorder-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 18px;
          margin-bottom: 24px;
        }
        .onlineorder-title {
          font-size: 2rem;
          font-weight: bold;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #222;
        }
        .onlineorder-status-dropdown {
          position: relative;
          background: #fff;
          border-radius: 10px;
          border: ${border};
          box-shadow: 0 1px 2px rgba(0,0,0,0.03);
          min-width: 190px;
          height: 48px;
          display: flex;
          align-items: center;
        }
        .onlineorder-status-dropdown select {
          border: none;
          outline: none;
          font-size: 1.18rem;
          font-weight: 600;
          background: transparent;
          flex: 1;
          appearance: none;
          padding: 0 32px 0 14px;
        }
        .dropdown-icon {
          position: absolute;
          right: 16px;
          pointer-events: none;
        }
        .onlineorder-filters-row {
          display: flex;
          align-items: center;
          gap: 32px;
          margin-bottom: 22px;
        }
        .onlineorder-filter {
          position: relative;
          background: #fff;
          border-radius: 8px;
          border: ${border};
          box-shadow: 0 1px 2px rgba(0,0,0,0.03);
          min-width: 160px;
          height: 40px;
          display: flex;
          align-items: center;
        }
        .onlineorder-filter select {
          border: none;
          outline: none;
          font-size: 1rem;
          background: transparent;
          flex: 1;
          appearance: none;
          padding: 0 32px 0 14px;
        }
        .onlineorder-label {
          font-size: 1rem;
          font-weight: 600;
          color: #555;
          background: #fff;
          border-radius: 8px;
          border: ${border};
          padding: 8px 20px;
          display: flex;
          align-items: center;
          min-width: 120px;
          height: 40px;
        }
        .onlineorder-table-wrap {
          overflow-x: auto;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        .onlineorder-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          background: ${beige};
        }
        .onlineorder-table th, .onlineorder-table td {
          border: ${border};
          padding: 12px 10px;
          text-align: left;
          background: ${beige};
          font-size: 1rem;
        }
        .onlineorder-table th {
          font-weight: 700;
          background: #f3ede2;
        }
        .onlineorder-table th.grey-header {
          background: ${grey};
          color: #222;
          font-size: 1.05rem;
          font-weight: 700;
          letter-spacing: 0.05em;
        }
        .onlineorder-table td {
          min-width: 80px;
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
        .onlineorder-pagination-row {
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
          .onlineorder-header-row,
          .onlineorder-filters-row {
            flex-direction: column;
            align-items: stretch;
            gap: 18px;
          }
        }
        @media (max-width: 600px) {
          .onlineorder-table th, .onlineorder-table td {
            font-size: 0.92rem;
            padding: 8px 6px;
          }
          .onlineorder-title {
            font-size: 1.2rem;
            letter-spacing: 0.12em;
          }
          .onlineorder-filter, .onlineorder-status-dropdown {
            min-width: 100px;
          }
        }
      `}</style>
    </div>
  );
};

export default OnlineOrderLog;
