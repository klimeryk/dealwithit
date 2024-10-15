import { SmileOutlined } from "@ant-design/icons";
import { Button, Input, Space, Spin, Typography, Upload } from "antd";
import type { UploadProps } from "antd";
import { useState } from "react";

import groupImageUrl from "./assets/example-group.jpg";
import personImageUrl from "./assets/example-person.jpg";
import portraitImageUrl from "./assets/example-portrait.jpg";
import { useBoundStore } from "./store/index.ts";

const { Link, Paragraph } = Typography;
const { Dragger } = Upload;

const EXAMPLE_IMAGES = [personImageUrl, portraitImageUrl, groupImageUrl];

export default function FileInput() {
  const [imageUrl, setImageUrl] = useState("");

  const posthog = useBoundStore((state) => state.posthog);
  const status = useBoundStore((state) => state.status);
  const setStatus = useBoundStore((state) => state.setStatus);
  const setInputFile = useBoundStore((state) => state.setInputFile);

  function handleImageUrlChange(event: React.ChangeEvent<HTMLInputElement>) {
    setImageUrl(event.target.value);
  }

  async function handleImageUrlSubmit() {
    setStatus("LOADING");

    posthog.capture("user_submitted_image_url");
    const response = await fetch(imageUrl);
    const data = await response.blob();
    const contentType = response.headers.get("content-type") || "image/jpeg";
    const metadata = {
      type: contentType,
    };
    const file = new File([data], "image", metadata);
    handleFileSelected(file);
  }

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

  const fileInput = (
    <>
      <Dragger disabled={status === "LOADING"} {...props}>
        <p className="ant-upload-drag-icon">
          <SmileOutlined />
        </p>
        <p className="ant-upload-text">
          Click or drag file to this area to start!
        </p>
      </Dragger>
      <Paragraph className="text-center my-2">Or paste an image URL:</Paragraph>
      <Space.Compact className="w-full">
        <Input
          placeholder="https://example.com/image.jpg"
          value={imageUrl}
          onChange={handleImageUrlChange}
        />
        <Button
          type="primary"
          onClick={handleImageUrlSubmit}
          disabled={imageUrl.length === 0}
        >
          Submit
        </Button>
      </Space.Compact>
      <Paragraph className="text-center my-2">Or try these examples:</Paragraph>
      <div className="grid grid-cols-3 gap-2 items-center">
        {EXAMPLE_IMAGES.map(renderExample)}
      </div>
    </>
  );

  if (status === "START") {
    return (
      <Spin tip="Loading AI models for face detection...">{fileInput}</Spin>
    );
  }

  return fileInput;
}
