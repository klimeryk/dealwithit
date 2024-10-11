import { GithubOutlined } from "@ant-design/icons";
import { Typography } from "antd";

const { Text, Link } = Typography;

export default function Title() {
  return (
    <div className="text-center">
      <Text className="sm:flex justify-center gap-1" type="secondary">
        <div>
          Made with passion by{" "}
          <Link href="https://klimer.eu/" target="_blank">
            Igor Klimer
          </Link>
          .
        </div>
        <div>
          Source code on
          <Link
            className="ms-2"
            href="https://github.com/klimeryk/dealwithit"
            target="_blank"
          >
            <GithubOutlined className="mr-1" />
            GitHub
          </Link>
          .
        </div>
      </Text>
    </div>
  );
}
