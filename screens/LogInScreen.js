import React from "react";
import AnitaAPI from "../lib/AnitaAPI";
import AppContext from "../contexts/app";
import { ParameterError } from "../lib/Errors";

import { View } from "react-native";
import TextField from "../components/elements/TextField";
import Button from "../components/elements/Button";

export default class LogInScreen extends React.Component {
  static navigationOptions = {
    title: "Log in",
  };

  static contextType = AppContext;

  state = {
    email: "",
    password: "",
    errors: {},
    isLoading: false,
  };

  constructor(props) {
    super(props);

    this.refPassword = React.createRef();
  }

  render() {
    const { email, password, errors, isLoading } = this.state;

    return (
      <View style={{ padding: 16 }}>
        <TextField
          label="Email address"
          value={email}
          error={errors.email}
          placeholder="Email address"
          keyboardType="email-address"
          autoCapitalize="none"
          returnKeyType="next"
          blurOnSubmit={false}
          autoFocus={true}
          onChangeText={(text) => this.setState({ email: text })}
          onSubmitEditing={() => this.refPassword.current.focus()}
          disabled={isLoading}
        />
        <TextField
          ref={this.refPassword}
          label="Password"
          value={password}
          error={errors.password}
          placeholder="Password"
          autoCapitalize="none"
          secureTextEntry
          returnKeyType="done"
          onChangeText={(text) => this.setState({ password: text })}
          disabled={isLoading}
        />
        <Button
          label="Submit"
          primary={true}
          onPress={this.onSubmit}
          disabled={isLoading}
        />
        <Button
          label="Forgot your password?"
          style={{ marginTop: 16 }}
          disabled={isLoading}
          onPress={this.onForgotPasswordPressed}
        />
      </View>
    );
  }

  onSubmit = async () => {
    this.setState({ isLoading: true, errors: {} });

    const { email, password } = this.state;
    let account;

    try {
      account = await AnitaAPI.Account.logIn(email, password);
    } catch (error) {
      if (error instanceof ParameterError) {
        this.setState({ isLoading: false, errors: error.parameters });
        return;
      }

      alert(error.message);
      this.setState({ isLoading: false });
      return;
    }

    this.context.set({ account });
    this.props.navigation.navigate("Core");
  };

  onForgotPasswordPressed = () => {
    this.props.navigation.navigate("ResetPassword");
  };
}
