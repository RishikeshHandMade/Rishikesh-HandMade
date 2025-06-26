"use client";
import React from "react";

const beige = "#f8f6f1";
const border = "1px solid #222";
const grey = "#333";
const orange = "#ff9800";
const tagList = [
  "General",
  "Returns",
  "Gift",
  "Refunds",
  "Payments",
  "Shipping",
];
const actionOptions = ["Active", "Inactive", "Edit"];

function DropdownIcon() {
  return (
    <svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
  );
}

const FAQAdmin = () => {
  return (
    <div className="faq-root">
      {/* Header section */}
      <div className="faq-header-row">
        <div>
          <div className="faq-title">FAQ PAGE ADMIN</div>
          <div className="faq-subtitle">Experience. Engage. Explore. Event by Event.</div>
        </div>
        <div className="faq-taglist-col">
          <div className="faq-tags">
            {tagList.map((tag) => (
              <div key={tag} className="faq-tag">{tag}</div>
            ))}
          </div>
          <div className="faq-tag-dropdown">
            <select>
              <option>Tag Title</option>
              {tagList.map((tag) => (
                <option key={tag}>{tag}</option>
              ))}
            </select>
            <span className="dropdown-icon"><DropdownIcon /></span>
          </div>
        </div>
      </div>

      {/* Input fields */}
      <div className="faq-inputs-row">
        <input
          className="faq-input faq-question"
          placeholder="Type Input"
          style={{ background: "#e5e5e5" }}
        />
        <input
          className="faq-input faq-answer"
          placeholder="Type Input"
          style={{ background: orange, color: "#fff", fontWeight: 600 }}
        />
      </div>

      {/* Add More button */}
      <button className="faq-add-btn">Add More</button>

      {/* Output Log Section */}
      <div className="faq-output-section">
        <div className="faq-output-title">Output Log</div>
        <div className="faq-table-wrap">
          <table className="faq-table">
            <thead>
              <tr>
                <th>Question</th>
                <th>Answer</th>
                <th>Action</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td></td>
                  <td></td>
                  <td>
                    <div className="faq-action-dropdown">
                      <select>
                        {actionOptions.map((opt) => (
                          <option key={opt}>{opt}</option>
                        ))}
                      </select>
                      <span className="dropdown-icon"><DropdownIcon /></span>
                    </div>
                  </td>
                  <td>
                    <button className="faq-delete-btn">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .faq-root {
          background: ${beige};
          min-height: 100vh;
          padding: 32px 16px 32px 16px;
          font-family: 'Inter', Arial, sans-serif;
        }
        .faq-header-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 32px;
          margin-bottom: 32px;
        }
        .faq-title {
          font-size: 2.2rem;
          font-weight: bold;
          font-style: italic;
          color: #222;
          margin-bottom: 8px;
          letter-spacing: 0.08em;
        }
        .faq-subtitle {
          font-size: 1.1rem;
          color: #555;
          font-weight: 500;
          margin-bottom: 2px;
        }
        .faq-taglist-col {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 18px;
          min-width: 160px;
        }
        .faq-tags {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .faq-tag {
          background: #fff;
          color: #222;
          border-radius: 8px;
          border: ${border};
          padding: 7px 20px;
          font-weight: 500;
          font-size: 1rem;
          text-align: right;
        }
        .faq-tag-dropdown {
          position: relative;
          background: #222;
          border-radius: 8px;
          border: ${border};
          min-width: 120px;
          height: 40px;
          display: flex;
          align-items: center;
        }
        .faq-tag-dropdown select {
          border: none;
          outline: none;
          font-size: 1rem;
          background: transparent;
          color: #fff;
          font-weight: 600;
          flex: 1;
          appearance: none;
          padding: 0 32px 0 14px;
        }
        .dropdown-icon {
          position: absolute;
          right: 14px;
          pointer-events: none;
        }
        .faq-inputs-row {
          display: flex;
          gap: 20px;
          margin-bottom: 26px;
          max-width: 680px;
        }
        .faq-input {
          border: none;
          outline: none;
          border-radius: 8px;
          padding: 14px 18px;
          font-size: 1.1rem;
          width: 100%;
          font-weight: 500;
        }
        .faq-question {
          flex: 1.2;
        }
        .faq-answer {
          flex: 1;
        }
        .faq-add-btn {
          margin: 0 0 36px 0;
          background: #111;
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 1.2rem;
          font-weight: bold;
          padding: 18px 0;
          width: 100%;
          max-width: 680px;
          cursor: pointer;
          letter-spacing: 0.04em;
          box-shadow: 0 2px 8px rgba(0,0,0,0.07);
        }
        .faq-output-section {
          margin-top: 18px;
          max-width: 980px;
        }
        .faq-output-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #222;
          margin-bottom: 12px;
          letter-spacing: 0.04em;
        }
        .faq-table-wrap {
          background: #222;
          border-radius: 12px;
          padding: 0 0 4px 0;
        }
        .faq-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
        }
        .faq-table th, .faq-table td {
          border: 1.5px solid #444;
          padding: 14px 12px;
          text-align: left;
          background: ${grey};
          color: #fff;
          font-size: 1.08rem;
        }
        .faq-table th {
          font-weight: 700;
          background: #444;
          color: #fff;
        }
        .faq-action-dropdown {
          position: relative;
          background: #444;
          border-radius: 8px;
          border: 1px solid #fff;
          height: 38px;
          min-width: 110px;
          display: flex;
          align-items: center;
        }
        .faq-action-dropdown select {
          border: none;
          outline: none;
          font-size: 1rem;
          background: transparent;
          color: #fff;
          font-weight: 600;
          flex: 1;
          appearance: none;
          padding: 0 32px 0 14px;
        }
        .faq-delete-btn {
          background: #e57373;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          padding: 8px 18px;
          cursor: pointer;
          transition: filter 0.14s;
        }
        .faq-delete-btn:hover {
          filter: brightness(0.93);
        }
        @media (max-width: 900px) {
          .faq-header-row {
            flex-direction: column;
            align-items: stretch;
            gap: 18px;
          }
          .faq-taglist-col {
            align-items: flex-start;
          }
          .faq-inputs-row {
            flex-direction: column;
            max-width: 100%;
          }
          .faq-add-btn, .faq-output-section {
            max-width: 100%;
          }
        }
        @media (max-width: 600px) {
          .faq-title {
            font-size: 1.1rem;
          }
          .faq-table th, .faq-table td {
            font-size: 0.92rem;
            padding: 8px 6px;
          }
          .faq-input {
            font-size: 0.98rem;
            padding: 10px 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default FAQAdmin;
