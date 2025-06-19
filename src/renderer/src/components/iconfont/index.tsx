/* tslint:disable */
/* eslint-disable */

import { SVGAttributes, FunctionComponent } from 'react';
import IconClose from './IconClose';
import IconAddCircle from './IconAddCircle';
import IconAdjustment from './IconAdjustment';
import IconApp from './IconApp';
import IconArrowDown from './IconArrowDown';
import IconArrowDownCircle from './IconArrowDownCircle';
import IconArrowLeft from './IconArrowLeft';
import IconArrowLeftCircle from './IconArrowLeftCircle';
import IconArrowRight from './IconArrowRight';
export { default as IconClose } from './IconClose';
export { default as IconAddCircle } from './IconAddCircle';
export { default as IconAdjustment } from './IconAdjustment';
export { default as IconApp } from './IconApp';
export { default as IconArrowDown } from './IconArrowDown';
export { default as IconArrowDownCircle } from './IconArrowDownCircle';
export { default as IconArrowLeft } from './IconArrowLeft';
export { default as IconArrowLeftCircle } from './IconArrowLeftCircle';
export { default as IconArrowRight } from './IconArrowRight';

export type IconNames = 'close' | 'add-circle' | 'adjustment' | 'app' | 'arrow-down' | 'arrow-down-circle' | 'arrow-left' | 'arrow-left-circle' | 'arrow-right';

interface Props extends Omit<SVGAttributes<SVGElement>, 'color'> {
  name: IconNames;
  size?: number;
  color?: string | string[];
}

const IconFont: FunctionComponent<Props> = ({ name, ...rest }) => {
  switch (name) {
    case 'close':
      return <IconClose {...rest} />;
    case 'add-circle':
      return <IconAddCircle {...rest} />;
    case 'adjustment':
      return <IconAdjustment {...rest} />;
    case 'app':
      return <IconApp {...rest} />;
    case 'arrow-down':
      return <IconArrowDown {...rest} />;
    case 'arrow-down-circle':
      return <IconArrowDownCircle {...rest} />;
    case 'arrow-left':
      return <IconArrowLeft {...rest} />;
    case 'arrow-left-circle':
      return <IconArrowLeftCircle {...rest} />;
    case 'arrow-right':
      return <IconArrowRight {...rest} />;

  }

  return null;
};

export default IconFont;
