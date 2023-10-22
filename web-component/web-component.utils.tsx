import ReactDOM from "react-dom";
import "@webcomponents/webcomponentsjs/webcomponents-bundle";
import "@webcomponents/webcomponentsjs/custom-elements-es5-adapter.js";

export class CustomElement extends HTMLElement {
  public observer;
  public ReactComponent = {};

  constructor() {
    super();
    this.observer = new MutationObserver(() => this.update());
    this.observer.observe(this, { attributes: true });
  }

  connectedCallback() {
    this.mount();
  }

  disconnectedCallback() {
    this.unmount();
    this.observer.disconnect();
  }

  update() {
    this.unmount();
    this.mount();
  }

  mount() {
    const { ReactComponent } = this;
    const props = {
      ...this.getProps(this.attributes, ReactComponent.propTypes),
      ...this.getEvents(ReactComponent.propTypes),
    };

    ReactDOM.render(<ReactComponent {...props} />, this);
  }
  unmount() {
    ReactDOM.unmountComponentAtNode(this);
  }

  getEvents(propTypes: any) {
    if (!propTypes) {
      return {};
    }
    return Object.keys(propTypes)
      .filter((key) => /on([A-Z].*)/.exec(key))
      .reduce(
        (events, ev) => ({
          ...events,
          [ev]: (args: any) =>
            this.dispatchEvent(new CustomEvent(ev, { ...args })),
        }),
        {}
      );
  }

  getProps(attributes: any, propTypes: any) {
    propTypes = propTypes || {};
    return [...attributes]
      .filter((attr) => attr.name !== "style")
      .map((attr) => this.convert(propTypes, attr.name, attr.value))
      .reduce((props, prop) => ({ ...props, [prop.name]: prop.value }), {});
  }

  convert(propTypes: any, attrName: any, attrValue: any) {
    const propName = Object.keys(propTypes).find(
      (key) => key.toLowerCase() === attrName
    );
    let value = attrValue;

    if (attrValue === "true" || attrValue === "false") {
      value = attrValue === "true";
    } else if (!isNaN(attrValue) && attrValue !== "") {
      value = +attrValue;
    } else if (/^{.*}/.exec(attrValue)) {
      value = JSON.parse(attrValue);
    }
    return { name: propName ? propName : attrName, value: value };
  }
}
