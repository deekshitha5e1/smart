import React from 'react';
import { useNavigate } from 'react-router-dom';

const ModuleCard = ({ mod }) => {
  const navigate = useNavigate();
  const Icon = mod.icon;
  
  return (
    <div 
      onClick={() => navigate(mod.path)}
      style={{ 
        background: mod.highlight ? 'linear-gradient(to right bottom, #ffffff, #f3e8ff)' : 'white', 
        padding: '2rem', 
        borderRadius: '16px', 
        boxShadow: mod.highlight ? '0 4px 15px rgba(139, 92, 246, 0.15)' : '0 4px 6px -1px rgba(0,0,0,0.05)', 
        border: mod.highlight ? '2px solid #a78bfa' : '1px solid #f1f5f9',
        cursor: 'pointer', 
        transition: 'transform 0.2s, box-shadow 0.2s',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)';
      }}
    >
      <div style={{ background: `${mod.color}15`, padding: '1rem', borderRadius: '12px', display: 'inline-block', color: mod.color, marginBottom: '1.5rem' }}>
        <Icon size={32} />
      </div>
      <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', color: 'var(--text-dark)' }}>{mod.title}</h3>
      <p style={{ margin: 0, color: 'var(--text-light)', fontSize: '0.9rem' }}>{mod.desc}</p>
    </div>
  );
};

export default ModuleCard;
