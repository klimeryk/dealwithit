import { DownloadOutlined } from '@ant-design/icons';
import { Button, Modal } from 'antd';
import { saveAs } from 'file-saver';
import party from 'party-js';
import { useRef } from 'react';

import { generateOutputFilename, getSuccessMessage } from './lib/utils.ts';
import { useBoundStore } from './store/index.ts';

function DownloadModal() {
  const mode = useBoundStore((state) => state.mode);
  const successCount = useBoundStore((state) => state.successCount);
  const status = useBoundStore((state) => state.status);
  const setStatus = useBoundStore((state) => state.setStatus);
  const inputFile = useBoundStore((state) => state.inputFile);
  const outputImage = useBoundStore((state) => state.outputImage);
  const outputImageDataUrl = useBoundStore((state) => state.outputImageDataUrl);

  const outputImageRef = useRef<null | HTMLImageElement>(null);

  function closeModal() {
    setStatus('READY');
  }

  function downloadOutput() {
    if (outputImage && inputFile) {
      saveAs(outputImage, generateOutputFilename(inputFile));
    }
    closeModal();
  }

  function onModalOpenChange(open: boolean) {
    if (!open || !outputImageRef.current) {
      return;
    }

    if (mode === 'HEDGEHOG') {
      const hedgehog = document.createElement('span');
      hedgehog.innerText = '🦔';
      hedgehog.style.fontSize = '48px';
      const heart = document.createElement('span');
      heart.innerText = '💖';
      heart.style.fontSize = '24px';
      party.confetti(outputImageRef.current, { shapes: [hedgehog, heart] });
    } else {
      party.confetti(outputImageRef.current);
    }
  }

  function renderOutputImage() {
    return (
      <div className="flex flex-col items-center">
        <img ref={outputImageRef} src={outputImageDataUrl} alt="Output with glasses" />
      </div>
    );
  }

  return (
    <Modal
      title={getSuccessMessage(successCount)}
      open={status === 'DONE'}
      onCancel={closeModal}
      destroyOnHidden
      afterOpenChange={onModalOpenChange}
      footer={[
        <Button key="download" type="primary" onClick={downloadOutput} icon={<DownloadOutlined />}>
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
