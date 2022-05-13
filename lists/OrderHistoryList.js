import React from 'react'
import Styled from 'styled-components/native'
import Moment from 'moment'

import { Text } from 'react-native'

export default ({ orders, onOrderSelected }) => {
  return (
    <Container>
      {orders.map(order => {
        let status

        if (order.declinedAt != null) {
          status = 'Cancelled'
        } else if (order.acceptedAt == null) {
          status = 'Pending'
        } else if (order.outForDeliveryAt == null) {
          status = 'In progress'
        } else if (order.deliveredAt == null) {
          status = 'Out for delivery'
        } else {
          status = 'Completed'
        }

        return (
          <Order key={order.id} onPress={() => onOrderSelected(order)}>
            <Row>
              <Detail style={{ flex: 1 }}>{Moment(order.createdAt).format('h:mm A D/M/YY')}</Detail>
              <Detail>{status}</Detail>
            </Row>
            <BusinessContainer>
              <LogoContainer>
                <Logo
                  source={{ uri: 'https://placehold.it/80/80'}}
                  resizeMethod='resize'
                />
              </LogoContainer>
              <NameContainer>
                <BusinessName>{order.premises.name}</BusinessName>
                <BusinessAddress>{order.premises.streetAddress} - {order.premises.postcode}</BusinessAddress>
              </NameContainer>
            </BusinessContainer>
            <BasketContainer>
              {order.basket.map(item => (
                <BasketRow key={item.id}>
                  <QuantityColumn>
                    <ColumnText>{item.quantity}</ColumnText>
                  </QuantityColumn>
                  <NameColumn>
                    <ColumnText>{item.name}</ColumnText>
                  </NameColumn>
                  <PriceColumn>
                    <ColumnText>£{((item.price * item.quantity) / 100).toFixed(2)}</ColumnText>
                  </PriceColumn>
                </BasketRow>
              ))}
              <Separator />
              <BasketRow>
                <Text style={{ flex: 1 }}>Subtotal</Text>
                <Text>£{(order.subtotal / 100).toFixed(2)}</Text>
              </BasketRow>
              <BasketRow>
                <Text style={{ flex: 1 }}>Delivery fee</Text>
                <Text>£{(order.deliveryFee / 100).toFixed(2)}</Text>
              </BasketRow>
              <BasketRow style={{ marginBottom: 0 }}>
                <Text style={{ flex: 1, fontWeight: 'bold' }}>Order total</Text>
                <Text style={{ fontWeight: 'bold' }}>£{((order.subtotal + order.deliveryFee) / 100).toFixed(2)}</Text>
              </BasketRow>
            </BasketContainer>
            {order.outForDeliveryAt != null && order.deliveredAt == null &&
              <Button onPress={() => onOrderSelected(order)}>
                <ButtonLabel>TRACK DELIVERY</ButtonLabel>
              </Button>
            }
          </Order>
        )
      })}
    </Container>
  )
}

const Container = Styled.View`
  padding: 16px;
`

const Order = Styled.TouchableOpacity`
  padding: 16px;
  margin-bottom: 16px;

  background-color: #fff;
  border: 1px solid rgba(0, 0, 0, 0.1);
`

const Row = Styled.View`
  flex: 1;
  flex-direction: row;
`

const Detail = Styled.Text`
  font-size: 14px;
  font-weight: bold;
`

const BusinessContainer = Styled.View`
  flex-direction: row;
  align-items: center;

  margin-top: 16px;
`

const LogoContainer = Styled.View`
  width: 48px;
  height: 48px;
  elevation: 5;
  shadow-color: #000;
  shadow-offset: 0px 1px;
  shadow-opacity: 0.20;
  shadow-radius: 1.41px;

  border-radius: 8px;
`

const Logo = Styled.Image`
  width: 100%;
  height: 100%;
  border-radius: 8px;
`

const NameContainer = Styled.View`
  flex: 1;
  justify-content: center;

  margin-left: 8px;
`

const BusinessName = Styled.Text`
  font-weight: bold;
  font-size: 16px;
`

const BusinessAddress = Styled.Text`
  margin-top: 4px;
  font-size: 12px;
  font-weight: 100;
`

const BasketContainer = Styled.View`
  margin-top: 16px;
`

const BasketRow = Styled.View`
  flex: 1;
  flex-direction: row;

  margin-bottom: 8px;
`

const QuantityColumn = Styled.View`
  margin-right: 16px;
`

const NameColumn = Styled.View`
  flex: 1;
`

const PriceColumn = Styled.View`
  margin-left: 16px;
`

const ColumnText = Styled.Text`
  font-size: 14px;
`

const Separator = Styled.View`
  height: 1px;
  background-color: rgba(0, 0, 0, 0.1);

  margin-top: 4px;
  margin-bottom: 8px;
`

const Button = Styled.TouchableOpacity`
  width: 100%;
  background-color: #008800;
  padding: 16px;
  margin-top: 16px;
`

const ButtonLabel = Styled.Text`
  font-size: 12px;
  font-weight: bold;
  text-align: center;
  color: #fff;
`