import Component from "./Component";
import Singable from "./Singable";

export default class BaseEditor extends Component {
  singable: Singable

  constructor(parent: Component, singable: Singable) {
    super(parent)
    this.singable = singable
  }
}