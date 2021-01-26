import React from 'react'
import { connect } from 'dva'
import { Button, Form, Icon, Input, message } from 'antd'
import moment from 'moment'
import { login, register, getUserList } from '@/services/auth'
import styles from './index.less'

const FormItem = Form.Item

function mapStateToProps(state) {
  const { locale, email, userConfig } = state.global
  return {
    locale, email, userConfig,
  }
}
@connect(mapStateToProps)
class NormalLoginForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      type: 'login',
    }
  }

  compareToFirstPassword = (rule, value, callback) => {
    const { form } = this.props
    if (value && value !== form.getFieldValue('password')) {
      callback('两次输入密码不同!')
    } else {
      callback()
    }
  }

  handleSubmit = (e) => {
    e.preventDefault()
    this.props.form.validateFields(async (err, values) => {
      if (!err) {
        const { email, password } = values
        const data = this.state.type === 'login' ? await login({
          email,
          password,
        }) : await register({
          email,
          password,
        })
        if (data.code === '0') {
          if (this.state.type === 'login') {
            window.localStorage.setItem('email', email)
            window.localStorage.setItem('id', data.id)
            window.localStorage.setItem('expire', moment().subtract(-2, 'hours').format('YYYY-MM-DD HH:mm:ss'))
            this.handleUserList(email, data.id)
          } else {
            const newData = await login({
              email,
              password,
            })
            window.localStorage.setItem('email', email)
            window.localStorage.setItem('id', newData.id)
            window.localStorage.setItem('expire', moment().subtract(-2, 'hours').format('YYYY-MM-DD HH:mm:ss'))
            this.handleUserList(values.email, newData.id)
          }
        } else if (data.code === '10002') {
          message.error('该邮箱已注册！')
        } else {
          message.error('操作失败，请检查邮箱和密码！')
        }
      }
    })
  }

  handleUserList = async (email) => {
    const data = await getUserList({ email })
    if (data.data) {
      console.log(email)
      await this.props.dispatch({
        type: 'global/updateState',
        payload: {
          email,
          userConfig: {
            ...data.data,
          },
        },
      })
      this.props.close()
    }
  }

  handleChange = () => {
    this.setState({ type: this.state.type === 'register' ? 'login' : 'register' })
    this.props.form.setFieldsValue({
      email: '',
      password: '',
    })
  }

  render() {
    const { getFieldDecorator } = this.props.form
    return (
      <Form onSubmit={this.handleSubmit} className={styles['login-form']}>
        <FormItem>
          {getFieldDecorator('email', {
            rules: [{ required: true, message: '请输入邮箱账号!' }],
          })(<Input prefix={<Icon type="user" style={{ fontSize: 13 }} />} placeholder="请输入邮箱账号" />)}
        </FormItem>
        <FormItem>
          {getFieldDecorator('password', {
            rules: [{ required: true, message: '请输入密码!' }],
          })(<Input prefix={<Icon type="lock" style={{ fontSize: 13 }} />} type="password" placeholder="请输入密码" />)}
        </FormItem>
        {
              this.state.type === 'register'
                ? (
                  <FormItem>
                    {getFieldDecorator('confirm', {
                      rules: [{ required: true, message: '请输入密码!' }, {
                        validator: this.compareToFirstPassword,
                      }],
                    })(<Input prefix={<Icon type="lock" style={{ fontSize: 13 }} />} type="password" placeholder="请重复确认密码" />)}
                  </FormItem>
                ) : null
            }
        <FormItem>
          <Button type="primary" size="large" htmlType="submit" className={styles['login-form-button']}>
            {this.state.type === 'login' ? '登录' : '注册'}
          </Button>
          <a
            style={{
              textAlign: 'center', fontSize: 13, display: 'block',
            }}
            onClick={() => this.handleChange()}
          >
            {this.state.type === 'login' ? '没有账号？点击注册' : '已有账号？返回登录'}
          </a>
          <span style={{
            color: '#a5a1a1', display: 'block', textAlign: 'center', fontSize: 13,
          }}
          >
            有问题请联系工程师: autumnchenqy@aliyun.com
          </span>
        </FormItem>
      </Form>
    )
  }
}

const WrappedNormalLoginForm = Form.create()(NormalLoginForm)

export default connect()(Form.create()(WrappedNormalLoginForm))
