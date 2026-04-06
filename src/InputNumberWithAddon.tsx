import { InputNumber, type InputNumberProps, Space } from 'antd';

interface Props extends React.PropsWithChildren<InputNumberProps<number>> {
  addon: string;
}

export default function InputNumberWithAddon({ addon, disabled, ...inputNumberProps }: Props) {
  return (
    <Space.Compact>
      <InputNumber {...inputNumberProps} disabled={disabled} />
      <Space.Addon disabled={disabled}>{addon}</Space.Addon>
    </Space.Compact>
  );
}
