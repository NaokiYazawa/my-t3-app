import React, { useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { FiCopy } from "react-icons/fi";
import { MdDone } from "react-icons/md";

interface CopyToClipboardButtonProps {
  textToCopy: string;
}

export const CopyToClipboardButton: React.FC<CopyToClipboardButtonProps> = ({
  textToCopy,
}) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1800);
  };

  return (
    <div className="ml-3 flex items-center justify-center">
      <CopyToClipboard text={textToCopy} onCopy={handleCopy}>
        <span>{isCopied ? <MdDone /> : <FiCopy />}</span>
      </CopyToClipboard>
    </div>
  );
};
