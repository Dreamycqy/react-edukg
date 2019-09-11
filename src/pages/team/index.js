import React from 'react'
import { Icon } from 'antd'
import { connect } from 'dva'
import nameList from '@/constants/team'
import paperList from '@/constants/paper'
import paperimg from '@/assets/paper.png'
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

  renderPaperList = () => {
    const result = []
    paperList.forEach((i, index) => {
      result.push(
        <div style={{ borderBottom: index === paperList.length - 1 ? null : '1px solid #029ee8', padding: 14 }}>
          <img src={paperimg} alt="" width="14px" height="14px" />
          <span>{i.title}</span>
          &nbsp;
          <a href="javascript:;" onClick={() => window.open(i.link)}>{this.props.locale === 'cn' ? '论文PDF下载' : 'Download PDF'}</a>
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
        <div style={{ padding: '20px 5%', textAlign: 'left' }}>
          <div style={{ fontSize: 20, marginBottom: 10 }}>
            {locale === 'cn' ? '团队成员在知识图谱构建方面发表的相关论文：' : 'Published Papers: '}
          </div>
          <div style={{ margin: '0 auto', border: '2px solid #029ee8', borderRadius: 6 }}>
            {this.renderPaperList()}
          </div>
        </div>
      </div>
    )
  }
}

export default Team
