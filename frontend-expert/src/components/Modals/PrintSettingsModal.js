import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import { Button } from "../Form";
import Switch from "react-switch";
import { FiThumbsUp } from "react-icons/fi";

function PrintSettingsModal({ closeModal, isOpen, printSettings, onApply }) {
    const [localSettings, setLocalSettings] = useState(printSettings);

    useEffect(() => {
        setLocalSettings(printSettings);
    }, [printSettings, isOpen]);

    const handleSectionToggle = (section) => {
        setLocalSettings(prev => ({
            ...prev,
            sections: {
                ...prev.sections,
                [section]: !prev.sections[section]
            }
        }));
    };

    const handlePatientFormToggle = () => {
        setLocalSettings(prev => ({
            ...prev,
            patientForm: {
                ...prev.patientForm,
                enabled: !prev.patientForm.enabled
            }
        }));
    };

    const handlePatientFieldToggle = (field) => {
        setLocalSettings(prev => ({
            ...prev,
            patientForm: {
                ...prev.patientForm,
                [field]: !prev.patientForm[field]
            }
        }));
    };

    const handleMedicationToggle = () => {
        setLocalSettings(prev => ({
            ...prev,
            medications: {
                ...prev.medications,
                enabled: !prev.medications.enabled
            }
        }));
    };

    const handleMedicationFieldToggle = (field) => {
        setLocalSettings(prev => ({
            ...prev,
            medications: {
                ...prev.medications,
                [field]: !prev.medications[field]
            }
        }));
    };

    const handleDiagnosisToggle = () => {
        setLocalSettings(prev => ({
            ...prev,
            diagnosis: {
                ...prev.diagnosis,
                enabled: !prev.diagnosis.enabled
            }
        }));
    };

    const handleDiagnosisFieldToggle = (field) => {
        setLocalSettings(prev => ({
            ...prev,
            diagnosis: {
                ...prev.diagnosis,
                [field]: !prev.diagnosis[field]
            }
        }));
    };

    const handleSymptomsToggle = () => {
        setLocalSettings(prev => ({
            ...prev,
            symptoms: {
                ...prev.symptoms,
                enabled: !prev.symptoms.enabled
            }
        }));
    };

    const handleSymptomsFieldToggle = (field) => {
        setLocalSettings(prev => ({
            ...prev,
            symptoms: {
                ...prev.symptoms,
                [field]: !prev.symptoms[field]
            }
        }));
    };

    const handleApplyChanges = () => {
        onApply(localSettings);
        closeModal();
    };

    return (
        <Modal
            closeModal={closeModal}
            isOpen={isOpen}
            title='Print Settings'
            width={"max-w-2xl"}
            showCloseButton={true}
        >
            <div className='flex flex-col gap-4'>
                <div className='flex items-center gap-2 text-sm text-gray-600 mb-2'>
                    <FiThumbsUp className='text-lg' />
                    <span>Items selected below would be part of Prescription</span>
                </div>

                <div className='max-h-[500px] overflow-y-auto pr-2'>
                    <div className='flex flex-col gap-3'>

                        <div className='bg-gray-50 rounded-lg p-4'>
                            <div className='flex items-center justify-between'>
                                <span className='text-sm font-medium text-gray-700'>Custom Section</span>
                                <Switch
                                    checked={localSettings.customSection?.enabled}
                                    onChange={() => setLocalSettings(prev => ({
                                        ...prev,
                                        customSection: {
                                            ...prev.customSection,
                                            enabled: !prev.customSection?.enabled
                                        }
                                    }))}
                                    onColor='#0097DB'
                                    offColor='#ccc'
                                    height={24}
                                    width={48}
                                    handleDiameter={20}
                                    uncheckedIcon={false}
                                    checkedIcon={false}
                                />
                            </div>
                        </div>

                        <div className='bg-gray-50 rounded-lg p-4'>
                            <div className='flex items-center justify-between'>
                                <span className='text-sm font-medium text-gray-700'>Examinations</span>
                                <Switch
                                    checked={localSettings.sections?.vitals}
                                    onChange={() => handleSectionToggle('vitals')}
                                    onColor='#0097DB'
                                    offColor='#ccc'
                                    height={24}
                                    width={48}
                                    handleDiameter={20}
                                    uncheckedIcon={false}
                                    checkedIcon={false}
                                />
                            </div>
                        </div>

                        <div className='bg-gray-50 rounded-lg p-4'>
                            <div className='flex items-center justify-between mb-3'>
                                <span className='text-sm font-medium text-gray-700'>Diagnosis</span>
                                <Switch
                                    checked={localSettings.sections?.diagnosis}
                                    onChange={() => handleSectionToggle('diagnosis')}
                                    onColor='#0097DB'
                                    offColor='#ccc'
                                    height={24}
                                    width={48}
                                    handleDiameter={20}
                                    uncheckedIcon={false}
                                    checkedIcon={false}
                                />
                            </div>
                            {localSettings.sections?.diagnosis && (
                                <div className='ml-4 flex flex-col gap-2'>
                                    <label className='flex items-center gap-2 cursor-pointer'>
                                        <input
                                            type='checkbox'
                                            checked={localSettings.diagnosis?.properties}
                                            onChange={() => handleDiagnosisFieldToggle('properties')}
                                            className='w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500'
                                        />
                                        <span className='text-sm text-gray-600'>Properties</span>
                                    </label>
                                    <label className='flex items-center gap-2 cursor-pointer'>
                                        <input
                                            type='checkbox'
                                            checked={localSettings.diagnosis?.hidePropertyHeaders}
                                            onChange={() => handleDiagnosisFieldToggle('hidePropertyHeaders')}
                                            className='w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500'
                                        />
                                        <span className='text-sm text-gray-600'>Hide Property Headers</span>
                                    </label>
                                </div>
                            )}
                        </div>

                        <div className='bg-gray-50 rounded-lg p-4'>
                            <div className='flex items-center justify-between mb-3'>
                                <span className='text-sm font-medium text-gray-700'>Symptoms</span>
                                <Switch
                                    checked={localSettings.sections?.symptoms}
                                    onChange={() => handleSectionToggle('symptoms')}
                                    onColor='#0097DB'
                                    offColor='#ccc'
                                    height={24}
                                    width={48}
                                    handleDiameter={20}
                                    uncheckedIcon={false}
                                    checkedIcon={false}
                                />
                            </div>
                            {localSettings.sections?.symptoms && (
                                <div className='ml-4 flex flex-col gap-2'>
                                    <label className='flex items-center gap-2 cursor-pointer'>
                                        <input
                                            type='checkbox'
                                            checked={localSettings.symptoms?.properties}
                                            onChange={() => handleSymptomsFieldToggle('properties')}
                                            className='w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500'
                                        />
                                        <span className='text-sm text-gray-600'>Properties</span>
                                    </label>
                                    <label className='flex items-center gap-2 cursor-pointer'>
                                        <input
                                            type='checkbox'
                                            checked={localSettings.symptoms?.hidePropertyHeaders}
                                            onChange={() => handleSymptomsFieldToggle('hidePropertyHeaders')}
                                            className='w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500'
                                        />
                                        <span className='text-sm text-gray-600'>Hide Property Headers</span>
                                    </label>
                                </div>
                            )}
                        </div>

                        <div className='bg-gray-50 rounded-lg p-4'>
                            <div className='flex items-center justify-between mb-3'>
                                <span className='text-sm font-medium text-gray-700'>Medications</span>
                                <Switch
                                    checked={localSettings.sections?.medications}
                                    onChange={() => handleSectionToggle('medications')}
                                    onColor='#0097DB'
                                    offColor='#ccc'
                                    height={24}
                                    width={48}
                                    handleDiameter={20}
                                    uncheckedIcon={false}
                                    checkedIcon={false}
                                />
                            </div>
                            {localSettings.sections?.medications && (
                                <div className='ml-4 flex flex-col gap-2'>
                                    <label className='flex items-center gap-2 cursor-pointer'>
                                        <input
                                            type='checkbox'
                                            checked={localSettings.medications?.genericName}
                                            onChange={() => handleMedicationFieldToggle('genericName')}
                                            className='w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500'
                                        />
                                        <span className='text-sm text-gray-600'>Generic Name</span>
                                    </label>
                                    <label className='flex items-center gap-2 cursor-pointer'>
                                        <input
                                            type='checkbox'
                                            checked={localSettings.medications?.productType}
                                            onChange={() => handleMedicationFieldToggle('productType')}
                                            className='w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500'
                                        />
                                        <span className='text-sm text-gray-600'>Product Type</span>
                                    </label>
                                    <label className='flex items-center gap-2 cursor-pointer'>
                                        <input
                                            type='checkbox'
                                            checked={!localSettings.medications?.brandName}
                                            onChange={() => handleMedicationFieldToggle('brandName')}
                                            className='w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500'
                                        />
                                        <span className='text-sm text-gray-600'>Hide Brand Name</span>
                                    </label>
                                    <label className='flex items-center gap-2 cursor-pointer'>
                                        <input
                                            type='checkbox'
                                            checked={localSettings.medications?.composition}
                                            onChange={() => handleMedicationFieldToggle('composition')}
                                            className='w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500'
                                        />
                                        <span className='text-sm text-gray-600'>Composition</span>
                                    </label>
                                    <label className='flex items-center gap-2 cursor-pointer'>
                                        <input
                                            type='checkbox'
                                            checked={localSettings.medications?.frequency}
                                            onChange={() => handleMedicationFieldToggle('frequency')}
                                            className='w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500'
                                        />
                                        <span className='text-sm text-gray-600'>Frequency</span>
                                    </label>
                                    <label className='flex items-center gap-2 cursor-pointer'>
                                        <input
                                            type='checkbox'
                                            checked={localSettings.medications?.timing}
                                            onChange={() => handleMedicationFieldToggle('timing')}
                                            className='w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500'
                                        />
                                        <span className='text-sm text-gray-600'>Timing</span>
                                    </label>
                                    <label className='flex items-center gap-2 cursor-pointer'>
                                        <input
                                            type='checkbox'
                                            checked={localSettings.medications?.duration}
                                            onChange={() => handleMedicationFieldToggle('duration')}
                                            className='w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500'
                                        />
                                        <span className='text-sm text-gray-600'>Duration</span>
                                    </label>
                                    <label className='flex items-center gap-2 cursor-pointer'>
                                        <input
                                            type='checkbox'
                                            checked={localSettings.medications?.route}
                                            onChange={() => handleMedicationFieldToggle('route')}
                                            className='w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500'
                                        />
                                        <span className='text-sm text-gray-600'>Route</span>
                                    </label>
                                </div>
                            )}
                        </div>

                        <div className='bg-gray-50 rounded-lg p-4'>
                            <div className='flex items-center justify-between'>
                                <span className='text-sm font-medium text-gray-700'>Diagnosis Tests</span>
                                <Switch
                                    checked={localSettings.sections?.diagnosisTests}
                                    onChange={() => handleSectionToggle('diagnosisTests')}
                                    onColor='#0097DB'
                                    offColor='#ccc'
                                    height={24}
                                    width={48}
                                    handleDiameter={20}
                                    uncheckedIcon={false}
                                    checkedIcon={false}
                                />
                            </div>
                        </div>

                        <div className='bg-gray-50 rounded-lg p-4'>
                            <div className='flex items-center justify-between'>
                                <span className='text-sm font-medium text-gray-700'>Notes for Patient</span>
                                <Switch
                                    checked={localSettings.sections?.notes}
                                    onChange={() => handleSectionToggle('notes')}
                                    onColor='#0097DB'
                                    offColor='#ccc'
                                    height={24}
                                    width={48}
                                    handleDiameter={20}
                                    uncheckedIcon={false}
                                    checkedIcon={false}
                                />
                            </div>
                        </div>

                        <div className='bg-gray-50 rounded-lg p-4'>
                            <div className='flex items-center justify-between mb-3'>
                                <span className='text-sm font-medium text-gray-700'>Patient Form</span>
                                <Switch
                                    checked={localSettings.patientForm?.enabled}
                                    onChange={handlePatientFormToggle}
                                    onColor='#0097DB'
                                    offColor='#ccc'
                                    height={24}
                                    width={48}
                                    handleDiameter={20}
                                    uncheckedIcon={false}
                                    checkedIcon={false}
                                />
                            </div>
                            {localSettings.patientForm?.enabled && (
                                <div className='ml-4 flex flex-col gap-2'>
                                    <label className='flex items-center gap-2 cursor-pointer'>
                                        <input
                                            type='checkbox'
                                            checked={localSettings.patientForm?.age}
                                            onChange={() => handlePatientFieldToggle('age')}
                                            className='w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500'
                                        />
                                        <span className='text-sm text-gray-600'>Age</span>
                                    </label>
                                    <label className='flex items-center gap-2 cursor-pointer'>
                                        <input
                                            type='checkbox'
                                            checked={localSettings.patientForm?.mobileNumber}
                                            onChange={() => handlePatientFieldToggle('mobileNumber')}
                                            className='w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500'
                                        />
                                        <span className='text-sm text-gray-600'>Mobile Number</span>
                                    </label>
                                    <label className='flex items-center gap-2 cursor-pointer'>
                                        <input
                                            type='checkbox'
                                            checked={localSettings.patientForm?.gender}
                                            onChange={() => handlePatientFieldToggle('gender')}
                                            className='w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500'
                                        />
                                        <span className='text-sm text-gray-600'>Gender</span>
                                    </label>
                                    <label className='flex items-center gap-2 cursor-pointer'>
                                        <input
                                            type='checkbox'
                                            checked={localSettings.patientForm?.uhid}
                                            onChange={() => handlePatientFieldToggle('uhid')}
                                            className='w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500'
                                        />
                                        <span className='text-sm text-gray-600'>UHID</span>
                                    </label>
                                    <label className='flex items-center gap-2 cursor-pointer'>
                                        <input
                                            type='checkbox'
                                            checked={localSettings.patientForm?.patientAddress}
                                            onChange={() => handlePatientFieldToggle('patientAddress')}
                                            className='w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500'
                                        />
                                        <span className='text-sm text-gray-600'>Patient Address</span>
                                    </label>
                                    <label className='flex items-center gap-2 cursor-pointer'>
                                        <input
                                            type='checkbox'
                                            checked={localSettings.patientForm?.city}
                                            onChange={() => handlePatientFieldToggle('city')}
                                            className='w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500'
                                        />
                                        <span className='text-sm text-gray-600'>City</span>
                                    </label>
                                    <label className='flex items-center gap-2 cursor-pointer'>
                                        <input
                                            type='checkbox'
                                            checked={localSettings.patientForm?.pincode}
                                            onChange={() => handlePatientFieldToggle('pincode')}
                                            className='w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500'
                                        />
                                        <span className='text-sm text-gray-600'>Pincode</span>
                                    </label>
                                    <label className='flex items-center gap-2 cursor-pointer'>
                                        <input
                                            type='checkbox'
                                            checked={localSettings.patientForm?.mailId}
                                            onChange={() => handlePatientFieldToggle('mailId')}
                                            className='w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500'
                                        />
                                        <span className='text-sm text-gray-600'>Mail ID</span>
                                    </label>
                                </div>
                            )}
                        </div>

                        <div className='bg-gray-50 rounded-lg p-4'>
                            <div className='flex items-center justify-between'>
                                <span className='text-sm font-medium text-gray-700'>Advice</span>
                                <Switch
                                    checked={localSettings.sections?.advice}
                                    onChange={() => handleSectionToggle('advice')}
                                    onColor='#0097DB'
                                    offColor='#ccc'
                                    height={24}
                                    width={48}
                                    handleDiameter={20}
                                    uncheckedIcon={false}
                                    checkedIcon={false}
                                />
                            </div>
                        </div>

                        <div className='bg-gray-50 rounded-lg p-4'>
                            <div className='flex items-center justify-between'>
                                <span className='text-sm font-medium text-gray-700'>Follow Up</span>
                                <Switch
                                    checked={localSettings.sections?.followUp}
                                    onChange={() => handleSectionToggle('followUp')}
                                    onColor='#0097DB'
                                    offColor='#ccc'
                                    height={24}
                                    width={48}
                                    handleDiameter={20}
                                    uncheckedIcon={false}
                                    checkedIcon={false}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className='border-t pt-4 mt-4'>
                    <div className='flex items-center justify-between'>
                        <p className='text-xs text-gray-500'>
                            Changes made to Print Settings would be applicable to all future prescriptions.
                        </p>
                        <Button
                            label='Save as Default'
                            onClick={handleApplyChanges}
                            className='bg-subMain text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors'
                        />
                    </div>
                </div>
            </div>
        </Modal>
    );
}

export default PrintSettingsModal;
