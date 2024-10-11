import { SmileOutlined } from "@ant-design/icons";
import { Typography, Upload } from "antd";
import type { UploadProps } from "antd";

import groupImageUrl from "./assets/example-group.jpg";
import personImageUrl from "./assets/example-person.jpg";
import portraitImageUrl from "./assets/example-portrait.jpg";
import { useBoundStore } from "./store/index.ts";

const { Link, Paragraph } = Typography;
const { Dragger } = Upload;

const EXAMPLE_IMAGES = [personImageUrl, portraitImageUrl, groupImageUrl];

export default function FileInput() {
  const posthog = useBoundStore((state) => state.posthog);
  const status = useBoundStore((state) => state.status);
  const setStatus = useBoundStore((state) => state.setStatus);
  const setInputFile = useBoundStore((state) => state.setInputFile);

  async function handleExampleClick(
    event: React.MouseEvent<HTMLElement, MouseEvent>,
  ) {
    const imageUrl = event.currentTarget.dataset.url as string;
    posthog.capture("user_selected_example_image", {
      imageUrl,
    });
    const response = await fetch(imageUrl);
    const data = await response.blob();
    const metadata = {
      type: "image/jpeg",
    };
    const file = new File([data], "example.jpg", metadata);
    handleFileSelected(file);
  }

  function handleFileSelected(selectedFile: File) {
    setStatus("LOADING");
    setInputFile(selectedFile);
  }

  const props: UploadProps = {
    className: "flex flex-1",
    name: "file",
    multiple: false,
    accept: "image/png, image/jpeg",
    showUploadList: false,
    customRequest: (info) => {
      handleFileSelected(info.file as File);
    },
  };

  function renderExample(imageUrl: string) {
    return (
      <Link key={imageUrl} data-url={imageUrl} onClick={handleExampleClick}>
        <img src={imageUrl} />
      </Link>
    );
  }

  return (
    <>
      <Dragger disabled={status === "LOADING"} {...props}>
        <p className="ant-upload-drag-icon">
          <SmileOutlined />
        </p>
        <p className="ant-upload-text">
          Click or drag file to this area to start!
        </p>
      </Dragger>
      <Paragraph className="text-center my-2">Or try these examples:</Paragraph>
      <div className="grid grid-cols-3 gap-2 items-center">
        {EXAMPLE_IMAGES.map(renderExample)}
      </div>
    </>
  );
}
