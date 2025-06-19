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

const IconApp: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'px'} height={size + 'px'} style={style} {...rest}>
      <path
        d="M746.688 149.312a128 128 0 1 0 0 256 128 128 0 0 0 0-256z m-213.376 128a213.312 213.312 0 1 1 426.688 0 213.312 213.312 0 0 1-426.688 0z m-448-192h384v384h-384v-384z m85.376 85.376V384H384V170.688H170.688z m-85.376 384h384v384h-384v-384zM170.688 640v213.312H384V640H170.688z m384-85.312h384v384h-384v-384zM853.312 640H640v213.312h213.312V640z"
        fill={getIconColor(color, 0, '#333333')}
      />
    </svg>
  );
};

export default IconApp;
