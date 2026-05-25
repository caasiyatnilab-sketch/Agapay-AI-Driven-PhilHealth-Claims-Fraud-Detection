'use client';
import QRCode from 'react-qr-code';

export default function QRCodeModal({ claimId, onClose }) {
  const verifyUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/verify/${claimId}`;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-8 max-w-sm w-full relative mx-auto shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 font-bold text-xl">&times;</button>
        <h3 className="text-xl font-bold text-center mb-6 text-gray-800">Claim Verification QR</h3>
        <div className="flex justify-center mb-6">
          <QRCode value={verifyUrl} size={200} />
        </div>
        <p className="text-center text-sm text-gray-600 break-all mb-4">{verifyUrl}</p>
        <div className="text-center">
            <a href={verifyUrl} target="_blank" rel="noopener noreferrer" className="text-phBlue hover:underline text-sm font-semibold">Open Verification Page</a>
        </div>
      </div>
    </div>
  );
}
