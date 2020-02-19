import React from 'react'
import { Layout, ConfigProvider, Menu } from 'antd'
import { connect } from 'dva'
import router from 'umi/router'
import Link from 'umi/link'
import zh_CN from 'antd/lib/locale-provider/zh_CN'
import en_GB from 'antd/lib/locale-provider/en_GB'
import menuList from '@/constants/menuList'

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
                width: 120,
                height: 31,
                marginLeft: 30,
                float: 'left',
                fontSize: 28,
                fontWeight: 700,
                lineHeight: '60px',
              }}
            >
              <Link to="">eduKG</Link>
            </div>
            <div
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
            </div>
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
            style={{ textAlign: 'center' }}
          >
            <p>Copyright© 2018 KEG，Tsinghua University</p>
            <p>地址：清华大学东主楼</p>
          </Footer>
        </ConfigProvider>
      </Layout>
    )
  }
}

export default MainLayout
