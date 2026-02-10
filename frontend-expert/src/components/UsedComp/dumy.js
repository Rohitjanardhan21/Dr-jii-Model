  const [patientHistory, setPatientHistory] = useState(
      data?.patientMedicalHistory?.map(h => ({ name: h })) || []
    );
  
    const [noKnownHistory, setNoKnownHistory] = useState(false);

import SmartSuggestEditor from "../SmartSuggestEditor";
import { patientHistoryMaster } from "../../Assets/Data";




  {/* Patient medical history section  */}
          <div className="mt-6">
            <SmartSuggestEditor
              label="Patient Medical History"
              defaultSuggestions={DEFAULT_VISIBLE_HISTORY} 
              suggestions={patientHistoryMaster}
              selected={patientHistory}
              setSelected={setPatientHistory}
              disabled={noKnownHistory}
            />

            <label className="mt-3 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={noKnownHistory}
                onChange={(e) => {
                  setNoKnownHistory(e.target.checked);
                  if (e.target.checked) setPatientHistory([]);
                }}
              />
              No known medical history
            </label>
          </div>















