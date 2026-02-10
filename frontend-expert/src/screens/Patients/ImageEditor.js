import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../../utils/cropImage';
import { MdRotateRight, MdCheck, MdClose } from 'react-icons/md';

const ImageEditor = ({ imageSrc, onCancel, onComplete }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((_, croppedArea) => {
    setCroppedAreaPixels(croppedArea);
  }, []);

  const handleSave = async () => {
    const file = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
    onComplete(file); 
  };
return (
<div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
  <div className="relative w-full max-w-3xl h-[80vh] mx-auto bg-white rounded-xl shadow-xl flex flex-col overflow-hidden">

      
      {/* Cropper area */}
      <div className="relative flex-1">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={1}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onRotationChange={setRotation}
          onCropComplete={onCropComplete}
        />
      </div>

      {/* Footer with buttons */}
      <div className="flex justify-between items-center px-4 py-3 bg-gray-100 border-t">
        <button
          onClick={() => setRotation(rotation + 90)}
          className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 flex items-center gap-1"
        >
          <MdRotateRight size={20} />
          Rotate
        </button>

        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 flex items-center gap-1"
          >
            <MdClose size={20} />
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-1"
          >
            <MdCheck size={20} />
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
);


};

export default ImageEditor;
