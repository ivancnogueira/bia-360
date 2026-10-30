export const toast = {
  success: (msg: string) => {
    if (typeof window !== "undefined") {
      const event = new CustomEvent("bia-toast", { detail: { type: "success", message: msg } });
      window.dispatchEvent(event);
    }
  },
  error: (msg: string) => {
    if (typeof window !== "undefined") {
      const event = new CustomEvent("bia-toast", { detail: { type: "error", message: msg } });
      window.dispatchEvent(event);
    }
  },
  info: (msg: string) => {
    if (typeof window !== "undefined") {
      const event = new CustomEvent("bia-toast", { detail: { type: "info", message: msg } });
      window.dispatchEvent(event);
    }
  },
};

