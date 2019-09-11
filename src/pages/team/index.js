import React from 'react'
import { Icon } from 'antd'
import { connect } from 'dva'
import nameList from '@/constants/team'
import styles from './index.css'

function mapStateToProps(state) {
  const { locale } = state.global
  return {
    locale,
  }
}
@connect(mapStateToProps)
class Team extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
    }
  }

  renderCards = () => {
    const result = []
    nameList.forEach((i) => {
      result.push(
        <div className={styles.teamCard}>
          <img src={i.avatar} alt="" />
          <div style={{ fontSize: 18, fontWeight: 700, marginTop: 8 }}>
            {i.name[this.props.locale]}
          </div>
          <span>
            <Icon style={{ color: '#1890ff', fontSize: 18 }} type="mail" />
            &nbsp;
            {i.email}
          </span>
        </div> // eslint-disable-line
      )
    })
    return result
  }

  render() {
    const { locale } = this.props
    return (
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <div style={{ fontSize: 42, marginBottom: 16 }}>
          {locale === 'cn' ? '团队成员' : 'Our Team'}
        </div>
        <div style={{ padding: '20px 5%' }}>
          <div style={{ margin: '0 auto', maxWidth: 1200, overflow: 'hidden' }}>
            {this.renderCards()}
          </div>
        </div>
      </div>
    )
  }
}

export default Team
