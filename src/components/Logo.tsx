import { CheckSquare2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Logo({ compact = false }: { compact?: boolean }) {
  return <Link className="logo" to="/dashboard" aria-label="TaskFlow dashboard">
    <span className="logo-mark"><CheckSquare2 size={19}/></span>
    {!compact && <span>Task<span>Flow</span></span>}
  </Link>;
}
