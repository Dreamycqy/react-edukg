import React from 'react'
import { Layout, ConfigProvider, Menu } from 'antd'
import { connect } from 'dva'
import router from 'umi/router'
import Link from 'umi/link'
import zh_CN from 'antd/lib/locale-provider/zh_CN'
import en_GB from 'antd/lib/locale-provider/en_GB'
import menuList from '@/constants/menuList'
import logoFooter from '@/assets/logofooter.png'
import qrcode from '@/assets/qrcode.png'

const {
  Header, Footer, Content,
} = Layout

function mapStateToProps(state) {
  const { locale } = state.global
  return {
    locale,
  }
}
@connect(mapStateToProps)
class MainLayout extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      key: window.location.pathname.split('/')[1] || 'home',
    }
  }

  handleSelect = (key) => {
    this.setState({ key })
    router.push(`/${key === 'home' ? '' : key}`)
  }

  handleLocaleChange = () => {
    this.props.dispatch({
      type: 'global/updateState',
      payload: {
        locale: this.props.locale === 'cn' ? 'en' : 'cn',
      },
    })
  }

  makeMenu = () => {
    const result = []
    for (const i in menuList) { // eslint-disable-line
      result.push(<Menu.Item key={i}>{menuList[i][this.props.locale]}</Menu.Item>)
    }
    return result
  }

  render() {
    return (
      <Layout>
        <ConfigProvider locale={this.props.locale === 'cn' ? zh_CN : en_GB}>
          <Header
            style={{
              height: 60,
              backgroundColor: '#fff',
              borderBottom: '1px solid #e8e8e8',
              position: 'fixed',
              top: 0,
              zIndex: 999,
              width: '100%',
            }}
          >
            <div
              style={{
                width: 300,
                height: 31,
                marginLeft: 30,
                float: 'left',
                fontSize: 28,
                fontWeight: 700,
                lineHeight: '60px',
              }}
            >
              <Link to="">SEKG 科学教育图谱</Link>
            </div>
            {/* <div
              style={{
                lineHeight: '58px', position: 'absolute', right: 80, cursor: 'pointer',
              }}
              onClick={() => this.handleLocaleChange()}
            >
              {this.props.locale === 'cn' ? 'EN' : '中文'}
            </div>
            <div
              style={{
                lineHeight: '58px', position: 'absolute', right: 30, cursor: 'pointer',
              }}
              onClick={() => window.open('http://edukg.cn/qa-api')}
            >
              APIs
            </div> */}
            <Menu
              mode="horizontal"
              selectedKeys={[this.state.key]}
              style={{ lineHeight: '58px', position: 'absolute', right: 140 }}
              onClick={e => this.handleSelect(e.key)}
            >
              {this.makeMenu()}
            </Menu>
          </Header>
          <Content style={{ backgroundColor: '#fff', minHeight: 800, marginTop: 60 }}>
            {this.props.children}
          </Content>
          <Footer
            style={{
              backgroundColor: '#4f5056',
              color: '#e2e2e2',
              margin: 0,
              textAlign: 'left',
              padding: '45px 0',
              fontSize: 14,
            }}
          >
            <div>
              <div
                style={{
                  boxSizing: 'border-box',
                  marginLeft: 20,
                  marginRight: 20,
                }}
              >
                <div style={{ float: 'left' }}>
                  <p><img src={logoFooter} alt="" /></p>
                  <p>©版权所有：互联网教育智能技术及应用国家工程实验室</p>
                  <p>
                    地址：北京市昌平区沙河镇满井路甲2号 北京师范大学昌平校园&nbsp;|&nbsp;邮箱：
                    <a href="mailto:CIT@bnu.edu.cn">CIT@bnu.edu.cn</a>
                    &nbsp;|&nbsp;电话：010-58807205
                  </p>
                </div>
                <div style={{ float: 'right' }}>
                  <img src={qrcode} alt="qrcode" />
                </div>
              </div>
            </div>
          </Footer>
        </ConfigProvider>
      </Layout>
    )
  }
}

export default MainLayout
