import { doc, increment } from 'firebase/firestore';

export const getMonthGroup = (dateString, deliveryStatus = 'Pending', abortedDate = null, deliveredDate = null) => {
    // If aborted, use abortedDate
    if (deliveryStatus === 'Aborted' && abortedDate) {
        return formatDateToMonthGroup(abortedDate);
    }
    // If delivered, use deliveredDate
    if (deliveryStatus === 'Delivered' && deliveredDate) {
        return formatDateToMonthGroup(deliveredDate);
    }
    // Fallback to EDD
    if (dateString) {
        return formatDateToMonthGroup(dateString);
    }
    return null;
};

const formatDateToMonthGroup = (dateStr) => {
    try {
        const d = new Date(dateStr);
        if (isNaN(d)) return null;
        const month = d.toLocaleString('default', { month: 'short' }).toLowerCase();
        const year = d.getFullYear();
        return `${month}-${year}`;
    } catch (e) {
        return null;
    }
};

/**
 * Calculates the delta for stats based on old and new record state.
 * Pass null for oldRecord if creating.
 * Pass null for newRecord if deleting.
 */
export const getStatUpdates = (oldRecord, newRecord) => {
    const delta = {
        total: 0,
        pending: 0,
        delivered: 0,
        aborted: 0,
        normal: 0,
        lscs: 0,
        govt: 0,
        pvt: 0,
        highRisk: 0
    };

    const process = (rec, multiplier) => {
        if (!rec) return;

        delta.total += 1 * multiplier;

        const status = rec.deliveryStatus || 'Pending';
        if (status === 'Pending') delta.pending += 1 * multiplier;
        else if (status === 'Delivered') delta.delivered += 1 * multiplier;
        else if (status === 'Aborted') delta.aborted += 1 * multiplier;

        if (status === 'Delivered') {
            const mode = rec.deliveryMode || 'Normal';
            if (mode === 'Normal') delta.normal += 1 * multiplier;
            else if (mode === 'LSCS') delta.lscs += 1 * multiplier;

            const fac = (rec.facilityType || '').toLowerCase();
            if (fac === 'govt' || fac === 'government') delta.govt += 1 * multiplier;
            else if (fac === 'pvt' || fac === 'private') delta.pvt += 1 * multiplier;
        }

        if (rec.isHighRisk === true || rec.isHighRisk === 'Yes') {
            delta.highRisk += 1 * multiplier;
        }
    };

    process(oldRecord, -1); // Remove old stats
    process(newRecord, 1);  // Add new stats

    return delta;
};

/**
 * Updates the summary document transactionally.
 * @param {object} transaction - Firestore transaction object
 * @param {object} db - Firestore instance
 * @param {string} monthGroup - e.g. "jan-2026"
 * @param {object} delta - The delta object from getStatUpdates
 */
export const updateMonthlySummary = async (transaction, db, monthGroup, delta) => {
    if (!monthGroup) return;

    const summaryRef = doc(db, 'anc_monthly_summaries', monthGroup);
    const summarySnap = await transaction.get(summaryRef);

    // Filter out zero updates to avoid unnecessary writes if possible (though we likely have some)
    const validUpdates = {};
    let hasUpdates = false;
    Object.keys(delta).forEach(key => {
        if (delta[key] !== 0) {
            validUpdates[key] = increment(delta[key]);
            hasUpdates = true;
        }
    });

    if (!summarySnap.exists()) {
        const [m, y] = monthGroup.split('-');
        const cleanTitle = m.charAt(0).toUpperCase() + m.slice(1) + " " + y;

        // Create approximate sortDate (1st of the month)
        const sortDate = new Date(`${m} 1, ${y}`).getTime();

        const initialData = {
            id: monthGroup,
            title: cleanTitle,
            sortDate: isNaN(sortDate) ? Date.now() : sortDate,
            total: 0,
            pending: 0,
            delivered: 0,
            aborted: 0,
            normal: 0,
            lscs: 0,
            govt: 0,
            pvt: 0,
            highRisk: 0,
            ...delta // Directly apply delta as initial values
        };

        // Ensure no negatives in initial
        Object.keys(initialData).forEach(k => {
            if (typeof initialData[k] === 'number' && initialData[k] < 0) initialData[k] = 0;
        });

        transaction.set(summaryRef, initialData);
    } else {
        if (hasUpdates) {
            transaction.update(summaryRef, validUpdates);
        }
    }
};
