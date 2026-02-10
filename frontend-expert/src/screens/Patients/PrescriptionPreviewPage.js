import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import PrescriptionPreview from "./PrescriptionPreview";
import { useDoctorAuthStore } from "../../store/useDoctorAuthStore";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { toast } from "react-hot-toast";
import Layout from "../../Layout";

const PrescriptionPreviewPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { recordId } = useParams();
  const { doctor } = useDoctorAuthStore();
  const [loading, setLoading] = useState(true);
  const [recordData, setRecordData] = useState(null);

  useEffect(() => {
    // Try to get record from navigation state first
    const recordFromState = location.state?.record;
    const patientFromState = location.state?.patient;

    if (recordFromState) {
      // Transform the record to match PrescriptionPreview format
      const transformedData = transformRecordToPreviewFormat(recordFromState, patientFromState);
      setRecordData(transformedData);
      setLoading(false);
    } else if (recordId) {
      // If no state, try to fetch by recordId
      fetchRecordById(recordId);
    } else {
      toast.error("No record data available");
      setLoading(false);
      navigate(-1);
    }
  }, [recordId, location.state]);

  const fetchRecordById = async (id) => {
    try {
      // Try to fetch the record - you may need to adjust this endpoint
      // based on your backend API structure
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/medical-record/${id}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      const result = await response.json();
      if (response.ok && result.data) {
        const transformedData = transformRecordToPreviewFormat(result.data, result.data.patientId);
        setRecordData(transformedData);
      } else {
        toast.error("Record not found");
        navigate(-1);
      }
    } catch (error) {
      console.error("Error fetching record:", error);
      toast.error("Failed to load record");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const transformRecordToPreviewFormat = (record, patientData = null) => {
    // Extract patient data - prioritize passed patient data, then record.patientId, then fallback
    const patient = patientData || record.patientId || record.patient || {
      fullName: record.fullName || "Patient Name",
      uhid: record.uhid || record.patientId?._id || record.patientId || "",
      age: record.age || patientData?.age || "",
      gender: record.gender || patientData?.gender || "",
      phone: record.phone || record.mobileNumber || patientData?.contactDetails?.primaryContact || "",
      email: record.email || patientData?.contactDetails?.email || "",
    };

    // Transform complaints
    const complaints = Array.isArray(record.complaints)
      ? record.complaints.map((c) => ({
        name: c.name || c,
        isChecked: true,
      }))
      : [];

    // Transform symptoms
    const symptoms = Array.isArray(record.symptoms)
      ? record.symptoms.map((s) => ({
        name: s.name || s,
        isChecked: true,
      }))
      : [];

    // Transform diagnosis
    const diagnosis = Array.isArray(record.diagnosis)
      ? record.diagnosis.map((d) => ({
        name: d.name || d,
        isChecked: true,
      }))
      : [];

    // Transform diagnosis tests 
    const diagnosisTests = Array.isArray(record.diagnosisTests)
      ? record.diagnosisTests.map((d) => ({
        name: typeof d === "string" ? d : d.name,
        isChecked: true,
      }))
      : [];


    // Transform medications
    const medications = Array.isArray(record.medications)
      ? record.medications.map((m) => ({
        name: m.name || m,
        composition: m.composition || "",
        frequency: m.frequency || "",
        timing: m.timing || "",
        duration: m.duration || "",
        quantity: m.quantity || 1,
        route: m.route || "",
        instruction: m.instruction || "",
      }))
      : [];

    // Transform advices
    const advices = Array.isArray(record.advices)
      ? record.advices.map((a) => ({
        text: a.text || a.name || a,
        isChecked: true,
      }))
      : [];

    // Transform vitals with robust fallback
    const rawVitals = record.vitals || {};
    const vitals = {
      temperature: rawVitals.temperature || record.temperature || "",
      bloodPressure: rawVitals.bloodPressure || record.bloodPressure || {
        systolic: rawVitals.sys || rawVitals.systolic || record.sys || record.systolic || "",
        diastolic: rawVitals.dia || rawVitals.diastolic || record.dia || record.diastolic || "",
      },
      pulse: rawVitals.pulse || rawVitals.heartRate || record.pulse || record.heartRate || "",
      respiratoryRate: rawVitals.respiratoryRate || rawVitals.rr || record.respiratoryRate || record.rr || "",
      oxygenSaturation: rawVitals.oxygenSaturation || rawVitals.spo2 || record.oxygenSaturation || record.spo2 || "",
      weight: rawVitals.weight || record.weight || "",
      height: rawVitals.height || record.height || "",
      bmi: rawVitals.bmi || record.bmi || "",
    };

    // Transform followUp
    const followUp = record.followUp || {
      date: record.followUpDate || "",
      notes: record.followUpNotes || "",
      duration: record.followUpDuration || "",
    };

    return {
      patient,
      doctor: doctor || record.doctor || {},
      complaints,
      vitals,
      symptoms,
      diagnosis,
      diagnosisTests,
      medications,
      advices,
      followUp,
      notesForPatient: record.notesForPatient || "",
      privateNotes: record.privateNotes || "",
      treatmentType: record.treatmentType || "",
    };
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex h-screen w-full items-center justify-center">
          <AiOutlineLoading3Quarters className="animate-spin text-4xl text-subMain" />
        </div>
      </Layout>
    );
  }

  if (!recordData) {
    return (
      <Layout>
        <div className="flex h-screen w-full items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 mb-4">No record data available</p>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-[#0097DB] text-white rounded hover:bg-[#007bb5]"
            >
              Go Back
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <PrescriptionPreview
        patient={recordData.patient}
        doctor={recordData.doctor}
        complaints={recordData.complaints}
        vitals={recordData.vitals}
        symptoms={recordData.symptoms}
        diagnosis={recordData.diagnosis}
        diagnosisTests={recordData.diagnosisTests}
        medications={recordData.medications}
        advices={recordData.advices}
        followUp={recordData.followUp}
        notesForPatient={recordData.notesForPatient}
        privateNotes={recordData.privateNotes}
        treatmentType={recordData.treatmentType}
        onBack={() => navigate(-1)}
        onSaveTemplate={() => {
          toast("Template save functionality not available for preview");
        }}
        onAction={() => {
          toast("Action not available in preview mode");
        }}
      />
    </Layout>
  );
};

export default PrescriptionPreviewPage;

