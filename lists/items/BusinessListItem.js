import React from 'react'
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'

export default class BusinessListItem extends React.Component {
  render() {
    return (
      <View style={styles.item}>
        <TouchableOpacity onPress={this.props.onSelected}>
          <View style={styles.header}>
            <Image
              style={styles.headerImage}
              source={{ uri: this.props.business.headerURL }}
              resizeMethod='resize'
              resizeMode='cover'
            />
          </View>
          <View style={styles.body}>
            <View style={styles.info}>
              <View style={styles.logoContainer}>
                <Image
                  style={styles.logo}
                  source={{ uri: this.props.business.logoURL}}
                  resizeMethod='resize'
                />
              </View>
              <View style={styles.nameContainer}>
                <Text style={styles.businessName}>{this.props.business.name}</Text>
                <Text style={styles.businessAddress}>{this.props.business.streetAddress} - {this.props.business.postcode}</Text>
              </View>
            </View>
            <View style={styles.details}>
              <View style={styles.detailContainer}>
                <Ionicons name='md-pin' size={20} color={'#884444'} />
                <Text style={styles.detailText}>{(this.props.business.distance / 1609.344).toFixed(2)} miles away</Text>
              </View>
              {this.props.business.deliveryFee >= 0 && !this.props.business.isComingSoon &&
                <View style={styles.detailContainer}>
                  <Ionicons name='md-pricetag' size={20} color={'#448844'} />
                  <Text style={styles.detailText}>
                    {this.props.isWithinDeliveryArea
                      ? `£${(this.props.business.deliveryFee / 100).toFixed(2)} to deliver to your area`
                      : `Not available in your area yet`
                    }
                  </Text>
                </View>
              }
              {!this.props.business.isComingSoon &&
                <View style={styles.detailContainer}>
                  <Ionicons name='md-time' size={20} color={'#444488'} />
                  <Text style={styles.detailText}>{this.props.business.openingHours}</Text>
                </View>
              }
              {/* {!this.props.business.isOnline &&
                <Text style={{ textAlign: 'center', fontWeight: 'bold', color: 'red', marginTop: 8 }}>
                  Currently not accepting orders.
                </Text>
              } */}
              {this.props.business.isComingSoon
                ? <Text style={styles.comingSoonText}>COMING SOON</Text>
                : <Text style={styles.infoText}>TAP HERE TO BROWSE MENU</Text>
              }
            </View>
          </View>
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  item: {
    marginLeft: 16,
    marginRight: 16,
    marginTop: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
    borderRadius: 8
  },
  header: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    overflow: 'hidden'
  },
  headerImage: {
    height: 128,
    width: '100%'
  },
  body: {
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 8,
    paddingBottom: 16
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginTop: -32,
    elevation: 5,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.22,
    shadowRadius: 3.84,
    // borderWidth: 2,
    // borderColor: '#fff'
  },
  logo: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  businessName: {
    fontWeight: 'bold',
    fontSize: 16
  },
  details: {
    marginTop: 16,
    justifyContent: 'center'
  },
  detailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '400',
  },
  nameContainer: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: 16
  },
  businessAddress: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '300'
  },
  infoText: {
    textAlign: 'center',
    fontWeight: '500',
    opacity: 0.75,
    marginTop: 16,
    fontSize: 12
  },
  comingSoonText: {
    color: '#CC0000',
    textAlign: 'center',
    fontWeight: '600',
    opacity: 1,
    marginTop: 16,
    fontSize: 12
  }
})