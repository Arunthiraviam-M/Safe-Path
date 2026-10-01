import React, { useEffect, useState } from "react";
import { FiAlertTriangle } from "react-icons/fi";

const SOSButton = () => {
  const [confirming, setConfirming] = useState(false);
  const [count, setCount] = useState(3);
  const [activated, setActivated] = useState(false);

  useEffect(() => {
    if (!confirming) return;
    if (count === 0) {
      setActivated(true);
      setConfirming(false);
      return;
    }
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [confirming, count]);

  const startConfirm = () => {
    setCount(3);
    setConfirming(true);
  };

  const cancel = () => {
    setConfirming(false);
    setCount(3);
  };

  return (
    <>
      <button
        onClick={startConfirm}
        className="fixed bottom-6 right-6 z-[9999] bg-accent-red hover:bg-red-600 text-white rounded-full w-16 h-16 shadow-lg shadow-red-500/30 flex flex-col items-center justify-center font-bold"
      >
        <FiAlertTriangle size={20} />
        <span className="text-[10px] mt-0.5">SOS</span>
      </button>

      {confirming && (
        <div className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center">
          <div className="glass rounded-2xl p-8 text-center w-80">
            <p className="text-white/80 mb-4">Sending SOS alert in</p>
            <div className="text-6xl font-display font-bold text-accent-red mb-6">{count}</div>
            <button
              onClick={cancel}
              className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {activated && (
        <div className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center">
          <div className="glass rounded-2xl p-8 text-center w-80 border-accent-red/40">
            <FiAlertTriangle className="mx-auto text-accent-red mb-3" size={36} />
            <p className="text-lg font-semibold mb-1">SOS Activated</p>
            <p className="text-white/60 text-sm mb-6">
              Your trusted contacts would be notified with your live location.
            </p>
            <button
              onClick={() => setActivated(false)}
              className="w-full py-3 rounded-xl bg-accent-red hover:bg-red-600 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SOSButton;
