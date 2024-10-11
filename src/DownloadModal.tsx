import { DownloadOutlined } from "@ant-design/icons";
import { Button, Modal } from "antd";
import { saveAs } from "file-saver";
import party from "party-js";
import { useRef } from "react";

import { generateOutputFilename, getSuccessMessage } from "./lib/utils.ts";
import { useBoundStore } from "./store/index.ts";

function DownloadModal() {
  const posthog = useBoundStore((state) => state.posthog);
  const mode = useBoundStore((state) => state.mode);
  const successCount = useBoundStore((state) => state.successCount);
  const status = useBoundStore((state) => state.status);
  const setStatus = useBoundStore((state) => state.setStatus);
  const inputFile = useBoundStore((state) => state.inputFile);
  const outputImage = useBoundStore((state) => state.outputImage);
  const outputImageDataUrl = useBoundStore((state) => state.outputImageDataUrl);

  const outputImageRef = useRef<null | HTMLImageElement>(null);

  function closeModal() {
    posthog.capture("user_closed_download_modal");
    setStatus("READY");
  }

  function downloadOutput() {
    posthog.capture("user_downloaded_emoji");
    if (outputImage && inputFile) {
      saveAs(outputImage, generateOutputFilename(inputFile));
    }
    closeModal();
  }

  function onModalOpenChange(open: boolean) {
    if (open && outputImageRef.current) {
      posthog.capture("user_opened_download_modal");

      if (mode === "HEDGEHOG") {
        const hedgehog = document.createElement("span");
        hedgehog.innerText = "🦔";
        hedgehog.style.fontSize = "48px";
        const heart = document.createElement("span");
        heart.innerText = "💖";
        heart.style.fontSize = "24px";
        party.confetti(outputImageRef.current, { shapes: [hedgehog, heart] });
      } else {
        party.confetti(outputImageRef.current);
      }
    }
  }

  function renderOutputImage() {
    return (
      <div className="flex flex-col items-center">
        <img ref={outputImageRef} src={outputImageDataUrl} />
      </div>
    );
  }

  return (
    <Modal
      title={getSuccessMessage(successCount)}
      open={status === "DONE"}
      onCancel={closeModal}
      destroyOnClose
      afterOpenChange={onModalOpenChange}
      footer={[
        <Button
          key="download"
          type="primary"
          onClick={downloadOutput}
          icon={<DownloadOutlined />}
        >
          Download
        </Button>,
      ]}
      width={304}
    >
      {renderOutputImage()}
    </Modal>
  );
}

export default DownloadModal;
