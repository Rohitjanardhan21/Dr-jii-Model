import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const thclass = "text-start text-sm font-medium py-3 px-2 whitespace-nowrap";
const tdclass = "text-start text-sm py-4 px-2 whitespace-nowrap";

export function DashboardTransactionTable({ data }) {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Calculate pagination
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  
  // Get current page data
  const currentData = useMemo(() => {
    return data.slice(startIndex, endIndex);
  }, [data, startIndex, endIndex]);

  // Pagination handlers
  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const goToPrevious = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const goToNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  // Handle row click to navigate to edit page
  const handleRowClick = (id) => {
    navigate(`/payments/edit/${id}`);
    // Scroll to top after navigation
    window.scrollTo(0, 0);
  };

  return (
     <div className="w-full">

      {/*  DESKTOP + TABLET TABLE */}
      <div className="hidden sm:block w-full overflow-x-auto">
        <table className="w-full min-w-[900px] table-auto">
          <thead className="bg-dry rounded-md">
            <tr>
              <th className={thclass}>#</th>
              <th className={thclass}>Patient</th>
              <th className={thclass}>Date</th>
              <th className={thclass}>Status</th>
              <th className={thclass}>
                Amount <span className="text-xs font-light">(Tsh)</span>
              </th>
              <th className={thclass}>Method</th>
            </tr>
          </thead>

          <tbody>
            {currentData.map((item, index) => (
              <tr
                key={item?._id}
                onClick={() => handleRowClick(item?._id)}
                className="border-b border-border hover:bg-greyed cursor-pointer transition"
              >
                <td className={tdclass}>
                  {startIndex + index + 1}
                </td>

                <td className={tdclass}>
                  <div className="flex items-center gap-3">
                    <img
                      src={item?.patient?.userImage}
                      alt={item?.patient?.fullName}
                      className="h-10 w-10 rounded-full border object-cover"
                    />
                    <div>
                      <p className="font-medium">
                        {item?.patient?.fullName}
                      </p>
                      <p className="text-xs text-textGray">
                        {item?.patient?.contactDetails?.primaryContact}
                      </p>
                    </div>
                  </div>
                </td>

                <td className={tdclass}>{item?.date}</td>

                <td className={tdclass}>
                  <span
                    className={`px-3 py-1 rounded-full text-xs bg-opacity-10
                      ${
                        item.status === "Approved"
                          ? "bg-subMain text-subMain"
                          : item.status === "Pending"
                          ? "bg-orange-500 text-orange-500"
                          : "bg-red-600 text-red-600"
                      }
                    `}
                  >
                    {item?.status}
                  </span>
                </td>

                <td className={`${tdclass} font-semibold`}>
                  {parseInt(item?.amount)}
                </td>

                <td className={tdclass}>{item?.method}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/*  MOBILE CARD VIEW  */}
      <div className="block sm:hidden space-y-4">
        {currentData.map((item) => (
          <div
            key={item?._id}
            onClick={() => handleRowClick(item?._id)}
            className="bg-white border border-border rounded-xl p-4 shadow-sm cursor-pointer"
          >
            {/* Patient */}
            <div className="flex items-center gap-3">
              <img
                src={item?.patient?.userImage}
                alt={item?.patient?.fullName}
                className="h-10 w-10 rounded-full object-cover border"
              />
              <div>
                <p className="text-sm font-semibold">
                  {item?.patient?.fullName}
                </p>
                <p className="text-xs text-textGray">
                  {item?.patient?.contactDetails?.primaryContact}
                </p>
              </div>
            </div>

            {/* Details */}
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-textGray">Date</p>
                <p>{item?.date}</p>
              </div>

              <div>
                <p className="text-xs text-textGray">Method</p>
                <p>{item?.method}</p>
              </div>

              <div>
                <p className="text-xs text-textGray">Amount</p>
                <p className="font-semibold">
                  {parseInt(item?.amount)} Tsh
                </p>
              </div>

              <div>
                <p className="text-xs text-textGray">Status</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs bg-opacity-10
                    ${
                      item.status === "Approved"
                        ? "bg-subMain text-subMain"
                        : item.status === "Pending"
                        ? "bg-orange-500 text-orange-500"
                        : "bg-red-600 text-red-600"
                    }
                  `}
                >
                  {item?.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/*  PAGINATION  */}
      {data.length > itemsPerPage && (
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          {/* Info */}
          <div className="text-sm text-textGray">
            Showing {startIndex + 1} to{" "}
            {Math.min(endIndex, data.length)} of {data.length} entries
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">

            <button
              onClick={goToPrevious}
              disabled={currentPage === 1}
              className={`px-3 py-2 rounded-lg text-sm flex items-center
                ${
                  currentPage === 1
                    ? "bg-gray-100 text-textGray cursor-not-allowed"
                    : "bg-white border border-border hover:bg-greyed"
                }
              `}
            >
              <FiChevronLeft className="mr-1" />
              Prev
            </button>

            {/* Page numbers (hide on mobile) */}
            <div className="hidden sm:flex gap-1">
              {getPageNumbers().map((page) => (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`px-3 py-2 rounded-lg text-sm
                    ${
                      currentPage === page
                        ? "bg-subMain text-white"
                        : "bg-white border border-border hover:bg-greyed"
                    }
                  `}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={goToNext}
              disabled={currentPage === totalPages}
              className={`px-3 py-2 rounded-lg text-sm flex items-center
                ${
                  currentPage === totalPages
                    ? "bg-gray-100 text-textGray cursor-not-allowed"
                    : "bg-white border border-border hover:bg-greyed"
                }
              `}
            >
              Next
              <FiChevronRight className="ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}