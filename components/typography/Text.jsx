import warning from '../_util/warning';
import Base, { BlockProps } from './Base';
import PropTypes from '../_util/vue-types';

const TextProps = {
  ...BlockProps,
  ellipsis: PropTypes.bool,
};

const Text = (props, { slots }) => {
  const { ellipsis } = props;
  warning(
    typeof ellipsis !== 'object',
    'Typography.Text',
    '`ellipsis` is only support boolean value.',
  );
  const textProps = {
    ...props,
    ellipsis: !!ellipsis,
    component: 'span',
  };

  return <Base {...textProps}>{slots.default?.()}</Base>;
};

Text.props = TextProps;

export default Text;
