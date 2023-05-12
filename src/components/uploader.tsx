import { UploadButton } from "@uploadthing/react";

import type { OurFileRouter } from "~/server/uploadthing";

// You need to import our styles for the button to look right. Best to import in the root /_app.tsx but this is fine
import "@uploadthing/react/styles.css";

export default function Uploader() {
  return (
    <UploadButton<OurFileRouter>
      endpoint="imageUploader"
      onClientUploadComplete={() => {
        alert("Upload Completed");
      }}
      // @ts-ignore
      onUploadError={(error: Error) => alert(`ERROR! ${error.message}`)}
    />
  );
}
