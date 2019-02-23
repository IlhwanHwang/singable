import Component from "./Component";
import Singable from "./Singable";

export default class BaseEditor extends Component {
  singable: Singable

  constructor(parent: Component, parentTarget: string = "default", singable: Singable) {
    super(parent, parentTarget)
    this.singable = singable
  }
}