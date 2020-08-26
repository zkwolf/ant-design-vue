import Typography from './Typography';
import Text from './Text';
import Title from './Title';
import Paragraph from './Paragraph';

Typography.install = function(app) {
  app.component(Typography.name, Typography);
  app.component('ATypographyText', Text);
  app.component('ATypographyTitle', Title);
  app.component('ATypographyParagraph', Paragraph);
};

export default Typography;
