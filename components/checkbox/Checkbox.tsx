import {
  defineComponent,
  inject,
  nextTick,
  ExtractPropTypes,
  watch,
  onMounted,
  onBeforeUnmount,
  ref,
} from 'vue';
import PropTypes from '../_util/vue-types';
import classNames from '../_util/classNames';
import VcCheckbox from '../vc-checkbox';
import { defaultConfigProvider } from '../config-provider';
import warning from '../_util/warning';
import { RadioChangeEvent } from '../radio/interface';
import { useInjectContext } from './hooks/useCheckboxGroupContext';

function noop() {}

export const checkboxProps = {
  prefixCls: PropTypes.string,
  checked: PropTypes.looseBool,
  disabled: PropTypes.looseBool,
  value: PropTypes.any,
  name: PropTypes.string,
  id: PropTypes.string,
  indeterminate: PropTypes.looseBool,
  type: PropTypes.string.def('checkbox'),
  autofocus: PropTypes.looseBool,
  skipGroup: PropTypes.looseBool,
  onChange: PropTypes.func,
  'onUpdate:checked': PropTypes.func,
};

export type CheckboxProps = Partial<ExtractPropTypes<typeof checkboxProps>>;

export default defineComponent({
  name: 'ACheckbox',
  inheritAttrs: false,
  __ANT_CHECKBOX: true,
  props: checkboxProps,
  emits: ['change', 'update:checked'],
  setup(props, { slots, attrs, emit, expose }) {
    const configProvider = inject('configProvider', defaultConfigProvider);
    const checkboxGroup = useInjectContext();
    const vcCheckbox = ref<HTMLInputElement>();

    watch(
      () => props.value,
      (value, prevValue) => {
        if (props.skipGroup) {
          return;
        }
        nextTick(() => {
          if (checkboxGroup?.registerValue && checkboxGroup?.cancelValue) {
            checkboxGroup.cancelValue(prevValue);
            checkboxGroup.registerValue(value);
          }
        });
      },
    );

    onMounted(() => {
      if (checkboxGroup?.registerValue) {
        checkboxGroup.registerValue(props.value);
      }

      warning(
        typeof props.checked !== 'undefined' || checkboxGroup || typeof props.value === 'undefined',
        'Checkbox',
        '`value` is not validate prop, do you mean `checked`?',
      );
    });

    onBeforeUnmount(() => {
      if (checkboxGroup?.cancelValue) {
        checkboxGroup.cancelValue(props.value);
      }
    });

    const handleChange = (event: RadioChangeEvent) => {
      const targetChecked = event.target.checked;
      emit('update:checked', targetChecked);
      // emit('input', targetChecked);
      emit('change', event);
    };

    const focus = () => {
      vcCheckbox.value?.focus();
    };

    const blur = () => {
      vcCheckbox.value?.blur();
    };

    expose({ focus, blur });

    return () => {
      const children = slots.default?.();
      const { indeterminate, skipGroup, prefixCls: customizePrefixCls, ...restProps } = props;
      const { getPrefixCls, direction } = configProvider;
      const prefixCls = getPrefixCls('checkbox', customizePrefixCls);
      const {
        onMouseenter = noop,
        onMouseleave = noop,
        onInput,
        class: className,
        style,
        ...restAttrs
      } = attrs;
      const vcCheckboxProps: any = {
        ...restProps,
        prefixCls,
        ...restAttrs,
      };
      if (checkboxGroup && !skipGroup) {
        vcCheckboxProps.onChange = (...args) => {
          emit('change', ...args);
          checkboxGroup.toggleOption({ label: children, value: props.value });
        };
        vcCheckboxProps.name = checkboxGroup.name;
        vcCheckboxProps.checked = checkboxGroup.value.indexOf(props.value) !== -1;
        vcCheckboxProps.disabled = props.disabled || checkboxGroup.disabled;
      } else {
        vcCheckboxProps.onChange = handleChange;
      }
      const classString = classNames(
        {
          [`${prefixCls}-wrapper`]: true,
          [`${prefixCls}-rtl`]: direction === 'rtl',
          [`${prefixCls}-wrapper-checked`]: vcCheckboxProps.checked,
          [`${prefixCls}-wrapper-disabled`]: vcCheckboxProps.disabled,
        },
        className,
      );
      const checkboxClass = classNames({
        [`${prefixCls}-indeterminate`]: indeterminate,
      });
      return (
        <label
          class={classString}
          style={style}
          onMouseenter={onMouseenter as EventHandlerNonNull}
          onMouseleave={onMouseleave as EventHandlerNonNull}
        >
          <VcCheckbox {...vcCheckboxProps} class={checkboxClass} ref={vcCheckbox} />
          {children ? <span>{children}</span> : null}
        </label>
      );
    };
  },
});
