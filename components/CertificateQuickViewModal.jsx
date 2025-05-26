"use client";
import React from "react";
import { X } from "lucide-react";

export default function CertificateQuickViewModal({ open, onClose, certificate }) {
  if (!open || !certificate) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center p-4 md:p-8">
      <div className="bg-white rounded-3xl shadow-lg max-w-lg w-full relative overflow-hidden flex flex-col p-6">
        {/* Close button */}
        <button onClick={onClose} className="absolute top-4 right-4 z-20 bg-gray-200 hover:bg-gray-300 rounded-full p-2 shadow-md">
          <X size={24} />
        </button>
        <div className="flex flex-col items-center">
          <img src={certificate.imageUrl || certificate.image} alt={certificate.title} className="w-72 h-72 object-contain rounded-2xl mb-4" />
          <div className="font-bold text-2xl mb-2 text-gray-900">{certificate.title}</div>
          {certificate.issueDate && <div className="text-md text-gray-700 mb-1"><span className="font-semibold">Issue Date:</span> {certificate.issueDate}</div>}
          {certificate.issuedBy && <div className="text-md text-gray-700 mb-1"><span className="font-semibold">Issued By:</span> {certificate.issuedBy}</div>}
          {certificate.specialization && <div className="text-md text-gray-700 mb-1"><span className="font-semibold">Specialization:</span> {certificate.specialization}</div>}
          {certificate.description && <div className="text-md text-gray-700 mb-1"><span className="font-semibold">Description:</span> {certificate.description}</div>}
        </div>
        <div className="flex justify-end pt-6">
          <button onClick={onClose} className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 shadow">Close</button>
        </div>
      </div>
    </div>
  );
}
