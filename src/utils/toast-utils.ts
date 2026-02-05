import { showToast, Toast } from "@raycast/api";

export const showSuccessToast = (title: string, message: string) => {
  showToast({
    style: Toast.Style.Success,
    title,
    message,
  });
};

export const showErrorToast = (title: string, message: string) => {
  showToast({
    style: Toast.Style.Failure,
    title,
    message,
  });
};
