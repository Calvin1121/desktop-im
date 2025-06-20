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

const IconAddCircle: FunctionComponent<Props> = ({ size = 18, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'px'} height={size + 'px'} style={style} {...rest}>
      <path
        d="M512 128.192a384 384 0 1 0 0 768 384 384 0 0 0 0-768z m-469.312 384a469.312 469.312 0 1 1 938.624 0 469.312 469.312 0 0 1-938.624 0z m512-234.624v192h192V554.88h-192v192H469.312v-192h-192V469.568h192v-192h85.376z"
        fill={getIconColor(color, 0, '#333333')}
      />
    </svg>
  );
};

export default IconAddCircle;
