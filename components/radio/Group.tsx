import { provide, nextTick, defineComponent, ref, watch, computed } from 'vue';
import classNames from '../_util/classNames';
import PropTypes from '../_util/vue-types';
import Radio from './Radio';
import { tuple } from '../_util/type';
import { RadioChangeEvent } from './interface';
import useConfigInject from '../_util/hooks/useConfigInject';

export default defineComponent({
  name: 'ARadioGroup',
  props: {
    prefixCls: PropTypes.string,
    defaultValue: PropTypes.any,
    value: PropTypes.any,
    size: PropTypes.oneOf(tuple('large', 'default', 'small')).def('default'),
    options: PropTypes.array,
    disabled: PropTypes.looseBool,
    name: PropTypes.string,
    buttonStyle: PropTypes.string.def('outline'),
    onChange: PropTypes.func,
  },
  emits: ['update:value', 'change'],
  setup(props, { emit, slots }) {
    const { prefixCls } = useConfigInject('radio', props);
    const updatingValue = ref(false);
    const stateValue = ref(props.value || props.defaultValue);

    watch(
      () => props.value,
      val => {
        updatingValue.value = false;
        stateValue.value = val;
      },
    );

    const onRadioChange = (e: RadioChangeEvent) => {
      const lastValue = stateValue.value;
      const { value } = e.target;
      if (typeof props.value === 'undefined') {
        stateValue.value = value;
      }
      // nextTick for https://github.com/vueComponent/ant-design-vue/issues/1280
      if (!updatingValue.value && value !== lastValue) {
        updatingValue.value = true;
        emit('update:value', value);
        emit('change', e);
      }
      nextTick(() => {
        updatingValue.value = false;
      });
    };

    const classString = computed(() => {
      const groupPrefixCls = `${prefixCls.value}-group`;
      return classNames(groupPrefixCls, `${groupPrefixCls}-${props.buttonStyle}`, {
        [`${groupPrefixCls}-${props.size}`]: props.size,
      });
    });

    provide('radioGroupContext', {
      name: props.name,
      stateValue: stateValue,
      disabled: props.disabled,
      onRadioChange,
    });

    return () => {
      let children = slots.default?.();

      // 如果存在 options, 优先使用
      if (props.options?.length > 0) {
        children = (props.options as any).map(option => {
          if (typeof option === 'string') {
            return (
              <Radio
                key={option}
                prefixCls={prefixCls.value}
                disabled={props.disabled}
                value={option}
                checked={stateValue.value === option}
              >
                {option}
              </Radio>
            );
          }
          return (
            <Radio
              key={`radio-group-value-options-${option.value}`}
              prefixCls={prefixCls.value}
              disabled={option.disabled || props.disabled}
              value={option.value}
              checked={stateValue.value === option.value}
            >
              {option.label}
            </Radio>
          );
        });
      }

      return <div class={classString.value}>{children}</div>;
    };
  },
});
