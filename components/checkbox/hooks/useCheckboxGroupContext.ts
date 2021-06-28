import { provide, inject, InjectionKey } from 'vue';
import { CheckboxGroupContext } from '../Group';

const checkboxGroup: InjectionKey<CheckboxGroupContext> = Symbol('CheckboxGroup');

const useProvideContext = (context: CheckboxGroupContext) => {
  provide(checkboxGroup, context);
};

const useInjectContext = () => {
  return inject(checkboxGroup, undefined);
};

export { useProvideContext, useInjectContext };
