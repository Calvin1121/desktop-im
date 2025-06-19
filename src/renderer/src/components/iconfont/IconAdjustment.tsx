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

const IconAdjustment: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'px'} height={size + 'px'} style={style} {...rest}>
      <path
        d="M341.312 170.688a42.688 42.688 0 1 0 0 85.312 42.688 42.688 0 0 0 0-85.312z m-120.704 0a128 128 0 0 1 241.408 0h476.672V256H462.016a128 128 0 0 1-241.408 0H85.312V170.688h135.296zM561.92 469.312a128 128 0 0 1 241.472 0h135.296v85.376h-135.296a128 128 0 0 1-241.472 0H85.312V469.312H561.92z m120.768 0a42.688 42.688 0 1 0 0 85.376 42.688 42.688 0 0 0 0-85.376zM341.312 768a42.688 42.688 0 1 0 0 85.312 42.688 42.688 0 0 0 0-85.312z m-120.704 0a128 128 0 0 1 241.408 0h476.672v85.312H462.016a128 128 0 0 1-241.408 0H85.312V768h135.296z"
        fill={getIconColor(color, 0, '#333333')}
      />
    </svg>
  );
};

export default IconAdjustment;
