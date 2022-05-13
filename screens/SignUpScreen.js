import React from "react";
import Styled from "styled-components/native";
import AnitaAPI from "../lib/AnitaAPI";
import { ParameterError } from "../lib/Errors";
import AppContext from "../contexts/app";

import {
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Text,
  View,
  Switch,
} from "react-native";
import TextField from "../components/elements/TextField";
import Button from "../components/elements/Button";

export default class SignUpScreen extends React.Component {
  static navigationOptions = {
    title: "Create an account",
  };

  static contextType = AppContext;

  state = {
    email: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    errors: {},
    isLoading: false,
    didConsentToMarketing: false,
  };

  constructor(props) {
    super(props);

    this.refScrollView = React.createRef();
    this.refPassword = React.createRef();
    this.refConfirmPassword = React.createRef();
    this.refFirstName = React.createRef();
    this.refLastName = React.createRef();
    this.refPhoneNumber = React.createRef();
  }

  render() {
    const {
      email,
      firstName,
      lastName,
      phoneNumber,
      password,
      confirmPassword,
      errors,
      isLoading,
      didConsentToMarketing,
    } = this.state;

    return (
      <ScrollView
        ref={this.refScrollView}
        horizontal={true}
        pagingEnabled={true}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
      >
        <Container>
          <TextField
            label="Email address"
            value={email}
            error={errors.email}
            placeholder="Email address"
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="next"
            autoFocus={true}
            blurOnSubmit={false}
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
            secureTextEntry
            returnKeyType="next"
            autoCapitalize="none"
            blurOnSubmit={false}
            onChangeText={(text) => this.setState({ password: text })}
            onSubmitEditing={() => this.refConfirmPassword.current.focus()}
            disabled={isLoading}
          />
          <TextField
            ref={this.refConfirmPassword}
            label="Confirm password"
            value={confirmPassword}
            error={errors.confirmPassword}
            placeholder="Confirm password"
            secureTextEntry
            autoCapitalize="none"
            returnKeyType="done"
            onChangeText={(text) => this.setState({ confirmPassword: text })}
            disabled={isLoading}
          />
          <Button
            label="Continue"
            primary={true}
            onPress={this.scrollToNextPage}
            disabled={isLoading}
          />
        </Container>
        <Container>
          <TextField
            ref={this.refFirstName}
            label="First name"
            value={firstName}
            error={errors.firstName}
            placeholder="First name"
            returnKeyType="next"
            blurOnSubmit={false}
            autoCapitalize="words"
            onChangeText={(text) => this.setState({ firstName: text })}
            onSubmitEditing={() => this.refLastName.current.focus()}
            disabled={isLoading}
          />
          <TextField
            ref={this.refLastName}
            label="Last name"
            value={lastName}
            error={errors.lastName}
            placeholder="Last name"
            returnKeyType="next"
            autoCapitalize="words"
            blurOnSubmit={false}
            onChangeText={(text) => this.setState({ lastName: text })}
            onSubmitEditing={() => this.refPhoneNumber.current.focus()}
            disabled={isLoading}
          />
          <TextField
            ref={this.refPhoneNumber}
            label="Phone number"
            value={phoneNumber}
            error={errors.phoneNumber}
            placeholder="Phone number"
            keyboardType="phone-pad"
            autoCapitalize="none"
            returnKeyType="done"
            onChangeText={(text) => this.setState({ phoneNumber: text })}
            disabled={isLoading}
          />
          <View
            style={{ flexDirection: "row", marginTop: 8, marginBottom: 16 }}
          >
            <Switch
              value={didConsentToMarketing}
              onValueChange={(value) =>
                this.setState({ didConsentToMarketing: value })
              }
              disabled={isLoading}
              style={{ marginRight: 16 }}
            />
            <Text style={{ flex: 1, fontSize: 14 }}>
              I would like to receive emails about promotions and events.
            </Text>
          </View>
          <Button
            label="Submit"
            primary={true}
            onPress={this.onSubmit}
            disabled={isLoading}
          />
        </Container>
      </ScrollView>
    );
  }

  scrollToNextPage = () => {
    this.refScrollView.current.scrollTo({
      x: Dimensions.get("window").width,
      y: 0,
      animated: true,
    });
    this.refFirstName.current.focus();
  };

  onSubmit = async () => {
    this.setState({ isLoading: true, errors: {} });

    const {
      email,
      password,
      confirmPassword,
      firstName,
      lastName,
      phoneNumber,
      didConsentToMarketing,
    } = this.state;

    if (password !== confirmPassword) {
      this.setState({
        isLoading: false,
        errors: { confirmPassword: "Passwords do not match." },
      });
      this.refScrollView.current.scrollTo({ x: 0, y: 0, animated: true });

      return;
    }

    let account;

    try {
      account = await AnitaAPI.Account.create(
        email,
        password,
        firstName,
        lastName,
        phoneNumber,
        didConsentToMarketing
      );
    } catch (error) {
      if (error instanceof ParameterError) {
        const errors = error.parameters;
        this.setState({ isLoading: false, errors });

        if (errors.email != null || errors.password != null) {
          this.refScrollView.current.scrollTo({ x: 0, y: 0, animated: true });
        }

        return;
      }

      alert(error.message);
      this.setState({ isLoading: false });
      return;
    }

    this.context.set({ account });
    this.props.navigation.navigate("Core");
  };
}

const Container = Styled.View`
  width: ${Dimensions.get("window").width};
  padding: 16px;
`;
