import { factory } from "./core";
export { subscribe, publish } from "./helpers";
export default function TypePicker(options: TypePickerOptions) {
  const TypePickerCore = factory();
  const instance = new TypePickerCore(options);
  for (let key in instance) {
    Object.defineProperty(this, key, {
      value: instance[key],
      writable: true,
      configurable: false,
      enumerable: false
    });
  }
}
