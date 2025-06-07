import { useEffect } from "react";
import Swal from "sweetalert2";

interface ErrorPopupProps {
  open: boolean;
  message: string;
  title?: string;
  onClose?: () => void;
}

export const ErrorPopup: React.FC<ErrorPopupProps> = ({
  open,
  message,
  title = "Error",
  onClose,
}) => {
  useEffect(() => {
    if (open) {
      Swal.fire({
        icon: "error",
        title,
        text: message,
        confirmButtonColor: "#d33",
        didClose: () => {
          if (onClose) onClose();
        },
      });
    }
  }, [open, message, title, onClose]);

  return null;
};
