import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import PageHeader from '../../../components/ui/PageHeader';
import MaterialIcon from '../../../components/ui/MaterialIcon';
import './AncEditRecord.css';

const AncEditRecord = () => {
    // URL Params
    const { monthId, subCenterId, recordId } = useParams();

    // Mock Data based on screenshot (Aluri Pravalika)
    const [formData, setFormData] = useState({
        name: "Aluri Pravalika",
        phone: "9381939653",
        husbandName: "",
        village: "",
        subCenter: "Chilpur(SC)"
    });

    const [currentStep, setCurrentStep] = useState(1); // 1: Basic, 2: History, 3: Current, 4: ASHA

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="home-wrapper animate-enter">
            <PageHeader
                title="Edit Record"
                backPath={`/programs/mch/edd-vs-deliveries/${monthId}/${subCenterId}`}
            />

            <div className="edit-record-wrapper">
                {/* --- STEPPER --- */}
                <div className="stepper-container">
                    {/* Step 1: Basic */}
                    <div className={`step-item ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
                        <div className="step-circle">
                            {currentStep > 1 ? <MaterialIcon name="check" size={16} /> : '1'}
                        </div>
                        <span className="step-label">Basic</span>
                    </div>
                    <div className={`step-line ${currentStep > 1 ? 'active' : ''}`}></div>

                    {/* Step 2: History */}
                    <div className={`step-item ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
                        <div className="step-circle">
                            {currentStep > 2 ? <MaterialIcon name="check" size={16} /> : '2'}
                        </div>
                        <span className="step-label">History</span>
                    </div>
                    <div className={`step-line ${currentStep > 2 ? 'active' : ''}`}></div>

                    {/* Step 3: Current */}
                    <div className={`step-item ${currentStep >= 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}>
                        <div className="step-circle">
                            {currentStep > 3 ? <MaterialIcon name="check" size={16} /> : '3'}
                        </div>
                        <span className="step-label">Current</span>
                    </div>
                    <div className={`step-line ${currentStep > 3 ? 'active' : ''}`}></div>


                    {/* Step 4: ASHA */}
                    <div className={`step-item ${currentStep >= 4 ? 'active' : ''}`}>
                        <div className="step-circle">
                            {currentStep > 4 ? <MaterialIcon name="check" size={16} /> : <MaterialIcon name="check" size={16} />}
                        </div>
                        <span className="step-label">ASHA</span>
                    </div>
                </div>

                {/* --- FORM CONTENT --- */}
                <div className="form-section animate-pop delay-100">

                    <div className="form-group">
                        <label className="input-label">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            className="neu-input-dark readonly"
                            readOnly
                        />
                    </div>

                    <div className="form-group">
                        <label className="input-label">Phone</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="neu-input-dark"
                        />
                    </div>

                    <div className="form-group">
                        <label className="input-label">Husband Name</label>
                        <input
                            type="text"
                            name="husbandName"
                            value={formData.husbandName}
                            onChange={handleChange}
                            className="neu-input-dark"
                            placeholder=""
                        />
                    </div>

                    <div className="form-group">
                        <label className="input-label">Village</label>
                        <input
                            type="text"
                            name="village"
                            value={formData.village}
                            onChange={handleChange}
                            className="neu-input-dark"
                            placeholder=""
                        />
                    </div>

                    <div className="form-group">
                        <label className="input-label">Sub Center</label>
                        <input
                            type="text"
                            name="subCenter"
                            value={formData.subCenter}
                            className="neu-input-dark readonly"
                            readOnly
                        />
                    </div>

                    <p className="helper-text">Name and Sub Center are read-only.</p>

                    <button className="next-btn">Next</button>

                </div>
            </div>
        </div>
    );
};

export default AncEditRecord;
