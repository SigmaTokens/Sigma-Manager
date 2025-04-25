import React from 'react';
import { Input } from './popup';

interface TextHoneyTokenProps {
  fileName: string;
  setFileName: React.Dispatch<React.SetStateAction<string>>;
  fileContent: string;
  setFileContent: React.Dispatch<React.SetStateAction<string>>;
  fileLocation: string;
  setFileLocation: React.Dispatch<React.SetStateAction<string>>;
}

function TextHoneyToken({
  fileName,
  setFileName,
  fileContent,
  setFileContent,
  fileLocation,
  setFileLocation,
}: TextHoneyTokenProps) {
  return (
    <>
      <p>
        <label>File Name</label>
        <Input
          type="text"
          placeholder="Enter file name"
          value={fileName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFileName(e.target.value)
          }
        />
      </p>

      <p>
        <label>File Content</label>
        <Input
          type="text"
          placeholder="Enter the content of the file"
          value={fileContent}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFileContent(e.target.value)
          }
        />
      </p>

      <p>
        <label>File Location</label>
        <Input
          type="text"
          placeholder="Enter file path"
          value={fileLocation}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFileLocation(e.target.value)
          }
        />
      </p>
    </>
  );
}

export default TextHoneyToken;
