import React, { useState } from "react";
import { MdOutlineFileUpload } from "react-icons/md";
import ImageEditorPortal from "./ImageEditorPortal";
const UploadButton = ({ onUpload }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [editorVisible, setEditorVisible] = useState(false);

const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const MAX_SIZE_MB = 10;
  const maxSizeBytes = MAX_SIZE_MB * 1024 * 1024;

  if (file.size > maxSizeBytes) {
    alert(`File size must be less than ${MAX_SIZE_MB} MB`);
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    setImageSrc(reader.result);
    setEditorVisible(true);
  };
  reader.readAsDataURL(file);
};

  const handleEditorCancel = () => {
    setEditorVisible(false);
    setImageSrc(null);
  };

  const handleEditorComplete = async (editedFile) => {
    setEditorVisible(false);
    setImageSrc(null);

    // Convert file to form-data or base64 if uploading
    // actual upload logic here
    onUpload(editedFile); // send back to parent
    alert("Edited image ready to upload!");
  };

  return (
    <div className="absolute top-6 right-6">
    {editorVisible && (
  <ImageEditorPortal
    imageSrc={imageSrc}
    onCancel={handleEditorCancel}
    onComplete={handleEditorComplete}
  />
)}
      <label className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded cursor-pointer shadow">
        <MdOutlineFileUpload />
        Upload
     <input
  type="file"
  accept="image/*"
  className="hidden"
  onChange={handleFileChange}
  onClick={(e) => (e.target.value = null)}
/>
      </label>
    </div>
  );
};

export default UploadButton;
