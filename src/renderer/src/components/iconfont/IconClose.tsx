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

const IconClose: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'px'} height={size + 'px'} style={style} {...rest}>
      <path
        d="M300.8 240.448l211.2 211.2 211.2-211.2 60.352 60.352-211.2 211.2 211.2 211.2-60.352 60.352-211.2-211.2-211.2 211.2-60.352-60.352 211.2-211.2-211.2-211.2 60.352-60.352z"
        fill={getIconColor(color, 0, '#333333')}
      />
    </svg>
  );
};

export default IconClose;
