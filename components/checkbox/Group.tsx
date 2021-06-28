import {
  CSSProperties,
  defineComponent,
  computed,
  inject,
  PropType,
  ref,
  toRef,
  reactive,
  ExtractPropTypes,
} from 'vue';
import PropTypes from '../_util/vue-types';
import Checkbox from './Checkbox';
import { useProvideContext } from './hooks/useCheckboxGroupContext';
import { defaultConfigProvider } from '../config-provider';
import { VueNode } from '../_util/type';
import classNames from '../_util/classNames';

export type CheckboxValueType = string | number | boolean;

export interface CheckboxOptionType {
  label: VueNode;
  value: CheckboxValueType;
  disabled?: boolean;
  indeterminate?: boolean;
  style?: CSSProperties;
  onChange?: (e: Event) => void;
}

const checkboxGroupProps = {
  name: PropTypes.string,
  prefixCls: PropTypes.string,
  value: { type: Array as PropType<Array<CheckboxValueType>> },
  options: { type: Array as PropType<Array<CheckboxOptionType | string>> },
  disabled: PropTypes.looseBool,
  onChange: PropTypes.func,
};

export type CheckboxGroupProps = Partial<ExtractPropTypes<typeof checkboxGroupProps>>;

export interface CheckboxGroupContext {
  name?: string;
  toggleOption?: (option: CheckboxOptionType) => void;
  value?: any;
  disabled?: boolean;
  registerValue: (val: string) => void;
  cancelValue: (val: string) => void;
}

function noop() {}

export default defineComponent({
  name: 'ACheckboxGroup',
  props: checkboxGroupProps,
  emits: ['change', 'update:value'],
  setup(props, { emit, slots }) {
    const configProvider = inject('configProvider', defaultConfigProvider);

    const sValue = computed<CheckboxValueType[]>(() => props.value || []);
    const registeredValues = ref([]);

    const getOptions = () => {
      return (props.options || []).map(option => {
        if (typeof option === 'string') {
          return {
            label: option,
            value: option,
          };
        }
        let label = option.label;
        if (label === undefined && slots.label) {
          label = slots.label(option);
        }
        return { ...option, label };
      });
    };

    const cancelValue = (value: CheckboxValueType) => {
      registeredValues.value = registeredValues.value.filter(val => val !== value);
    };

    const registerValue = (value: CheckboxValueType) => {
      registeredValues.value = [...registeredValues.value, value];
    };

    const toggleOption = (option: CheckboxOptionType) => {
      const optionIndex = sValue.value.indexOf(option.value);
      const value = [...sValue.value];
      if (optionIndex === -1) {
        value.push(option.value);
      } else {
        value.splice(optionIndex, 1);
      }

      const options = getOptions();
      const val = value
        .filter(val => registeredValues.value.indexOf(val) !== -1)
        .sort((a, b) => {
          const indexA = options.findIndex(opt => opt.value === a);
          const indexB = options.findIndex(opt => opt.value === b);
          return indexA - indexB;
        });
      // emit('input', val);
      emit('update:value', val);
      emit('change', val);
    };

    useProvideContext(
      reactive({
        value: sValue,
        toggleOption,
        disabled: toRef(props, 'disabled'),
        name: toRef(props, 'name'),
        registerValue,
        cancelValue,
      }),
    );

    return () => {
      const { prefixCls: customizePrefixCls, options } = props;
      const { getPrefixCls, direction } = configProvider;
      const prefixCls = getPrefixCls('checkbox', customizePrefixCls);
      let children = slots.default?.();

      const groupPrefixCls = `${prefixCls}-group`;

      const classString = classNames(groupPrefixCls, {
        [`${groupPrefixCls}-rtl`]: direction === 'rtl',
      });

      if (options && options.length > 0) {
        children = getOptions().map(option => (
          <Checkbox
            prefixCls={prefixCls}
            key={option.value.toString()}
            disabled={'disabled' in option ? option.disabled : props.disabled}
            value={option.value}
            checked={sValue.value.indexOf(option.value) !== -1}
            onChange={option.onChange || noop}
            class={`${groupPrefixCls}-item`}
            style={option.style}
          >
            {option.label}
          </Checkbox>
        ));
      }
      return <div class={classString}>{children}</div>;
    };
  },
});
