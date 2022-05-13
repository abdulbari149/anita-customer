import Styled from 'styled-components/native'

const Input = Styled.TextInput`
  padding: 8px 0 8px 0;
  border-bottom-width: 1px;
  border-color: #999;
  font-size: 16px;
`

const ErrorMessage = Styled.Text`
  margin-top: 8;
  margin-bottom: 8;
  color: #e74c3c;
  font-weight: 600;
`

const Spacer = Styled.View`
  height: 8px;
`

const Button = Styled.TouchableOpacity`
  background-color: green;
  padding: 16px;
  text-transform: uppercase;
`

const Label = Styled.Text`
  text-align: center;
  text-transform: uppercase;
  font-weight: 600;
  font-size: 12px;
  color: #fff;
`

export {
  Input,
  ErrorMessage,
  Spacer,
  Button,
  Label
}