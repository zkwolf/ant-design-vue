import { defineComponent, ExtractPropTypes, inject, ref } from 'vue';
import PropTypes from '../_util/vue-types';
import VcCheckbox from '../vc-checkbox';
import classNames from '../_util/classNames';
import { RadioChangeEvent } from './interface';
import useConfigInject from '../_util/hooks/useConfigInject';

export const radioProps = {
  prefixCls: PropTypes.string,
  defaultChecked: PropTypes.looseBool,
  checked: PropTypes.looseBool,
  disabled: PropTypes.looseBool,
  isGroup: PropTypes.looseBool,
  value: PropTypes.any,
  name: PropTypes.string,
  id: PropTypes.string,
  autofocus: PropTypes.looseBool,
  type: PropTypes.string.def('radio'),
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
};

export type RadioProps = Partial<ExtractPropTypes<typeof radioProps>>;

export default defineComponent({
  name: 'ARadio',
  props: radioProps,
  emits: ['update:checked', 'update:value', 'change', 'blur', 'focus'],
  setup(props, { slots, emit, expose }) {
    const { prefixCls } = useConfigInject('radio', props);
    const radioGroupContext = inject('radioGroupContext', undefined);
    const vcCheckbox = ref<HTMLInputElement>();

    const focus = () => {
      vcCheckbox.value?.focus();
    };

    const blur = () => {
      vcCheckbox.value?.blur();
    };

    const handleChange = (event: RadioChangeEvent) => {
      const targetChecked = event.target.checked;
      emit('update:checked', targetChecked);
      emit('update:value', targetChecked);
      emit('change', event);
    };

    const onChange = (e: RadioChangeEvent) => {
      emit('change', e);
      radioGroupContext?.onRadioChange(e);
    };

    return () => {
      const rProps: RadioProps = {
        ...props,
        prefixCls: prefixCls.value,
      };

      if (radioGroupContext) {
        rProps.name = radioGroupContext.name;
        rProps.onChange = onChange;
        rProps.checked = props.value === radioGroupContext.stateValue.value;
        rProps.disabled = props.disabled || radioGroupContext.disabled;
      } else {
        rProps.onChange = handleChange;
      }
      const wrapperClassString = classNames({
        [`${prefixCls.value}-wrapper`]: true,
        [`${prefixCls.value}-wrapper-checked`]: rProps.checked,
        [`${prefixCls.value}-wrapper-disabled`]: rProps.disabled,
      });

      expose({ focus, blur });

      return (
        <label class={wrapperClassString}>
          <VcCheckbox {...rProps} ref={vcCheckbox} />
          {slots.default?.() && <span>{slots.default()}</span>}
        </label>
      );
    };
  },
});
