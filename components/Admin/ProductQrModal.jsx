import React, { useRef } from 'react';
import QRCode from 'react-qr-code';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '../ui/dialog';

export default function ProductQrModal({ open, onOpenChange, qrUrl, productTitle }) {
  const qrRef = useRef();

  // Download QR code as PNG
  const handleDownload = () => {
    const svg = qrRef.current.querySelector('svg');
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const canvas = document.createElement('canvas');
    const img = new window.Image();
    img.onload = function () {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = pngFile;
      a.download = `${productTitle || 'product'}-qr.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };
    img.src = 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(svgString)));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col items-center max-w-md">
        <DialogHeader>
          <DialogTitle>Product QR Code</DialogTitle>
          <DialogDescription>
            Scan or download this QR to share the product page.
          </DialogDescription>
        </DialogHeader>
        <div ref={qrRef} className="my-4 bg-white p-4 rounded-md">
          <QRCode value={qrUrl} size={192} />
        </div>
        <DialogFooter className="w-full flex flex-col gap-2">
          <Button onClick={handleDownload} className="w-full bg-blue-600 hover:bg-blue-700 text-white">Download QR</Button>
          <DialogClose asChild>
            <Button variant="outline" className="w-full">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
