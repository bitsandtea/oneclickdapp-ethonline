// optional: only if you need old browser support
import "@webcomponents/webcomponentsjs/custom-elements-es5-adapter.js";
import "@webcomponents/webcomponentsjs/webcomponents-bundle";

import { CustomElement } from "./web-component.utils";
import MyTempWidget from "../components/MyTempWidget";

class MyWebComponentClass extends CustomElement {
  public ReactComponent = MyWebComponentClass;
}

// registers a custom element (= Web Component)
customElements.define("MyTempWidget", MyWebComponentClass);
