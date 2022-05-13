import React from "react";
import AnitaAPI from "../lib/AnitaAPI";
import { ParameterError } from "../lib/Errors";
import AppContext from "../contexts/app";

import { View } from "react-native";
import TextField from "../components/elements/TextField";
import Button from "../components/elements/Button";

export default class ChangePasswordScreen extends React.Component {
  static navigationOptions = {
    title: "Change your password",
  };

  static contextType = AppContext;

  state = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    errors: {},
    isLoading: false,
  };

  constructor(props) {
    super(props);

    this.newPasswordRef = React.createRef();
    this.confirmPasswordRef = React.createRef();
  }

  render() {
    const { currentPassword, newPassword, confirmPassword, errors, isLoading } =
      this.state;

    return (
      <View style={{ padding: 16 }}>
        <TextField
          label="Current password"
          value={currentPassword}
          error={errors.currentPassword}
          placeholder="Enter your current password"
          autoCapitalize="none"
          secureTextEntry
          onChangeText={(text) => this.setState({ currentPassword: text })}
          disabled={isLoading}
          returnKeyType="next"
          autoFocus={true}
          blurOnSubmit={false}
          onSubmitEditing={() => this.newPasswordRef.current.focus()}
        />
        <TextField
          ref={this.newPasswordRef}
          label="New password"
          value={newPassword}
          error={errors.newPassword}
          placeholder="Enter a new password"
          autoCapitalize="none"
          secureTextEntry
          onChangeText={(text) => this.setState({ newPassword: text })}
          disabled={isLoading}
          returnKeyType="next"
          blurOnSubmit={false}
          onSubmitEditing={() => this.confirmPasswordRef.current.focus()}
        />
        <TextField
          ref={this.confirmPasswordRef}
          label="Confirm password"
          value={confirmPassword}
          error={errors.confirmPassword}
          placeholder="Enter your new password again"
          autoCapitalize="none"
          secureTextEntry
          onChangeText={(text) => this.setState({ confirmPassword: text })}
          disabled={isLoading}
          returnKeyType="done"
        />
        <Button
          label="Change password"
          primary={true}
          onPress={this.onSubmit}
          disabled={isLoading}
        />
      </View>
    );
  }

  onSubmit = async () => {
    this.setState({ errors: {}, isLoading: true });

    const currentPassword = this.state.currentPassword.trim();
    const newPassword = this.state.newPassword.trim();
    const confirmPassword = this.state.confirmPassword.trim();

    if (newPassword !== confirmPassword) {
      this.setState({
        errors: { confirmPassword: "Passwords do not match." },
        isLoading: false,
      });
      return;
    }

    let account;

    try {
      account = await AnitaAPI.Account.changePassword(
        currentPassword,
        newPassword
      );
    } catch (error) {
      if (error instanceof ParameterError) {
        this.setState({ errors: { ...error.parameters }, isLoading: false });
        return;
      }

      alert(error.message);
      return;
    }

    this.context.set({ account });
    this.props.navigation.navigate("Account");
  };
}
