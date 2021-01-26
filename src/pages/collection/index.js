import React from 'react'
import { Tabs, Layout, Menu } from 'antd'
import TestCollection from './components/testCollect'

const { TabPane } = Tabs
const { Sider, Content } = Layout

class Favorite extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      subject: 'chinese',
    }
  }

  render() {
    const { subject } = this.state
    return (
      <Tabs>
        <TabPane tab="习题集" key="1">
          <Layout>
            <Sider
              theme="light"
            >
              <Menu
                mode="inline"
                theme="light"
                selectedKeys={[subject]}
                onSelect={e => this.setState({ subject: e.key })}
                style={{ height: '100%', minHeight: 700 }}
              >
                <Menu.Item key="chinese">语文</Menu.Item>
                <Menu.Item key="math">数学</Menu.Item>
                <Menu.Item key="english">英语</Menu.Item>
              </Menu>
            </Sider>
            <Content>
              <TestCollection subject={subject} />
            </Content>
          </Layout>
        </TabPane>
        <TabPane tab="教学资源" key="2">
          Content of Tab Pane 2
        </TabPane>
      </Tabs>
    )
  }
}

export default Favorite
