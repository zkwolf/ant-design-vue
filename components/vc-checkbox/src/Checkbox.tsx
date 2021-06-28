import { nextTick, defineComponent, onMounted, ref } from 'vue';
import classNames from '../../_util/classNames';
import PropTypes, { withUndefined } from '../../_util/vue-types';

const vcCheckboxProps = {
  prefixCls: PropTypes.string.def('rc-checkbox'),
  name: PropTypes.string,
  id: PropTypes.string,
  type: PropTypes.string.def('checkbox'),
  checked: withUndefined(PropTypes.oneOfType([PropTypes.number, PropTypes.looseBool])),
  disabled: PropTypes.looseBool,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
  onClick: PropTypes.func,
  tabindex: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  readonly: PropTypes.looseBool,
  required: PropTypes.looseBool,
  autofocus: PropTypes.looseBool,
  value: PropTypes.any,
};

export default defineComponent({
  name: 'Checkbox',
  inheritAttrs: false,
  props: vcCheckboxProps,
  setup(props, { attrs, emit, expose }) {
    const inputRef = ref<HTMLInputElement>();
    const eventShiftKey = ref();

    onMounted(() => {
      nextTick(() => {
        if (process.env.NODE_ENV === 'test') {
          if (props.autofocus) {
            inputRef.value?.focus();
          }
        }
      });
    });

    const focus = () => {
      inputRef.value?.focus();
    };

    const blur = () => {
      inputRef.value?.blur();
    };

    expose({ focus, blur });

    const handleChange = (e: Event) => {
      if (props.disabled) {
        return;
      }

      (e as any).shiftKey = eventShiftKey.value;
      const eventObj = {
        target: {
          ...props,
          checked: (e.target as HTMLInputElement).checked,
        },
        stopPropagation() {
          e.stopPropagation();
        },
        preventDefault() {
          e.preventDefault();
        },
        nativeEvent: e,
      };

      // fix https://github.com/vueComponent/ant-design-vue/issues/3047
      // 受控模式下维持现有状态
      (inputRef.value as any).checked = props.checked;
      emit('change', eventObj);
      eventShiftKey.value = false;
    };

    const onClick = (e: MouseEvent) => {
      emit('click', e);
      // onChange没能获取到shiftKey，使用onClick hack
      eventShiftKey.value = e.shiftKey;
    };

    return () => {
      const {
        prefixCls,
        name,
        id,
        type,
        disabled,
        readonly,
        tabindex,
        autofocus,
        value,
        required,
        onFocus,
        onBlur,
        ...others
      } = props;
      const { class: className, style } = attrs;
      const globalProps = Object.keys({ ...others, ...attrs }).reduce((prev, key) => {
        if (key.substr(0, 5) === 'aria-' || key.substr(0, 5) === 'data-' || key === 'role') {
          prev[key] = others[key];
        }
        return prev;
      }, {});

      const classString = classNames(prefixCls, className, {
        [`${prefixCls}-checked`]: props.checked,
        [`${prefixCls}-disabled`]: disabled,
      });

      const inputProps = {
        name,
        id,
        type,
        readonly,
        disabled,
        tabindex,
        class: `${prefixCls}-input`,
        checked: !!props.checked,
        autofocus,
        value,
        required,
        ...globalProps,
        onClick,
        onFocus,
        onBlur,
        onChange: handleChange,
      };

      return (
        <span class={classString} style={style}>
          <input ref={inputRef} {...inputProps} />
          <span class={`${prefixCls}-inner`} />
        </span>
      );
    };
  },
});
