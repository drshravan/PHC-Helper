import React from 'react';
import { useNavigate } from 'react-router-dom';
import MaterialIcon from './MaterialIcon';

const PageHeader = ({ title, subtitle, backPath, onBack }) => {
    const navigate = useNavigate();

    const handleBack = () => {
        if (onBack) {
            onBack();
            return;
        }
        if (backPath) {
            navigate(backPath);
        } else {
            navigate(-1);
        }
    };

    return (
        <header className="page-header" style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
            <button
                onClick={handleBack}
                className="neu-btn"
                style={{
                    padding: 0,
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                }}
                aria-label="Go Back"
            >
                <MaterialIcon name="arrow_back" size={24} />
            </button>
            <div style={{ marginLeft: '20px' }}>
                <h2 className="text-h2" style={{ margin: 0, lineHeight: 1.2 }}>{title}</h2>
                {subtitle && <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>{subtitle}</p>}
            </div>
        </header>
    );
};

export default PageHeader;
