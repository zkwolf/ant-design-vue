import omit from 'omit.js';
import LocaleReceiver from '../locale-provider/LocaleReceiver';
import warning from '../_util/warning';
import TransButton from '../_util/transButton';
import raf from '../_util/raf';
import isStyleSupport from '../_util/styleChecker';
import Editable from './Editable';
import measure from './util';
import BaseMixin from '../_util/BaseMixin';
import PropTypes from '../_util/vue-types';
import Typography, { TypographyProps } from './Typography';
import ResizeObserver from '../vc-resize-observer';
import Tooltip from '../tooltip';
import copy from 'copy-to-clipboard';
import { ConfigConsumerProps } from '../config-provider';
import CheckOutlined from '@ant-design/icons-vue/CheckOutlined';
import CopyOutlined from '@ant-design/icons-vue/CopyOutlined';
import EditOutlined from '@ant-design/icons-vue/EditOutlined';
import { getOptionProps } from '../_util/props-util';
import { inject } from 'vue';

const isLineClampSupport = isStyleSupport('webkitLineClamp');
const isTextOverflowSupport = isStyleSupport('textOverflow');

function toArray(value) {
  let ret = value;
  if (value === undefined) {
    ret = [];
  } else if (!Array.isArray(value)) {
    ret = [value];
  }
  return ret;
}

export const BlockProps = {
  ...TypographyProps,
  title: PropTypes.string,
  editable: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
  copyable: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
  type: PropTypes.oneOf(['secondary', 'danger', 'warning']),
  disabled: PropTypes.bool,
  ellipsis: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),

  // decorations
  code: PropTypes.bool,
  mark: PropTypes.bool,
  underline: PropTypes.bool,
  delete: PropTypes.bool,
  strong: PropTypes.bool,
  keyboard: PropTypes.bool,
};

const ELLIPSIS_STR = '...';

const Base = {
  name: 'Base',
  inheritAttrs: false,
  mixins: [BaseMixin],
  props: {
    editable: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
    copyable: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
    prefixCls: PropTypes.string,
    component: PropTypes.string,
    children: PropTypes.any,
    type: PropTypes.oneOf(['secondary', 'danger', 'warning']),
    disabled: PropTypes.bool,
    ellipsis: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
    code: PropTypes.bool,
    mark: PropTypes.bool,
    underline: PropTypes.bool,
    delete: PropTypes.bool,
    strong: PropTypes.bool,
    keyboard: PropTypes.bool,
  },
  setup() {
    return {
      configProvider: inject('configProvider', ConfigConsumerProps),
    };
  },
  data() {
    return {
      edit: false,
      copied: false,
      ellipsisText: '',
      ellipsisContent: null,
      isEllipsis: false,
      expanded: false,
      clientRendered: false,
      //locale
      expandStr: '',
      copyStr: '',
      copiedStr: '',
      editStr: '',

      copyId: undefined,
      rafId: undefined,
      prevProps: undefined,
    };
  },
  beforeDestory() {
    window.clearTimeout(this.copyId);
    raf.cancel(this.rafId);
  },
  mounted() {
    this.prevProps = { ...this.$props };
    this.setState({ clientRendered: true });
    this.resizeOnNextFrame();
  },
  updated() {
    const ellipsis = this.getEllipsis();
    const prevEllipsis = this.getEllipsis(this.prevProps);
    const children = this.children;

    if (children !== this.prevProps.children || ellipsis.rows !== prevEllipsis.rows) {
      this.resizeOnNextFrame();
    }
    this.prevProps = { ...this.$props, children };
  },
  watch: {
    ellipsis() {
      this.resizeOnNextFrame();
    },
  },
  methods: {
    saveTypographyRef(node) {
      this.typography = node;
    },

    saveEditIconRef(node) {
      this.editIcon = node;
    },
    // =============== Expand ===============
    onExpandClick() {
      const { onExpand } = this.getEllipsis();
      this.setState({ expanded: true });

      if (onExpand) {
        onExpand();
      }
    },
    // ================ Edit ================
    onEditClick() {
      this.triggerEdit(true);
    },

    onEditChange(value) {
      const { onChange } = this.getEditable();
      if (onChange) {
        onChange(value);
      }

      this.triggerEdit(false);
    },
    onEditCancel() {
      this.triggerEdit(false);
    },

    // ================ Copy ================
    onCopyClick() {
      const { copyable, children } = this.$props;

      const copyConfig = {
        ...(typeof copyable === 'object' ? copyable : null),
      };

      if (copyConfig.text === undefined) {
        copyConfig.text = children.length !== 0 ? children[0].children : '';
      }

      copy(copyConfig.text || '');

      this.setState({ copied: true }, () => {
        if (copyConfig.onCopy) {
          copyConfig.onCopy();
        }

        this.copyId = window.setTimeout(() => {
          this.setState({ copied: false });
        }, 3000);
      });
    },
    getEditable(props) {
      const { edit } = this;
      const { editable } = props || this.$props;
      if (!editable) return { editing: edit };

      return {
        editing: edit,
        ...(typeof editable === 'object' ? editable : null),
      };
    },
    getEllipsis(props) {
      const { ellipsis } = props || this.$props;
      if (!ellipsis) return {};

      return {
        rows: 1,
        expandable: false,
        ...(typeof ellipsis === 'object' ? ellipsis : null),
      };
    },

    triggerEdit(edit) {
      const { onStart } = this.getEditable();
      if (edit && onStart) {
        onStart();
      }

      this.setState({ edit }, () => {
        if (!edit) {
          this.editIcon.focus();
        }
      });
    },
    // ============== Ellipsis ==============
    resizeOnNextFrame() {
      raf.cancel(this.rafId);
      this.rafId = raf(() => {
        // Do not bind `syncEllipsis`. It need for test usage on prototype
        this.syncEllipsis();
      });
    },
    canUseCSSEllipsis() {
      const { clientRendered } = this;
      const { editable, copyable } = this.$props;
      const { rows, expandable, suffix } = this.getEllipsis();

      if (suffix) return false;

      // Can't use css ellipsis since we need to provide the place for button
      if (editable || copyable || expandable || !clientRendered) {
        return false;
      }

      if (rows === 1) {
        return isTextOverflowSupport;
      }

      return isLineClampSupport;
    },
    syncEllipsis() {
      const { ellipsisText, isEllipsis, expanded, children } = this;
      const { rows, suffix, onEllipsis } = this.getEllipsis();
      const ref = this.typography;
      if (!rows || rows < 0 || !ref || expanded) return;

      // Do not measure if css already support ellipsis
      if (this.canUseCSSEllipsis()) return;

      warning(
        children.every(child => typeof child.children === 'string'),
        'Typography',
        '`ellipsis` should use string as children only.',
      );

      const { content, text, ellipsis } = measure(
        ref.$el,
        { rows, suffix },
        children,
        this.renderOperations(true),
        ELLIPSIS_STR,
      );
      if (ellipsisText !== text || isEllipsis !== ellipsis) {
        this.setState({ ellipsisText: text, ellipsisContent: content, isEllipsis: ellipsis });
        if (isEllipsis !== ellipsis && onEllipsis) {
          onEllipsis(ellipsis);
        }
      }
    },
    wrapperDecorations({ mark, code, underline, delete: del, strong, keyboard }, content) {
      let currentContent = content;

      function wrap(needed, Tag) {
        if (!needed) return;

        currentContent = <Tag>{currentContent}</Tag>;
      }

      wrap(strong, 'strong');
      wrap(underline, 'u');
      wrap(del, 'del');
      wrap(code, 'code');
      wrap(mark, 'mark');
      wrap(keyboard, 'kbd');

      return currentContent;
    },
    renderExpand(forceRender) {
      const { expandable, symbol } = this.getEllipsis();
      const prefixCls = this.getPrefixCls();
      const { expanded, isEllipsis } = this;

      if (!expandable) return null;

      // force render expand icon for measure usage or it will cause dead loop
      if (!forceRender && (expanded || !isEllipsis)) return null;

      let expandContent;
      if (symbol) {
        expandContent = symbol;
      } else {
        expandContent = this.expandStr;
      }

      return (
        <a
          key="expand"
          class={`${prefixCls}-expand`}
          onClick={this.onExpandClick}
          aria-label={this.expandStr}
        >
          {expandContent}
        </a>
      );
    },
    renderEdit() {
      const { editable } = this.$props;
      if (!editable) return;

      const prefixCls = this.getPrefixCls();
      const { icon, tooltip } = editable;

      const title = tooltip || this.editStr;
      const ariaLabel = typeof title === 'string' ? title : '';

      return (
        <Tooltip key="edit" title={tooltip === false ? '' : title}>
          <TransButton
            ref={this.saveEditIconRef}
            class={`${prefixCls}-edit`}
            onClick={this.onEditClick}
            aria-label={ariaLabel}
          >
            {icon || <EditOutlined role="button" />}
          </TransButton>
        </Tooltip>
      );
    },
    renderCopy() {
      const { copied } = this;
      const { copyable } = this.$props;
      if (!copyable) return;

      const prefixCls = this.getPrefixCls();

      const { tooltips } = copyable;
      let tooltipNodes = toArray(tooltips);
      if (tooltipNodes.length === 0) {
        tooltipNodes = [this.copyStr, this.copiedStr];
      }
      const title = copied ? tooltipNodes[1] : tooltipNodes[0];
      const ariaLabel = typeof title === 'string' ? title : '';
      const icons = toArray(copyable.icon);

      return (
        <Tooltip key="copy" title={tooltips === false ? '' : title}>
          <TransButton
            class={[`${prefixCls}-copy`, { [`${prefixCls}-copy-success`]: copied }]}
            onClick={this.onCopyClick}
            aria-label={ariaLabel}
          >
            {copied ? icons[1] || <CheckOutlined /> : icons[0] || <CopyOutlined />}
          </TransButton>
        </Tooltip>
      );
    },
    renderEditInput() {
      const prefixCls = this.getPrefixCls();
      const { children } = this.$props;
      const { class: className, style } = this.$attrs;
      const { maxlength, autosize } = this.getEditable();

      const value = children[0] && children[0].children;

      return (
        <Editable
          class={className}
          style={style}
          prefixCls={prefixCls}
          value={value}
          maxlength={maxlength}
          autoSize={autosize}
          onSave={this.onEditChange}
          onCancel={this.onEditCancel}
        />
      );
    },
    renderOperations(forceRenderExpanded) {
      return [this.renderExpand(forceRenderExpanded), this.renderEdit(), this.renderCopy()].filter(
        node => node,
      );
    },
    getPrefixCls() {
      const { prefixCls: customizePrefixCls } = this;
      const getPrefixCls = this.configProvider.getPrefixCls;
      return getPrefixCls('typography', customizePrefixCls);
    },
    renderContent(locale) {
      const { ellipsisContent, isEllipsis, expanded, $attrs } = this;
      const props = { ...getOptionProps(this), ...$attrs };
      const {
        type,
        disabled,
        title,
        children,
        ['aria-label']: customAriaLabel,
        class: className,
        style,
        ...restProps
      } = props;
      const { rows, suffix } = this.getEllipsis();

      this.editStr = locale.edit;
      this.copyStr = locale.copy;
      this.copiedStr = locale.copied;
      this.expandStr = locale.expand;

      const textProps = omit(restProps, [
        'prefixCls',
        'editable',
        'copyable',
        'ellipsis',
        'mark',
        'code',
        'delete',
        'underline',
        'strong',
        'keybard',
      ]);

      const cssEllipsis = this.canUseCSSEllipsis();
      const cssTextOverflow = rows === 1 && cssEllipsis;
      const cssLineClamp = rows && rows > 1 && cssEllipsis;

      let textNode = children;
      let ariaLabel = null;

      // Only use js ellipsis when css ellipsis not support
      if (rows && isEllipsis && !expanded && !cssEllipsis) {
        ariaLabel = title;
        if (!title && children.every(item => typeof item.children === 'string')) {
          ariaLabel = children.map(item => item.children).reduce((cur, prev) => cur + prev, '');
        }
        // We move full content to outer element to avoid repeat read the content by accessibility
        textNode = (
          <span title={ariaLabel} aria-hidden="true">
            {ellipsisContent}
            {ELLIPSIS_STR}
            {suffix}
          </span>
        );
      } else {
        textNode = (
          <>
            {children}
            {suffix}
          </>
        );
      }

      textNode = this.wrapperDecorations(this.$props, textNode);

      const prefixCls = this.getPrefixCls();

      return (
        <ResizeObserver onResize={this.resizeOnNextFrame} disabled={!rows}>
          <Typography
            ref={this.saveTypographyRef}
            class={[
              { [`${prefixCls}-${type}`]: type },
              { [`${prefixCls}-disabled`]: disabled },
              { [`${prefixCls}-ellipsis`]: rows },
              { [`${prefixCls}-ellipsis-single-line`]: cssTextOverflow },
              { [`${prefixCls}-ellipsis-multiple-line`]: cssLineClamp },
              className,
            ]}
            style={{
              ...style,
              WebkitLineClamp: cssLineClamp ? rows : null,
            }}
            aria-label={customAriaLabel || ariaLabel}
            {...textProps}
          >
            {textNode}
            {this.renderOperations()}
          </Typography>
        </ResizeObserver>
      );
    },
  },
  render() {
    const { editable, children } = this.$props;

    warning(
      !editable || typeof (children && children[0].children) === 'string',
      'Typography',
      'When `editable` is enabled, the `children` should use string.',
    );
    const { editing } = this.getEditable();

    if (editing) {
      return this.renderEditInput();
    }
    return <LocaleReceiver componentName="Text" children={this.renderContent} />;
  },
};

export default Base;
