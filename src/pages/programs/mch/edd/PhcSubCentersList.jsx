import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MaterialIcon from '../../../../components/ui/MaterialIcon';

const PhcSubCentersList = ({ centers }) => {
    const navigate = useNavigate();
    const { monthId } = useParams(); // Need this context

    // centers prop is array of SC data
    // Fallback if missing
    const subCenters = centers || [
        { name: "Chilpur(SC)", total: 5, pending: 5, delivered: 0, aborted: 0 },
        { name: "Chinnapendyal(SC)", total: 6, pending: 6, delivered: 0, aborted: 0 },
        { name: "Kistajigudem (SC)", total: 8, pending: 8, delivered: 0, aborted: 0 },
        { name: "Malkapur(SC)", total: 5, pending: 5, delivered: 0, aborted: 0 },
        { name: "Nashkal(SC)", total: 7, pending: 7, delivered: 0, aborted: 0 },
        { name: "Pallagutta(SC)", total: 6, pending: 6, delivered: 0, aborted: 0 },
        { name: "Rajavaram(SC)", total: 8, pending: 8, delivered: 0, aborted: 0 },
        { name: "Sripathipally(SC)", total: 8, pending: 8, delivered: 0, aborted: 0 },
    ];

    const handleScClick = (scName) => {
        // Use encodeURIComponent to preserve exact name for DB query
        navigate(`/programs/mch/edd-vs-deliveries/${monthId}/${encodeURIComponent(scName)}`);
    };

    return (
        <div className="animate-enter" style={{ paddingTop: '10px' }}>
            {subCenters.map((sc, index) => (
                <div
                    key={index}
                    className='sc-card animate-pop'
                    style={{ animationDelay: `${index * 50}ms`, cursor: 'pointer' }}
                    onClick={() => handleScClick(sc.name)}
                >
                    <div className="sc-header">
                        <span className="sc-name">{index + 1}. {sc.name}</span>
                        <MaterialIcon name="chevron_right" size={20} className="sc-arrow" />
                    </div>

                    <div className="sc-stats-row">
                        <div className="sc-stat-col">
                            <span className="sc-val sc-c-blue">{sc.total}</span>
                            <span className="sc-lbl">Total</span>
                        </div>
                        <div className="sc-stat-col">
                            <span className="sc-val sc-c-yellow">{sc.pending}</span>
                            <span className="sc-lbl">Pending</span>
                        </div>
                        <div className="sc-stat-col">
                            <span className="sc-val sc-c-green">{sc.delivered}</span>
                            <span className="sc-lbl">Delivered</span>
                        </div>
                        <div className="sc-stat-col">
                            <span className="sc-val sc-c-red">{sc.aborted}</span>
                            <span className="sc-lbl">Aborted</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PhcSubCentersList;
