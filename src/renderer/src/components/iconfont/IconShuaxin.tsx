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

const IconShuaxin: FunctionComponent<Props> = ({ size = 18, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'px'} height={size + 'px'} style={style} {...rest}>
      <path
        d="M824.6 611.3c-3.2 165-138 297.8-303.8 297.8-167.8 0-303.9-136.1-303.9-303.9S353 301.3 520.8 301.3v-91.7c-218.5 0-395.6 177.1-395.6 395.6s177.1 395.6 395.6 395.6c216.5 0 392.3-173.8 395.6-389.5h-91.8z"
        fill={getIconColor(color, 0, '#5F5F5F')}
      />
      <path
        d="M839.9 265.7L520.8 64.2l-0.1 374.2z"
        fill={getIconColor(color, 1, '#5F5F5F')}
      />
    </svg>
  );
};

export default IconShuaxin;
