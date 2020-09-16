import PropTypes from '../_util/vue-types';
import warning from '../_util/warning';
import Base, { BlockProps } from './Base';
import omit from 'omit.js';

const TITLE_ELE_LIST = [1, 2, 3, 4, 5];

const TitleProps = {
  ...omit(BlockProps, ['strong']),
  level: PropTypes.oneOf(TITLE_ELE_LIST).def(1),
};

const Title = (props, { slots }) => {
  const { level = 1, ...restProps } = props;
  let component;
  if (TITLE_ELE_LIST.indexOf(level) !== -1) {
    component = `h${level}`;
  } else {
    warning(false, 'Typography', 'Title only accept `1 | 2 | 3 | 4 | 5` as `level` value.');
    component = 'h1';
  }

  const titleProps = {
    ...restProps,
    children: slots.default?.(),
    component,
  };

  return <Base {...titleProps}></Base>;
};

Title.props = TitleProps;
Title.displayName = 'ATypographyTilte';

export default Title;
