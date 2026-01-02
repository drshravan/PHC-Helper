import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PageHeader from '../../../../components/ui/PageHeader';
import PhcSubCentersList from './PhcSubCentersList';

const SubCentersListPage = () => {
    const { monthId } = useParams();
    const [subCenters, setSubCenters] = useState([]);
    const [loading, setLoading] = useState(true);

    // Format title
    const formatTitle = (id) => {
        if (!id) return "JAN 2026";
        const parts = id.split('-');
        return `${parts[0].toUpperCase()} ${parts[1]}`;
    };

    const title = formatTitle(monthId);

    useEffect(() => {
        const fetchSubCenters = async () => {
            setLoading(true);
            try {
                const { db } = await import('../../../../firebase');
                const { collection, query, where, getDocs } = await import('firebase/firestore');

                const q = query(
                    collection(db, "anc_records"),
                    where("monthGroup", "==", monthId)
                );

                const snap = await getDocs(q);
                const scData = {};

                snap.forEach(doc => {
                    const r = doc.data();
                    const sc = r.subCenter || "Unknown";
                    if (!scData[sc]) {
                        scData[sc] = { name: sc, total: 0, pending: 0, delivered: 0, aborted: 0 };
                    }
                    scData[sc].total++;
                    if (r.deliveryStatus === 'Pending') scData[sc].pending++;
                    if (r.deliveryStatus === 'Delivered') scData[sc].delivered++;
                    if (r.deliveryStatus === 'Aborted') scData[sc].aborted++;
                });

                const scList = Object.values(scData);
                setSubCenters(scList);
            } catch (err) {
                console.error("Error fetching sub-centers:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchSubCenters();
    }, [monthId]);

    return (
        <div className="home-wrapper phc-wrapper">
            <PageHeader
                title="Sub-Centers"
                subtitle={title}
                backPath={`/programs/mch/edd-vs-deliveries/${monthId}`}
            />

            <div className="phc-content animate-enter">
                {loading ? (
                    <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-secondary)' }}>
                        <div className="spinner" style={{ margin: '0 auto 20px' }}></div>
                        <p>Loading sub-centers...</p>
                    </div>
                ) : (
                    <PhcSubCentersList centers={subCenters} />
                )}
            </div>
        </div>
    );
};

export default SubCentersListPage;
