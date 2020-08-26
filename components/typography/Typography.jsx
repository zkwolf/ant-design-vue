import { ConfigConsumerProps } from '../config-provider';
import { initDefaultProps, getSlot } from '../_util/props-util';
import PropTypes from '../_util/vue-types';

import { defineComponent, inject } from 'vue';

export const TypographyProps = {
  component: PropTypes.string,
  prefixCls: PropTypes.string,
};

const Typography = defineComponent({
  name: 'ATypography',
  setup() {
    return {
      configProvider: inject('configProvider', ConfigConsumerProps),
    };
  },
  props: initDefaultProps(TypographyProps, {
    component: 'article',
  }),
  render() {
    const { getPrefixCls: customizePrefixCls, component: Component } = this.$props;
    const getPrefixCls = this.configProvider.getPrefixCls || ConfigConsumerProps.getPrefixCls;
    const prefixCls = getPrefixCls('typography', customizePrefixCls);
    const children = getSlot(this);

    return <Component class={prefixCls}>{children}</Component>;
  },
});

export default Typography;
