import React from 'react'
import { Menu, Dropdown, Icon, Modal } from 'antd'
import { connect, routerRedux } from 'dva'
import Link from 'umi/link'
import moment from 'moment'
import LoginForm from '@/pages/login'
import { logout, fetchUserInfo, getUserList } from '@/services/auth'

const { confirm } = Modal

function mapStateToProps(state) {
  const { locale, email, userConfig } = state.global
  return {
    locale, email, userConfig,
  }
}
@connect(mapStateToProps)
class Home extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      visible: false,
    }
  }

  UNSAFE_componentWillMount = async () => {
    if (window.localStorage.email) {
      if (moment(window.localStorage.expire) < moment()) {
        // this.logout()
      }
      const data = await fetchUserInfo({ email: window.localStorage.email })
      if (data.code === '0') {
        await this.handleUserList(window.localStorage.email)
      } else {
        // this.logout()
      }
    }
  }

  handleUserList = async (email) => {
    const data = await getUserList({ email })
    if (data.data) {
      await this.props.dispatch({
        type: 'global/updateState',
        payload: {
          email,
          userConfig: {
            ...data.data,
          },
        },
      })
    }
  }

  handleClose = () => {
    this.setState({ visible: false })
  }

  logout = async () => {
    window.localStorage.clear()
    await logout({ email: this.props.email })
    window.location.href = '/'
  }

  showConfirm = () => {
    const that = this
    confirm({
      title: '前往用户信息填写页',
      content: '您尚未填写用户信息，平台功能将在信息填写完成后开放。点击前往用户信息填写页。',
      onOk() {
        that.jumpUserInfo()
      },
      onCancel() {
        that.showConfirm()
      },
    })
  }

  jumpUserInfo = () => {
    this.props.dispatch(routerRedux.push({
      pathname: '/knowledgeWiki/userConfig',
    }))
  }

  render() {
    const menu = (
      <Menu>
        <Menu.Item>
          <a
            onClick={() => this.logout()}
          >
            我的信息
          </a>
        </Menu.Item>
        <Menu.Item>
          <a
            onClick={() => this.logout()}
          >
            退出
          </a>
        </Menu.Item>
      </Menu>
    )
    const { visible } = this.state
    const { email, userConfig } = this.props
    return (
      <div
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
          <Link to="/">Edukg 基础教育知识图谱</Link>
        </div>
        {/* {
          email
            ? (
              <Dropdown overlay={menu}>
                <span style={{ float: 'right', lineHeight: '40px', marginRight: 20, color: 'white' }}>
                  {
                    userConfig.nickName === null ? email : userConfig.nickName
                  }
                  <Icon type="down" style={{ margin: '0 6px' }} />
                </span>
              </Dropdown>
            )
            : <a style={{ float: 'right', lineHeight: '40px', marginRight: 20, color: 'white' }} href="javascript:;" onClick={() => this.setState({ visible: true })}>请登录</a>
        } */}
        <Modal
          title="欢迎登陆教学平台"
          visible={visible}
          footer={null}
          onCancel={() => this.setState({ visible: false })}
        >
          <LoginForm close={this.handleClose} />
        </Modal>
      </div>
    )
  }
}

export default Home
