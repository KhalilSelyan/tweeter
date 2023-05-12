// import { UploadButton } from "@uploadthing/react";

// import type { OurFileRouter } from "~/server/uploadthing";

// // You need to import our styles for the button to look right. Best to import in the root /_app.tsx but this is fine
// import "@uploadthing/react/styles.css";

// export function Uploader() {
//   return (
//     <UploadButton<OurFileRouter>
//       endpoint="imageUploader"
//       onClientUploadComplete={() => {
//         alert("Upload Completed");
//       }}
//       // @ts-ignore
//       onUploadError={(error: Error) => alert(`ERROR! ${error.message}`)}
//     />
//   );
// }

import React, { useState } from "react";
import { Web3Storage } from "web3.storage";
import { env } from "~/env.mjs";

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [ipfsUrl, setIpfsUrl] = useState("");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) {
      return;
    } else if (event.target.files[0] !== undefined) {
      setFile(event.target.files[0]);
      console.log(event.target.files[0]);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!file) {
      return;
    }

    setUploading(true);

    const client = new Web3Storage({
      token: env.NEXT_PUBLIC_WEB3_STORAGE_API_KEY,
    });
    const cid = await client.put([file]);
    const url = `https://${cid}.ipfs.w3s.link/${file.name}`;

    setIpfsUrl(url);
    setUploading(false);
  };

  return (
    <div className="mx-auto my-8 max-w-lg rounded-lg bg-white p-6 shadow-lg">
      <form onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 font-bold text-gray-700" htmlFor="file">
            Choose a file to upload
          </label>
          <div className="relative flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-gray-400">
            <div className="absolute">
              <div className="flex flex-col items-center">
                <svg
                  className="h-10 w-10 text-gray-400 group-hover:text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 19l-7-7 7-7"
                  ></path>
                </svg>
                <span className="mt-2 text-gray-400 group-hover:text-gray-600">
                  {file ? file.name : "Select a file"}
                </span>
              </div>
            </div>
            <input
              type="file"
              className="h-full w-full opacity-0"
              id="file"
              onChange={handleChange}
            />
          </div>
        </div>
        <button
          type="submit"
          className="focus:shadow-outline mt-4 rounded bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none"
          disabled={!file || uploading}
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </form>
      {ipfsUrl && (
        <div className="mt-8">
          <p className="font-bold text-gray-700">File uploaded to IPFS:</p>
          <a
            href={ipfsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate text-blue-500 hover:text-blue-700"
          >
            {ipfsUrl}
          </a>
          <img
            src={ipfsUrl}
            alt="Uploaded file"
            className="mx-auto mt-4 max-w-xs"
          />
        </div>
      )}
    </div>
  );
}
