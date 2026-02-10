import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-hot-toast";
import { BiLoaderCircle } from "react-icons/bi";
import { FiUploadCloud } from "react-icons/fi";

const Uploader = ({ setImage, image }) => {
  const [loading, setLoading] = useState(false);

  // upload file
  const onDrop = useCallback(async (acceptedFiles) => {
    toast.error("This feature is not available yet");
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    multiple: false,
    onDrop,
  });

  return (
    <div className='grid w-full grid-cols-12 gap-4 text-center'>
      <div
        className='col-span-12 cursor-pointer rounded-md border-2 border-dashed px-6 pb-6 pt-5 sm:col-span-8 lg:col-span-10'
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        <span className='mx-auto flex justify-center'>
          <FiUploadCloud className='text-3xl text-subMain' />
        </span>
        <p className='mt-2 text-sm'>Drag your image here</p>
        <em className='text-xs text-gray-400'>
          (Only *.jpeg and *.png images will be accepted)
        </em>
      </div>
      {/* image preview */}
      <div className='col-span-12 sm:col-span-4 lg:col-span-2'>
        {loading ? (
          <div className='flex-colo h-32 w-full rounded-md border-2 border-dashed border-border bg-dry px-6'>
            <BiLoaderCircle className='mx-auto animate-spin text-3xl text-main' />
            <span className='mt-2 text-sm text-text'>Uploading...</span>
          </div>
        ) : (
          <img
            src={image ? image : "http://placehold.it/300x300"}
            alt='preview'
            className='h-32 w-full rounded object-cover'
          />
        )}
      </div>
    </div>
  );
};

export default Uploader;
