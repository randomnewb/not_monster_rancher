export default class StateMachine {
  constructor(initialState, possibleStates, stateArgs) {
    this.initialState = initialState;
    this.possibleStates = possibleStates;
    this.stateArgs = stateArgs;
    this.state = null;

    // State initialization
    this.setState(initialState);
  }

  setState(stateName) {
    if (this.stateName === stateName) {
      return;
    }

    if (this.state && this.state.exit) {
      this.state.exit(...this.stateArgs);
    }

    this.state = this.possibleStates[stateName];
    this.state.enter(...this.stateArgs);
  }

  transition(stateName) {
    // Add your transition logic here
    this.setState(stateName);
  }

  step() {
    if (this.state && this.state.execute) {
      this.state.execute(...this.stateArgs);
    }
  }
}
