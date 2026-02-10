import React, { useEffect, useState } from "react";
import { MdOutlineCloudDownload } from "react-icons/md";
import { toast } from "react-hot-toast";
import { BiPlus, BiSearch, BiX } from "react-icons/bi";
import Layout from "../Layout";
import { Button } from "../components/Form";
import { useNavigate } from "react-router-dom";
import AddFacilityModal from "../components/Modals/AddFacilityModal";

function Facility() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [facilityData, setFacilityData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_BASE_URL}/facility/getAll/facilityProfile`,
        { credentials: "include" }
      );
      const json = await response.json();
      if (json.data) {
        setFacilityData(json.data);
        setFilteredData(json.data);
      } else {
        setFacilityData([]);
        setFilteredData([]);
      }
    } catch (e) {
      console.log("error fetching...", e);
      toast.error("Failed to fetch facilities");
      setFacilityData([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = facilityData.filter(
        (facility) =>
          facility.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          facility.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          facility.emailId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          facility.mobileNumber?.toString().includes(searchTerm)
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(facilityData);
    }
  }, [searchTerm, facilityData]);

  const onCloseModal = () => {
    setIsOpen(false);
    fetchData(); // Refresh list after adding facility
  };

  const handleExport = () => {
    if (filteredData.length === 0) {
      toast.error("No data to export");
      return;
    }
    // Simple CSV export
    const headers = ["Name", "Business Name", "Email", "Mobile", "City", "State"];
    const csvData = filteredData.map((facility) => [
      facility.fullName || "",
      facility.businessName || "",
      facility.emailId || "",
      facility.mobileNumber || "",
      facility.cityDistrict || "",
      facility.state || "",
    ]);
    const csvContent = [headers, ...csvData]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `facilities-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast.success("Facilities exported successfully");
  };

  if (loading) {
    return (
      <Layout>
        <div className="bg-gray-50 p-6 min-h-[200px] flex items-center justify-center">
          {/* Keep empty while route-level blur loader shows */}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {isOpen && (
        <AddFacilityModal
          closeModal={onCloseModal}
          isOpen={isOpen}
          datas={null}
        />
      )}

      {/* Header */}
      <div className="mb-6 flex flex-row items-end">
        <h1 className="text-[38px] font-[600] text-black">avijo</h1>
        <h6 className="text-[24px] font-[500] italic text-[#FD7979]">Expert</h6>
      </div>

      {/* Search and Actions */}
      <div className="my-8 rounded-xl border-[1px] border-border bg-white p-5">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <input
            type="text"
            placeholder='Search facilities...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-14 w-full rounded-md border border-border bg-dry px-4 text-sm text-main sm:max-w-md"
          />
          <div className="flex gap-4">
            <Button
              label="Export"
              Icon={MdOutlineCloudDownload}
              onClick={handleExport}
            />
            <Button
              label="Invite Facility"
              Icon={BiPlus}
              onClick={() => setIsOpen(true)}
            />
          </div>
        </div>

        {/* Facilities Table */}
        <div className="mt-4 w-full overflow-x-auto">
          {filteredData.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              {searchTerm ? "No facilities found matching your search" : "No facilities found. Invite a facility to get started."}
            </div>
          ) : (
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3">#</th>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Business Name</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Mobile</th>
                  <th className="px-6 py-3">City</th>
                  <th className="px-6 py-3">State</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((facility, index) => (
                  <tr
                    key={facility._id || facility.id}
                    className="border-t hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">{index + 1}</td>
                    <td className="px-6 py-4 text-gray-800">
                      {facility.fullName || "N/A"}
                    </td>
                    <td className="px-6 py-4">{facility.businessName || "N/A"}</td>
                    <td className="px-6 py-4">{facility.emailId || "N/A"}</td>
                    <td className="px-6 py-4">{facility.mobileNumber || "N/A"}</td>
                    <td className="px-6 py-4">{facility.cityDistrict || "N/A"}</td>
                    <td className="px-6 py-4">{facility.state || "N/A"}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs ${
                          facility.verifyStatus
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {facility.verifyStatus ? "Verified" : "Pending"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {filteredData.length > 0 && (
          <div className="mt-4 flex justify-between items-center px-6 py-3 text-sm text-gray-600">
            <div>
              Showing {filteredData.length} of {facilityData.length} facilities
            </div>
          </div>
        )}
      </div>
    </Layout>

    // <Layout>
    //   {
    //     // add doctor modal
    //     isOpen && (
    //       <AddFacilityModal
    //         closeModal={onCloseModal}
    //         isOpen={isOpen}
    //         doctor={true}
    //         datas={null}
    //       />
    //     )
    //   }

    //   {/* add button */}
    //   <button
    //     onClick={() => setIsOpen(true)}
    //     className='flex-colo button-fb fixed bottom-8 right-12 z-50 h-16 w-16 animate-bounce rounded-full border border-border bg-subMain text-white'
    //   >
    //     <BiPlus className='text-2xl' />
    //   </button>
    //   <div className='mb-6 flex flex-row items-end'>
    //     <h1 className='text-[38px] font-[600] text-black'>avijo</h1>
    //     <h6 className='text-[24px] font-[500] italic text-[#12CDB7]'>Alpha</h6>
    //   </div>

    //   <div
    //     data-aos='fade-up'
    //     data-aos-duration='1000'
    //     data-aos-delay='100'
    //     data-aos-offset='200'
    //     className='my-8 rounded-xl border-[1px] border-border bg-white p-5'
    //   >
    //     <div className='grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-6'>
    //       <div className='grid items-center gap-6 md:col-span-5 lg:grid-cols-4'>
    //         <input
    //           type='text'
    //           placeholder='Search "daudi mburuge"'
    //           className='h-14 w-full rounded-md border border-border bg-dry px-4 text-sm text-main'
    //         />
    //       </div>

    //       {/* export */}
    //       <Button
    //         label='Export'
    //         Icon={MdOutlineCloudDownload}
    //         onClick={() => {
    //           toast.error("Exporting is not available yet");
    //         }}
    //       />
    //     </div>

    //     <div className='mt-8 w-full overflow-x-scroll'>
    //       <FacilityTable
    //         doctor={true}
    //         data={facilityData}
    //         functions={{
    //           preview: preview,
    //         }}
    //       />
    //     </div>
    //   </div>
    // </Layout>
  );
}

export default Facility;
