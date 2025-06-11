import React from 'react';
import { Input } from './popup';

interface TextHoneyTokenProps {
  fileName: string;
  setFileName: React.Dispatch<React.SetStateAction<string>>;
  fileContent: string;
  setFileContent: React.Dispatch<React.SetStateAction<string>>;
  fileLocation: string;
  setFileLocation: React.Dispatch<React.SetStateAction<string>>;
  clearErrors: () => void;
  errors?: {
    fileName?: string;
    fileLocation?: string;
  };
}

function TextHoneyToken({
  fileName,
  setFileName,
  fileContent,
  setFileContent,
  fileLocation,
  setFileLocation,
  clearErrors,
  errors = {},
}: TextHoneyTokenProps) {
  return (
    <>
      <div className="double-field-row">
        <div id="this is filename">
          <label>
            File Name <span className="required-star">*</span>
          </label>
          <Input
            type="text"
            placeholder="Enter file name"
            value={fileName}
            onChange={(e) => {
              setFileName(e.target.value);
              clearErrors();
            }}
          />
          {errors.fileName && <div className="error-text">{errors.fileName}</div>}
        </div>

        <div id="this is filelocation">
          <label>
            File Location <span className="required-star">*</span>
          </label>
          <Input
            type="text"
            placeholder="Enter file path"
            value={fileLocation}
            onChange={(e) => {
              setFileLocation(e.target.value);
              clearErrors();
            }}
          />
          {errors.fileLocation && <div className="error-text">{errors.fileLocation}</div>}
        </div>
      </div>

      <div id="this is filecontent" style={{ gridColumn: '1 / -1' }}>
        <label>File Content</label>
        <Input
          type="text"
          placeholder="Enter the content of the file"
          value={fileContent}
          onChange={(e) => {
            setFileContent(e.target.value);
            clearErrors();
          }}
        />
      </div>
    </>
  );
}

export default TextHoneyToken;
