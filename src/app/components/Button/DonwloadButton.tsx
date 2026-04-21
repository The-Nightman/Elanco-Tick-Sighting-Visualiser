"use client";

import { useRef } from "react";

interface DownloadButtonProps {
  apiUrl: string;
  reportName: string;
}

const DonwloadButton = ({ apiUrl, reportName }: DownloadButtonProps) => {
  const linkRef = useRef<HTMLAnchorElement>(null);

  const handleDownload = async () => {
    const response = await fetch(apiUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const link = linkRef.current;
    if (link) {
      link.href = url;
      link.download = reportName;
      link.click();
      window.URL.revokeObjectURL(url);
    }
  };

  return (
    <>
      <button
        className="w-fit bg-sky-600 hover:bg-sky-700 text-white py-2 px-4 rounded"
        onClick={handleDownload}
      >
        Download sightings report
      </button>
      <a ref={linkRef} style={{ display: "none" }} />
    </>
  );
};

export default DonwloadButton;
