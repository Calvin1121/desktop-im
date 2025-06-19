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

const IconArrowLeftCircle: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'px'} height={size + 'px'} style={style} {...rest}>
      <path
        d="M896 512A384 384 0 1 0 128 512a384 384 0 0 0 768 0zM512 42.688a469.312 469.312 0 1 1 0 938.624A469.312 469.312 0 0 1 512 42.688z m234.688 512H422.976l128 128-60.288 60.352L259.648 512l231.04-231.04 60.288 60.352-128 128h323.712v85.376z"
        fill={getIconColor(color, 0, '#333333')}
      />
    </svg>
  );
};

export default IconArrowLeftCircle;
