/* tslint:disable */
/* eslint-disable */

import React, { CSSProperties, SVGAttributes, FunctionComponent } from 'react';
import { getIconColor } from './helper';

interface Props extends Omit<SVGAttributes<SVGElement>, 'color'> {
  size?: number;
  color?: string | string[];
}

const DEFAULT_STYLE: CSSProperties = {
  display: 'block',
};

const IconArrowLeft: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'px'} height={size + 'px'} style={style} {...rest}>
      <path
        d="M832 554.688H337.664l192 192-60.352 60.352L174.272 512l295.04-295.04 60.352 60.352-192 192H832v85.376z"
        fill={getIconColor(color, 0, '#333333')}
      />
    </svg>
  );
};

IconArrowLeft.defaultProps = {
  size: 18,
};

export default IconArrowLeft;
