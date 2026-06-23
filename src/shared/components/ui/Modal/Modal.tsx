// TODO: Implement Modal
// Props:
//   isOpen: boolean
//   onClose: () => void
//   title?: string
//   size?: 'sm' | 'md' | 'lg' | 'xl'
//   children?: React.ReactNode

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
}

export default function Modal(_props: ModalProps) {
  // TODO: dùng createPortal để render ra ngoài #root
  return null;
}
