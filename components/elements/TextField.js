import React from 'react'
import { TextInput, Text, View } from 'react-native'

export default class TextField extends React.Component {
  constructor(props) {
    super(props)

    this.inputRef = React.createRef()
  }

  render() {
    const { style, label, error, disabled, onLayout, ...otherProps } = this.props

    return (
      <View onLayout={onLayout}>
        <Text
          style={{
            fontSize: 12,
            fontWeight: 'bold',
            color: '#008800'
          }}
        >
          {label.toUpperCase()}
        </Text>
        <TextInput
          ref={this.inputRef}
          style={{
            fontSize: 16,
            paddingVertical: 8,
            borderBottomWidth: 1,
            borderColor: '#ddd'
          }}
          placeholderTextColor='#ddd'
          editable={!disabled}
          {...otherProps}
        />
        <Text
          style={{
            color: '#bb0000',
            fontWeight: 'bold',
            paddingVertical: error == null || error === ''
              ? 0
              : 8
          }}
        >
          {error}
        </Text>
      </View>
    )
  }

  focus = () => {
    this.inputRef.current.focus()
  }
}