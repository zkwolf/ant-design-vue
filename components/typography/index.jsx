import Typography from './Typography';
import Text from './Text';
import Title from './Title';
import Paragraph from './Paragraph';

Typography.install = function(app) {
  app.component(Typography.name, Typography);
  app.component(Text.displayName, Text);
  app.component(Title.displayName, Title);
  app.component(Paragraph.displayName, Paragraph);
};

export default Typography;
