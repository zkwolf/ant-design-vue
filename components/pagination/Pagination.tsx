import { defineComponent, inject } from 'vue';
import LeftOutlined from '@ant-design/icons-vue/LeftOutlined';
import RightOutlined from '@ant-design/icons-vue/RightOutlined';
import DoubleLeftOutlined from '@ant-design/icons-vue/DoubleLeftOutlined';
import DoubleRightOutlined from '@ant-design/icons-vue/DoubleRightOutlined';
import { tuple } from '../_util/type';
import PropTypes, { withUndefined } from '../_util/vue-types';
import VcSelect from '../select';
import MiniSelect from './MiniSelect';
import LocaleReceiver from '../locale-provider/LocaleReceiver';
import { getOptionProps } from '../_util/props-util';
import VcPagination from '../vc-pagination';
import enUS from '../vc-pagination/locale/en_US';
import { defaultConfigProvider } from '../config-provider';
import classNames from '../_util/classNames';
import { useSizeContext } from '../config-provider/SizeContext';

export const PaginationProps = () => ({
  total: PropTypes.number,
  defaultCurrent: PropTypes.number,
  disabled: PropTypes.looseBool,
  current: PropTypes.number,
  defaultPageSize: PropTypes.number,
  pageSize: PropTypes.number,
  hideOnSinglePage: PropTypes.looseBool,
  showSizeChanger: PropTypes.looseBool,
  pageSizeOptions: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.number, PropTypes.string])),
  buildOptionText: PropTypes.func,
  showSizeChange: PropTypes.func,
  showQuickJumper: withUndefined(PropTypes.oneOfType([PropTypes.looseBool, PropTypes.object])),
  showTotal: PropTypes.any,
  size: PropTypes.oneOf(tuple('small', 'default')),
  simple: PropTypes.looseBool,
  locale: PropTypes.object,
  prefixCls: PropTypes.string,
  selectPrefixCls: PropTypes.string,
  itemRender: PropTypes.func,
  role: PropTypes.string,
  showLessItems: PropTypes.looseBool,
  onChange: PropTypes.func,
  onShowSizeChange: PropTypes.func,
  'onUpdate:current': PropTypes.func,
  'onUpdate:pageSize': PropTypes.func,
});

export const PaginationConfig = () => ({
  ...PaginationProps(),
  position: PropTypes.oneOf(tuple('top', 'bottom', 'both')),
});

export default defineComponent({
  name: 'APagination',
  inheritAttrs: false,
  props: {
    ...PaginationProps(),
  },
  emits: ['change', 'showSizeChange', 'update:current', 'update:pageSize'],
  setup() {
    return {
      configProvider: inject('configProvider', defaultConfigProvider),
      size: useSizeContext(),
    };
  },

  methods: {
    getIconsProps(prefixCls: string) {
      const prevIcon = (
        <a class={`${prefixCls}-item-link`}>
          <LeftOutlined />
        </a>
      );
      const nextIcon = (
        <a class={`${prefixCls}-item-link`}>
          <RightOutlined />
        </a>
      );
      const jumpPrevIcon = (
        <a class={`${prefixCls}-item-link`}>
          {/* You can use transition effects in the container :) */}
          <div class={`${prefixCls}-item-container`}>
            <DoubleLeftOutlined class={`${prefixCls}-item-link-icon`} />
            <span class={`${prefixCls}-item-ellipsis`}>•••</span>
          </div>
        </a>
      );
      const jumpNextIcon = (
        <a class={`${prefixCls}-item-link`}>
          {/* You can use transition effects in the container :) */}
          <div class={`${prefixCls}-item-container`}>
            <DoubleRightOutlined class={`${prefixCls}-item-link-icon`} />
            <span class={`${prefixCls}-item-ellipsis`}>•••</span>
          </div>
        </a>
      );
      return {
        prevIcon,
        nextIcon,
        jumpPrevIcon,
        jumpNextIcon,
      };
    },
    renderPagination(contextLocale: object) {
      const {
        prefixCls: customizePrefixCls,
        selectPrefixCls: customizeSelectPrefixCls,
        buildOptionText,
        size: customizeSize,
        locale: customLocale,
        ...restProps
      } = getOptionProps(this);
      const getPrefixCls = this.configProvider.getPrefixCls;
      const prefixCls = getPrefixCls('pagination', customizePrefixCls);
      const selectPrefixCls = getPrefixCls('select', customizeSelectPrefixCls);

      const mergeSize = customizeSize || this.size;
      const isSmall = mergeSize === 'small';
      const paginationProps = {
        prefixCls,
        selectPrefixCls,
        ...restProps,
        ...this.getIconsProps(prefixCls),
        selectComponentClass: isSmall ? MiniSelect : VcSelect,
        locale: { ...contextLocale, ...customLocale },
        buildOptionText: buildOptionText || this.$slots.buildOptionText,
        ...this.$attrs,
        class: classNames({ mini: isSmall }, this.$attrs.class),
        itemRender: this.itemRender || this.$slots.itemRender,
      };

      return <VcPagination {...paginationProps} />;
    },
  },
  render() {
    return (
      <LocaleReceiver
        componentName="Pagination"
        defaultLocale={enUS}
        children={this.renderPagination}
      />
    );
  },
});
