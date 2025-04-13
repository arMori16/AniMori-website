export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA; // Replace with your GA4 Measurement ID

// Extend the Window type to recognize gtag
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

// Function to send pageview events
export const pageview = (url: string) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("config", GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

// Function to send custom events
export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label: string;
  value: number;
}) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};
