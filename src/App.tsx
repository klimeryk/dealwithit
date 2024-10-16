import "jimp/browser/lib/jimp.js";
import { SettingOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useEffect, useRef } from "react";

import ConfigurationForm from "./ConfigurationForm.tsx";
import DownloadModal from "./DownloadModal.tsx";
import FileInput from "./FileInput.tsx";
import Footer from "./Footer.tsx";
import InputImage from "./InputImage.tsx";
import SettingsDrawer from "./SettingsDrawer.tsx";
import SortableGlassesList from "./SortableGlassesList.tsx";
import { useBoundStore } from "./store/index.ts";
import Title from "./Title.tsx";

function App() {
  const messageApi = useBoundStore((state) => state.messageApi);
  const setDrawerOpen = useBoundStore((state) => state.setDrawerOpen);
  const status = useBoundStore((state) => state.status);
  const detectFaces = useBoundStore((state) => state.detectFaces);
  const inputImageRef = useRef<null | HTMLImageElement>(null);
  const mode = useBoundStore((state) => state.mode);

  useEffect(() => {
    if (mode === "HEDGEHOG") {
      messageApi?.info({
        content: "Hello fellow hedgehog fan!",
        icon: <span className="mr-1 text-lg">🦔</span>,
      });
    }
  }, [mode, messageApi]);

  function renderInputImage() {
    async function handleInputImageLoad() {
      if (!inputImageRef.current) {
        return;
      }
      detectFaces(inputImageRef.current);
    }

    return (
      <>
        <InputImage
          inputImageRef={inputImageRef}
          onInputImageLoad={handleInputImageLoad}
        />
        <SortableGlassesList />
      </>
    );
  }

  function onOpenDrawer() {
    setDrawerOpen(true);
  }

  const shouldRenderFileInput = ["START", "INPUT", "LOADING"].includes(status);

  return (
    <>
      <Title />
      <div className="relative py-3 sm:max-w-2xl sm:mx-auto">
        <div className="relative p-10 bg-white dark:bg-slate-900 shadow-lg sm:rounded-3xl">
          <Button
            icon={<SettingOutlined />}
            shape="circle"
            className="absolute right-0 top-0 mt-2 me-2"
            onClick={onOpenDrawer}
          />
          <div className="sm:grid grid-cols-3 gap-4">
            <div className="col-span-2 mb-4 sm:mb-0">
              {shouldRenderFileInput ? <FileInput /> : renderInputImage()}
            </div>
            <ConfigurationForm inputImageRef={inputImageRef} />
          </div>
          <DownloadModal />
        </div>
      </div>
      <Footer />
      <SettingsDrawer />
    </>
  );
}

export default App;
