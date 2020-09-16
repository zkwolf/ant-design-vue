import Base, { BlockProps } from './Base';

const Paragraph = (props, { slots }) => {
  const paragraphProps = {
    ...props,
    children: slots.default?.(),
    component: 'div',
  };

  return <Base {...paragraphProps}></Base>;
};

Paragraph.props = BlockProps;
Paragraph.displayName = 'ATypographyParagraph';

export default Paragraph;
