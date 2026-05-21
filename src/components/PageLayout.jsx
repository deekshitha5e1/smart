import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PageLayout = ({ title, backPath, children }) => {
  const navigate = useNavigate();
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <button 
        onClick={() => navigate(backPath)} 
        style={{ border: 'none', background: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '1rem', color: 'var(--text-light)' }}
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </button>
      <h2 style={{ color: 'var(--text-dark)' }}>{title}</h2>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', marginTop: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        {children}
      </div>
    </div>
  );
};

export default PageLayout;
