import { MoonOutlined, SunOutlined } from "@ant-design/icons";
import { Drawer, Segmented, Typography } from "antd";

import { useBoundStore } from "./store/index.ts";

const { Link, Paragraph, Title } = Typography;

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

function SettingsDrawer({ isOpen, onClose }: SettingsDrawerProps) {
  const theme = useBoundStore((state) => state.themeMode);
  const setTheme = useBoundStore((state) => state.setThemeMode);
  return (
    <Drawer title="Settings and help" onClose={onClose} open={isOpen}>
      <Title level={4}>Settings</Title>
      <Segmented
        onChange={setTheme}
        defaultValue={theme}
        options={[
          { label: "Light mode", value: "light", icon: <SunOutlined /> },
          { label: "Dark mode", value: "dark", icon: <MoonOutlined /> },
        ]}
      />
      <Title className="mt-4" level={4}>
        About
      </Title>
      <Paragraph>
        <ul>
          <li>
            All operations done fully client-side - no backend, no private data
            leaves your browser.
          </li>
          <li>
            Uses{" "}
            <Link href="https://ai.google.dev/edge/mediapipe/solutions/vision/face_detector">
              MediaPipe Face Detector task
            </Link>{" "}
            to automatically scale and position glasses on the detected faces.
          </li>
          <li>
            Extensive customization options for glasses:
            <ul>
              <li>
                Placement of glasses anywhere on the input image (including
                slightly going outside it).
              </li>
              <li>Change the size of glasses.</li>
              <li>No limit on the number of glasses.</li>
              <li>Flip the glasses vertically or horizontally.</li>
              <li>
                Customize the direction from which the glasses appear on the
                image.
              </li>
              <li>Different types of glasses.</li>
            </ul>
          </li>
          <li>
            GIF output options:
            <ul>
              <li>Looping mode.</li>
              <li>Number of frames.</li>
              <li>Frame delay.</li>
              <li>Separate delay setting for last frame.</li>
              <li>Output size.</li>
            </ul>
          </li>
          <li>Celebration confetti 🎉</li>
          <li>Easter eggs.</li>
        </ul>
      </Paragraph>
    </Drawer>
  );
}

export default SettingsDrawer;
