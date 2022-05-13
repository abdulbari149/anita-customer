import React from 'react'

export default React.createContext({
  set: data => {},
  account: null,
  basket: [],
  promoCode: null
})