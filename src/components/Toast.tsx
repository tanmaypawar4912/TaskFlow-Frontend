import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';

type Props = { message: string; type?: 'success' | 'error' | 'info'; onClose: () => void };
export default function Toast({ message, type = 'success', onClose }: Props) {
  const Icon = type === 'success' ? CheckCircle2 : type === 'error' ? TriangleAlert : Info;
  return <div className={`toast ${type}`} role="status">
    <Icon size={18}/><span>{message}</span><button className="toast-close" onClick={onClose} aria-label="Dismiss notification"><X size={15}/></button>
  </div>;
}
