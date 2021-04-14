import { defineComponent, inject } from 'vue';
import Radio, { radioProps, RadioProps } from './Radio';
import useConfigInject from '../_util/hooks/useConfigInject';

export default defineComponent({
  name: 'ARadioButton',
  props: {
    ...radioProps,
  },
  setup(props, { slots }) {
    const { prefixCls } = useConfigInject('radio-button', props);
    const radioGroupContext = inject<any>('radioGroupContext', undefined);

    return () => {
      const rProps: RadioProps = {
        ...props,
        prefixCls: prefixCls.value,
      };
      if (radioGroupContext) {
        rProps.onChange = radioGroupContext.onRadioChange;
        rProps.checked = props.value === radioGroupContext.stateValue.value;
        rProps.disabled = props.disabled || radioGroupContext.disabled;
      }
      return <Radio {...rProps}>{slots.default?.()}</Radio>;
    };
  },
});
