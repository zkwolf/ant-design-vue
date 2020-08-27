import warning from '../_util/warning';
import Base, { BlockProps } from './Base';
import PropTypes from '../_util/vue-types';

const LinkProps = {
  ...BlockProps,
  ellipsis: PropTypes.bool,
};

const Link = (props, { slots }) => {
  const { ellipsis } = props;
  warning(
    typeof ellipsis !== 'object',
    'Typography.Text',
    '`ellipsis` is only support boolean value.',
  );
  const textProps = {
    ...props,
    children: slots.default?.(),
    ellipsis: !!ellipsis,
    component: 'span',
  };

  return <Base {...textProps}></Base>;
};

Link.props = LinkProps;

export default Link;
