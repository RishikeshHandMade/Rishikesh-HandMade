"use client";
import React from "react";

const wishlistData = [
  {
    img: "/img1.jpg",
    name: "Sophisticated Swagger Suit",
    oldPrice: "$45.00",
    price: "$28.00",
    stock: "In Stock",
  },
  {
    img: "/img2.jpg",
    name: "Cozy Knit Cardigan Sweater",
    oldPrice: "$95.00",
    price: "$56.00",
    stock: "In Stock",
  },
  {
    img: "/img3.jpg",
    name: "Athletic Mesh Sports Leggings",
    oldPrice: "$56.00",
    price: "$20.00",
    stock: "In Stock",
  },
];

function RemoveIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="11" fill="#fff"/><line x1="9" y1="9" x2="15" y2="15" /><line x1="15" y1="9" x2="9" y2="15" /></svg>
  );
}

const Wishlist = () => {
  return (
    <div className="wishlist-root">
      {/* Banner */}
      <div className="wishlist-banner">
        <div className="wishlist-banner-content">
          <div className="wishlist-title">Wishlist</div>
          <div className="wishlist-breadcrumb">
            <span>Home</span>
            <span className="wishlist-breadcrumb-sep">›</span>
            <span className="wishlist-breadcrumb-active">Wishlist</span>
          </div>
        </div>
        <img
          src="/wishlist-banner.jpg"
          className="wishlist-banner-img"
          alt="Wishlist Banner"
        />
      </div>

      {/* Wishlist Table/List */}
      <div className="wishlist-table-wrap">
        <table className="wishlist-table">
          <thead>
            <tr>
              <th>Product</th>
              <th></th>
              <th>Price</th>
              <th>Stock</th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {wishlistData.map((item, i) => (
              <tr key={i}>
                {/* Product Image */}
                <td>
                  <div className="wishlist-img-cell">
                    <img src={item.img} alt={item.name} />
                  </div>
                </td>
                {/* Product Name */}
                <td>
                  <div className="wishlist-product-name">{item.name}</div>
                </td>
                {/* Price */}
                <td>
                  <span className="wishlist-old-price">{item.oldPrice}</span>
                  <span className="wishlist-price">{item.price}</span>
                </td>
                {/* Stock */}
                <td>
                  <span className="wishlist-stock">{item.stock}</span>
                </td>
                {/* Add To Cart */}
                <td>
                  <button className="wishlist-add-btn">Add To Cart</button>
                </td>
                {/* Remove */}
                <td>
                  <button className="wishlist-remove-btn" aria-label="Remove">
                    <RemoveIcon />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .wishlist-root {
          background: #faf7f2;
          min-height: 100vh;
          font-family: 'Inter', Arial, sans-serif;
        }
        .wishlist-banner {
          width: 100%;
          height: 240px;
          background: linear-gradient(90deg, #9e7a5b 60%, #fff0 100%);
          position: relative;
          display: flex;
          align-items: stretch;
          justify-content: flex-start;
        }
        .wishlist-banner-content {
          z-index: 2;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding-left: 8vw;
          min-width: 320px;
        }
        .wishlist-title {
          font-size: 2.2rem;
          font-weight: 700;
          color: #fff;
          margin-top: 38px;
          margin-bottom: 8px;
          letter-spacing: 0.03em;
        }
        .wishlist-breadcrumb {
          color: #fff;
          font-size: 1.05rem;
          display: flex;
          align-items: center;
          gap: 7px;
        }
        .wishlist-breadcrumb-sep {
          font-size: 1.25em;
        }
        .wishlist-breadcrumb-active {
          font-weight: 600;
        }
        .wishlist-banner-img {
          position: absolute;
          right: 0;
          top: 0;
          height: 100%;
          object-fit: cover;
          width: 340px;
          z-index: 1;
        }
        .wishlist-table-wrap {
          max-width: 1100px;
          margin: -70px auto 0 auto;
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 2px 16px rgba(0,0,0,0.07);
          padding: 32px 0 32px 0;
        }
        .wishlist-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
        }
        .wishlist-table th, .wishlist-table td {
          border-bottom: 1.5px solid #f0e7db;
          text-align: left;
        }
        .wishlist-table th {
          color: #888;
          font-size: 1.05rem;
          font-weight: 600;
          background: #fff;
          padding: 0 0 18px 0;
          border: none;
        }
        .wishlist-table td {
          padding: 18px 0;
          vertical-align: middle;
          background: #fff;
        }
        .wishlist-img-cell {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          overflow: hidden;
          background: #f5e6d9;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .wishlist-img-cell img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .wishlist-product-name {
          font-size: 1.05rem;
          font-weight: 500;
          color: #222;
        }
        .wishlist-old-price {
          color: #aaa;
          text-decoration: line-through;
          margin-right: 9px;
          font-size: 0.98rem;
        }
        .wishlist-price {
          color: #222;
          font-weight: 600;
          font-size: 1.08rem;
        }
        .wishlist-stock {
          color: #1a9b40;
          font-weight: 600;
          font-size: 1.02rem;
        }
        .wishlist-add-btn {
          background: #000;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          padding: 10px 24px;
          cursor: pointer;
          transition: background 0.13s;
        }
        .wishlist-add-btn:hover {
          background: #333;
        }
        .wishlist-remove-btn {
          background: none;
          border: none;
          padding: 0;
          margin-left: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
        }
        @media (max-width: 900px) {
          .wishlist-banner-img {
            width: 200px;
          }
          .wishlist-banner-content {
            padding-left: 4vw;
            min-width: 180px;
          }
          .wishlist-table-wrap {
            max-width: 98vw;
            padding: 18px 0;
          }
        }
        @media (max-width: 600px) {
          .wishlist-banner {
            height: 120px;
          }
          .wishlist-banner-img {
            width: 90px;
          }
          .wishlist-title {
            font-size: 1.1rem;
            margin-top: 18px;
          }
          .wishlist-table th, .wishlist-table td {
            font-size: 0.98rem;
            padding: 9px 0;
          }
          .wishlist-img-cell {
            width: 36px;
            height: 36px;
            border-radius: 7px;
          }
        }
      `}</style>
    </div>
  );
};

export default Wishlist;
