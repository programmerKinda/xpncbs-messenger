
import { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { type TooltipProps } from "../../models/tooltip";
export default function Tooltip({ ref,targetRef, children, onClose }: TooltipProps) {
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!targetRef) return;
    if (targetRef.current) {
      const rect = targetRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY, // снизу кнопки
        left: rect.left + window.scrollX,  // по левому краю
      });
    }
  }, [targetRef]);

  return ReactDOM.createPortal(
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      style={{
        position: "absolute",
        top: position.top,
        left: position.left,
        background: "white",
        border: "1px solid #ccc",
        padding: "5px",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      {children}
    </div>,
    document.body
  );
}