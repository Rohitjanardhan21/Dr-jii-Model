import { toast } from "react-hot-toast";

export const toastHandler = async (
    promise,
    loadingMessage,
    successMessage,
    errorMessage
) => {
    const loadingToast = toast.loading(loadingMessage);
    try {
        const response = await promise;

        toast.dismiss(loadingToast);
        toast.success(successMessage);
        return response;
    } catch (error) {
        toast.dismiss(loadingToast);
        if (error.response && error.response.data)
            toast.error(error?.response?.data?.message || errorMessage);
        console.log("Error occrued :: ", error);
        return null;
    }
};
