// by shak6

import { useEffect } from 'react';
import Swal from 'sweetalert2';

interface ErrorPopupProps {
  open: boolean;
  message: string;
  title?: string;
  onClose?: () => void;
}

export const ErrorPopup: React.FC<ErrorPopupProps> = ({ open, message, title = 'Error', onClose }) => {
  useEffect(() => {
    if (open) {
      Swal.fire({
        icon: 'error',
        title: `<span style="color:#D7263D; font-weight:bold;">${title}</span>`,
        html: `<div style="font-size:1.1em; color:#222; font-family:sans-serif;">${message}</div>`,
        confirmButtonColor: '#d7263d',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        customClass: {
          popup: 'my-swal-popup',
          confirmButton: 'my-swal-confirm',
          title: 'my-swal-title',
        },
        didClose: () => {
          if (onClose) onClose();
        },
      });
    }
  }, [open, message, title, onClose]);

  return null;
};
