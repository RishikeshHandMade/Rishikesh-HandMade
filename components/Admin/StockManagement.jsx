"use client"
import React from "react";

const beige = "#f8f6f1";
const border = "1px solid #222";

const filterButtons = [
  { label: "Delete", color: "#fff", bg: "#e57373" },
  { label: "Inactive", color: "#222", bg: "#ffe082" },
  { label: "Active", color: "#fff", bg: "#81c784" },
];

const columns = [
  "Image",
  "Product Name",
  "Product ID",
  "Price",
  "Available Stock",
  "Main Category",
  "Artisan",
  "Action",
  "QR",
  "View",
];

function SearchIcon() {
  return (
    <svg width="18" height="18" fill="none" stroke="#222" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M16.65 16.65L21 21"/></svg>
  );
}

function DropdownIcon() {
  return (
    <svg width="16" height="16" fill="none" stroke="#222" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
  );
}

function QRIcon() {
  return (
    <svg width="18" height="18" fill="none" stroke="#222" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="6" height="6"/><rect x="15" y="3" width="6" height="6"/><rect x="3" y="15" width="6" height="6"/><path d="M15 15h2v2h2v2"/></svg>
  );
}

function ViewIcon() {
  return (
    <svg width="18" height="18" fill="none" stroke="#222" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M2 12C4.5 7 12 7 12 7s7.5 0 10 5c-2.5 5-10 5-10 5s-7.5 0-10-5z"/></svg>
  );
}

const StockManagementPage = () => {
  return (
    <div className="stock-root">
      {/* Header */}
      <div className="stock-header">
        <h2>Stock Management</h2>
        <div className="stock-searchbar">
          <input placeholder="Search By" />
          <button className="icon-btn" aria-label="search">
            <SearchIcon />
          </button>
        </div>
        <div className="stock-filters">
          {filterButtons.map((btn) => (
            <button
              key={btn.label}
              className="filter-btn"
              style={{ background: btn.bg, color: btn.color }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="stock-table-wrap">
        <table className="stock-table">
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
                {/* Image */}
                <td>
                  <div className="img-placeholder" />
                </td>
                {/* Product Name */}
                <td></td>
                {/* Product ID */}
                <td></td>
                {/* Price */}
                <td></td>
                {/* Available Stock */}
                <td></td>
                {/* Main Category */}
                <td></td>
                {/* Artisan */}
                <td></td>
                {/* Action (dropdown) */}
                <td>
                  <button className="icon-btn">
                    <DropdownIcon />
                  </button>
                </td>
                {/* QR */}
                <td>
                  <button className="icon-btn">
                    <QRIcon />
                  </button>
                </td>
                {/* View */}
                <td>
                  <button className="icon-btn">
                    <ViewIcon />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="stock-pagination-row">
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
        .stock-root {
          background: ${beige};
          padding: 32px 16px 24px 16px;
          min-height: 100vh;
          font-family: 'Inter', Arial, sans-serif;
        }
        .stock-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 32px;
          gap: 16px;
          flex-wrap: wrap;
        }
        .stock-header h2 {
          margin: 0;
          font-size: 2rem;
          font-weight: 700;
          flex: 1 1 180px;
          text-align: left;
        }
        .stock-searchbar {
          display: flex;
          align-items: center;
          background: #fff;
          border-radius: 8px;
          border: ${border};
          box-shadow: 0 1px 2px rgba(0,0,0,0.03);
          padding: 2px 8px 2px 12px;
          flex: 2 1 300px;
          max-width: 380px;
          min-width: 220px;
          margin: 0 auto;
          height: 40px;
        }
        .stock-searchbar input {
          border: none;
          outline: none;
          font-size: 1rem;
          background: transparent;
          flex: 1;
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
        .stock-filters {
          display: flex;
          flex-direction: column;
          gap: 10px;
          min-width: 110px;
        }
        .filter-btn {
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 500;
          padding: 7px 0;
          margin: 0;
          cursor: pointer;
          box-shadow: 0 1px 2px rgba(0,0,0,0.04);
          transition: filter 0.15s;
        }
        .filter-btn:hover {
          filter: brightness(0.95);
        }
        .stock-table-wrap {
          overflow-x: auto;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        .stock-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          background: ${beige};
        }
        .stock-table th, .stock-table td {
          border: ${border};
          padding: 12px 10px;
          text-align: left;
          background: ${beige};
          font-size: 1rem;
        }
        .stock-table th {
          font-weight: 700;
          background: #f3ede2;
        }
        .stock-table td {
          min-width: 80px;
        }
        .img-placeholder {
          width: 38px;
          height: 38px;
          background: #e0d6c3;
          border-radius: 7px;
          border: ${border};
          margin: 0 auto;
        }
        .stock-pagination-row {
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
          .stock-header {
            flex-direction: column;
            align-items: stretch;
            gap: 18px;
          }
          .stock-filters {
            flex-direction: row;
            justify-content: flex-end;
            gap: 10px;
            min-width: 0;
          }
        }
        @media (max-width: 600px) {
          .stock-table th, .stock-table td {
            font-size: 0.92rem;
            padding: 8px 6px;
          }
          .stock-header h2 {
            font-size: 1.3rem;
          }
          .stock-searchbar {
            max-width: 100%;
            min-width: 120px;
          }
        }
      `}</style>
    </div>
  );
};

export default StockManagementPage;
