import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import toast from "react-hot-toast";

const AttachmentImages = () => {
  const { id: patientId } = useParams();
  const [attachments, setAttachments] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUrls: 0,
    limit: 6,
  });
  const fileInputRef = React.useRef(null);

  // Fetch attachments with pagination
  const fetchAttachments = async (page = pagination.currentPage) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/medical-documents/${patientId}?page=${page}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch attachments");
      }

      const data = await response.json();
      setAttachments(data.urls || []);
      setPagination({
        currentPage: data.pagination.currentPage,
        totalPages: data.pagination.totalPages,
        totalUrls: data.pagination.totalUrls,
        limit: data.pagination.limit,
      });
    } catch (error) {
      console.error("Error fetching attachments:", error);
      toast.error(error.message || "Failed to load images");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttachments();
  }, [patientId]);

  // Handle file selection and immediate upload
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    const maxFileSize = 5 * 1024 * 1024; // 5MB

    e.target.value = '';
    
    const validFiles = files.filter((file) => {
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        return false;
      }
      if (file.size > maxFileSize) {
        toast.error(`File ${file.name} is too large. Maximum size is 5MB.`);
        return false;
      }
      return true;
    });

    if (validFiles.length < files.length) {
      toast.error("Only JPEG and PNG images under 5MB are accepted");
    }
    
    if (validFiles.length > 0) {
      setNewFiles(validFiles);

      await handleUpload(validFiles);
    }
  };

  const handleUpload = async (filesToUpload = newFiles) => {
    if (filesToUpload.length === 0) {
      toast.error("No files selected for upload");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    
    filesToUpload.forEach((file) => formData.append("attachments", file));
    formData.append("patientId", patientId);

    try {
      const uploadPromise = fetch(
        `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/medical-documents/upload`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );

      toast.promise(uploadPromise, {
        loading: `Uploading ${filesToUpload.length} file(s)...`,
        success: `${filesToUpload.length} file(s) uploaded successfully!`,
        error: 'Upload failed. Please try again.',
      });

      const response = await uploadPromise;

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Upload failed with status: ${response.status}`);
      }

      const data = await response.json();

      setNewFiles([]);

      setPagination(prev => ({ ...prev, currentPage: 1 }));
      await fetchAttachments(1);
      
    } catch (error) {
      console.error("Error uploading files:", error);
    } finally {
      setUploading(false);
    }
  };

  // Handle upload button click - opens file picker
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle page navigation
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages && newPage !== pagination.currentPage) {
      setPagination(prev => ({ ...prev, currentPage: newPage }));
      fetchAttachments(newPage);
    }
  };

  return (
    <div className='p-6 md:px-12'>
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type='file'
        accept='image/jpeg,image/png'
        multiple
        onChange={handleFileChange}
        className='hidden'
        disabled={uploading}
      />

      {/* Header with Upload Button */}
      <div className='flex justify-end mb-6'>
        <button
          onClick={handleUploadClick}
          className='rounded-lg bg-blue-500 px-4 py-2 text-white transition duration-300 hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2'
          disabled={uploading}
        >
          {uploading ? (
            <>
              <AiOutlineLoading3Quarters className='animate-spin' />
              Uploading...
            </>
          ) : (
            'Upload Documents'
          )}
        </button>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className='flex h-screen w-full items-center justify-center'>
          <AiOutlineLoading3Quarters className='animate-spin text-4xl text-subMain' />
        </div>
      ) : (
        <>
          {/* Images Grid - Always Visible */}
          {attachments.length === 0 ? (
            <div className='text-center py-12'>
              <p className='text-gray-400 text-lg'>No attachments found.</p>
              <button
                onClick={handleUploadClick}
                className='mt-4 text-blue-500 hover:text-blue-700 underline'
              >
                Upload some documents
              </button>
            </div>
          ) : (
            <>
              <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3'>
                {attachments.map((url, index) => (
                  <div
                    key={index}
                    className='block overflow-hidden rounded-xl bg-white shadow-md transition duration-300 hover:shadow-lg'
                  >
                    <div className='px-4 pt-4'>
                      <img
                        src={url}
                        alt={`Attachment ${index + 1}`}
                        className='h-48 w-full rounded-md object-cover cursor-pointer'
                        loading='lazy'
                        onClick={() => window.open(url, '_blank')}
                        onError={(e) => {
                          e.target.src = '/placeholder-image.png';
                          console.error('Failed to load image:', url);
                        }}
                      />
                    </div>
                    <div className='p-4 pb-3'>
                      <p className='truncate text-sm text-gray-700'>
                        {url.split("/").pop()}
                      </p>
                      <a
                        href={url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-xs text-blue-500 hover:text-blue-700 underline'
                      >
                        Open in new tab
                      </a>
                    </div>
                  </div>
                ))}
              </div>
              
              {pagination.totalPages > 1 && (
                <div className='flex items-center justify-center gap-2 mt-8'>
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className='rounded bg-gray-200 px-3 py-1 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    Previous
                  </button>
                  
                  <span className='mx-4 text-sm text-gray-600'>
                    Page {pagination.currentPage} of {pagination.totalPages} 
                    ({pagination.totalUrls} total images)
                  </span>
                  
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className='rounded bg-gray-200 px-3 py-1 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default AttachmentImages;