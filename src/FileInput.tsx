import { SmileOutlined } from "@ant-design/icons";
import { Typography, Upload } from "antd";
import type { UploadProps } from "antd";

import groupImageUrl from "./assets/example-group.jpg";
import personImageUrl from "./assets/example-person.jpg";
import portraitImageUrl from "./assets/example-portrait.jpg";

const { Link, Paragraph } = Typography;
const { Dragger } = Upload;

interface FileInputProps {
  onExampleClick: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  onFileSelected: (file: File) => void;
  disabled: boolean;
}

const EXAMPLE_IMAGES = [personImageUrl, portraitImageUrl, groupImageUrl];

export default function FileInput({
  disabled,
  onExampleClick,
  onFileSelected,
}: FileInputProps) {
  const props: UploadProps = {
    className: "flex flex-1",
    name: "file",
    multiple: false,
    accept: "image/png, image/jpeg",
    showUploadList: false,
    customRequest: (info) => {
      onFileSelected(info.file as File);
    },
  };

  function renderExample(imageUrl: string) {
    return (
      <Link key={imageUrl} data-url={imageUrl} onClick={onExampleClick}>
        <img src={imageUrl} />
      </Link>
    );
  }

  return (
    <>
      <Dragger disabled={disabled} {...props}>
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
