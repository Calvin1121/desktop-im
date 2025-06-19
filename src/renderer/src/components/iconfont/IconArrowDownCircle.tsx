/* tslint:disable */
/* eslint-disable */

import { CSSProperties, SVGAttributes, FunctionComponent } from 'react';
import { getIconColor } from './helper';

interface Props extends Omit<SVGAttributes<SVGElement>, 'color'> {
  size?: number;
  color?: string | string[];
}

const DEFAULT_STYLE: CSSProperties = {
  display: 'block',
};

const IconArrowDownCircle: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'px'} height={size + 'px'} style={style} {...rest}>
      <path
        d="M512 128a384 384 0 1 0 0 768A384 384 0 0 0 512 128zM42.688 512a469.312 469.312 0 1 1 938.624 0A469.312 469.312 0 0 1 42.688 512z m512-234.688v323.712l128-128 60.288 60.288L512 764.352l-231.04-231.04 60.352-60.288 128 128V277.312h85.376z"
        fill={getIconColor(color, 0, '#333333')}
      />
    </svg>
  );
};

export default IconArrowDownCircle;
