import KeyCode from '../_util/KeyCode';
import BaseMixin from '../_util/BaseMixin';
import PropTypes from '../_util/vue-types';
import TextArea from '../input/TextArea';
import EnterOutlined from '@ant-design/icons-vue/EnterOutlined';

const Editable = {
  mixins: [BaseMixin],
  props: {
    prefixCls: PropTypes.string,
    value: PropTypes.string,
    onSave: PropTypes.func,
    onCancel: PropTypes.func,
  },
  data() {
    return {
      current: this.value || '',
      lastKeyCode: undefined,
      inComposition: false,
      cancelFlag: false,
    };
  },
  watch: {
    value(val) {
      this.current = val;
    },
  },
  mounted() {
    const resizableTextArea = this.textArea?.resizableTextArea;
    const innerTextArea = resizableTextArea?.textArea;
    innerTextArea.focus();
    const { length } = innerTextArea.value;
    innerTextArea.setSelectionRange(length, length);
  },
  methods: {
    saveTextAreaRef(node) {
      this.textArea = node;
    },
    onChange({ target: { value } }) {
      this.setState({ current: value.replace(/[\r\n]/g, '') });
    },
    onCompositionStart() {
      this.inComposition = true;
    },
    onCompositionEnd() {
      this.inComposition = false;
    },
    onKeyDown(e) {
      const { keyCode } = e;
      // We don't record keyCode when IME is using
      if (this.inComposition) return;

      if (keyCode === KeyCode.ENTER) {
        e.preventDefault();
      }

      this.lastKeyCode = keyCode;
    },
    onKeyUp(e) {
      const { keyCode, ctrlKey, altKey, metaKey, shiftKey } = e;

      // Check if it's a real key
      if (
        this.lastKeyCode === keyCode &&
        !this.inComposition &&
        !ctrlKey &&
        !altKey &&
        !metaKey &&
        !shiftKey
      ) {
        if (keyCode === KeyCode.ENTER) {
          this.confirmChange();
        } else if (keyCode === KeyCode.ESC) {
          this.cancelFlag = true;
          this.$emit('cancel');
        }
      }
    },

    onBlur() {
      if (!this.cancelFlag) {
        this.confirmChange();
      }
    },

    confirmChange() {
      const { current } = this;
      this.$emit('save', current.trim());
    },
  },
  render() {
    const { current } = this;
    const { prefixCls } = this.$props;

    return (
      <div class={`${prefixCls} ${prefixCls}-edit-content`}>
        <TextArea
          ref={this.saveTextAreaRef}
          value={current}
          onChange={this.onChange}
          onKeydown={this.onKeyDown}
          onKeyup={this.onKeyUp}
          onCompositionStart={this.onCompositionStart}
          onCompositionEnd={this.onCompositionEnd}
          onBlur={this.onBlur}
          autoSize
        />
        <EnterOutlined class={`${prefixCls}-edit-content-confirm`} />
      </div>
    );
  },
};

export default Editable;
