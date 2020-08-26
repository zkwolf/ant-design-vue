import Base, { BlockProps } from './Base';

const Paragraph = (props, { slots }) => {
  const paragraphProps = {
    ...props,
    component: 'div',
  };

  return <Base {...paragraphProps}>{slots.default?.()}</Base>;
};

Paragraph.props = BlockProps;

export default Paragraph;
