import React from 'react'
import { Card, Icon, Popover, Button } from 'antd'
import Styles from '../style.less'

const ButtonGroup = Button.Group

export default class LocalCard extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
    }
  }

  handleIcon = (title) => {
    switch (title) {
      case 'graph':
        return 'dot-chart'
      case 'property':
        return 'file'
      case 'picture':
        return 'picture'
      case 'video':
        return 'play-circle'
      case 'question':
        return 'read'
      default:
        return ''
    }
  }

  handleTitle = (title) => {
    switch (title) {
      case 'graph':
        return '知识地图'
      case 'property':
        return '知识卡片'
      case 'picture':
        return '相关图片'
      case 'video':
        return '教学视频'
      case 'question':
        return '相关习题'
      default:
        return ''
    }
  }

  renderChildren = (value) => {
    return React.Children.map(this.props.children, (child) => {
      return React.cloneElement(child, {
        data: value,
      })
    })
  }

  render() {
    const { value, show, title, selectChart } = this.props
    return (
      <Card
        className={Styles.myCard}
        id={`anchor_${title}`}
        bordered={false}
        style={{ display: show === true ? 'block' : 'none', margin: 20 }}
        title={(
          <span style={{ color: '#fff' }}>
            <Icon type={this.handleIcon(title)} style={{ color: '#fff', marginRight: 10 }} />
            {this.handleTitle(title)}
          </span>
        )}
        extra={(
          <div>
            <Popover
              content={(
                <div style={{ width: 420 }}>
                  关系图：双击蓝色集合节点，展开同类集合下的子节点，大于50个子节点的集合将以列表显示。
                  单击子节点选中并移动至对应词条，关系图随之延伸。左侧列表包括关联知识点推荐和跳转历史。
                </div>
                      )}
              title="说明"
            >
              <a style={{ marginRight: 20, fontSize: 18 }} href="javascript:;"><Icon type="question-circle" /></a>
            </Popover>
            <ButtonGroup style={{ marginRight: 20 }}>
              <Button
                type={selectChart === 'relation' ? 'primary' : 'none'}
                onClick={() => this.props.onSelect('relation')}
              >
                关系图
              </Button>
              <Button
                type={selectChart === 'think' ? 'primary' : 'none'}
                onClick={() => this.props.onSelect('think')}
              >
                思维导图
              </Button>
            </ButtonGroup>
            <Button
              type="primary"
              onClick={() => {}}
            >
              下载
            </Button>
          </div>
        )}
      >
        <div style={{ height: 480 }}>
          {this.renderChildren(value)}
        </div>
      </Card>
    )
  }
}
