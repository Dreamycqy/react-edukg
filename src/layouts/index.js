import React from 'react'
import { Layout, ConfigProvider, Menu } from 'antd'
import { connect } from 'dva'
import Link from 'umi/link'
import zh_CN from 'antd/lib/locale-provider/zh_CN'
import en_GB from 'antd/lib/locale-provider/en_GB'
import menuList from '@/constants/menuList'
import logoFooter from '@/assets/logofooter.png'
import backGroundImg from '@/assets/14624.jpg'

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
              height: 40,
              backgroundColor: '#001529',
              borderBottom: '1px solid #e8e8e8',
              position: 'fixed',
              top: 0,
              zIndex: 999,
              width: '100%',
              padding: 0,
            }}
          >
            <div
              style={{
                width: 300,
                height: 31,
                marginLeft: 30,
                float: 'left',
                fontSize: 14,
                fontWeight: 700,
                lineHeight: '40px',
              }}
            >
              <Link to="">SEKG 科学教育图谱</Link>
            </div>
          </Header>
          <Content style={{ background: `url(${backGroundImg}) top`, backgroundSize: '120%', minHeight: 800, marginTop: 40 }}>
            {this.props.children}
          </Content>
          <Footer
            style={{ backgroundColor: '#001529', padding: 30 }}
          >
            <div style={{ padding: '0 30px' }}>
              <div style={{ textAlign: 'center', color: 'white' }}>
                <div style={{ display: 'inline-block' }}>
                  <img style={{ float: 'left', marginTop: 4, marginRight: 10 }} src={logoFooter} alt="" height="36px" />
                  <div style={{ float: 'left', textAlign: 'left' }}>
                    <div style={{ fontSize: 18 }}>知 识 工 程 研 究 室</div>
                    <div style={{ fontSize: 10 }}>互联网教育智能技术及应用国家工程实验室</div>
                  </div>
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
