import React from 'react'
import { Card, Icon, Popover, Button } from 'antd'
import moment from 'moment'
import ExportJsonExcel from 'js-export-excel'
import edulogo from '@/assets/edulogo.png'
import Styles from '../style.less'

const ButtonGroup = Button.Group

export default class LocalCard extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
    }
  }

  handleOutput = () => {
    const option = {}
    if (this.props.dataConfig) {
      option.fileName = `${this.props.dataConfig.title}_知识卡片_${moment().format('YYYY-MM-DD_HH-mm-ss')}`
      option.datas = [
        {
          sheetData: this.props.dataConfig.dataSource,
          sheetName: '知识卡片',
          sheetFilter: this.props.dataConfig.sheetDataFilter,
          sheetHeader: this.props.dataConfig.sheetDataHeader,
        },
      ]
    }
    const exportExcel = new ExportJsonExcel(option)
    exportExcel.saveExcel()
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
      case 'books':
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
      case 'books':
        return '教材出处'
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
    const { value, show, title, showExtra, booksMode } = this.props
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
        extra={showExtra ? (
          <div>
            <Popover
              content={(
                <div style={{ width: 400 }}>
                  表格展示了词条关联的各知识点，下载文件时输出excel
                </div>
              )}
              title="说明"
            >
              <a style={{ marginRight: 20, fontSize: 18 }} href="javascript:;"><Icon type="question-circle" /></a>
            </Popover>
            <Button style={{ marginRight: 10 }} onClick={() => this.handleOutput()}>
              下载为表格
            </Button>
            <Button onClick={() => this.props.downLoadImg()}>
              下载为图片
            </Button>
          </div>
        ) : title === 'video' ? (
          <a href="javascript:;" onClick={() => window.open('http://edu.10086.cn/cloud/liveClassroom/redirectLive?type=live_Index')}>
            <img src={edulogo} alt="" height="30px" />
          </a>
        ) : title === 'books' ? (
          <ButtonGroup style={{ marginRight: 20 }}>
            <Button
              type={booksMode === 'masonry' ? 'primary' : 'none'}
              onClick={() => this.props.handleChangeBooksMode('masonry')}
            >
              瀑布流
            </Button>
            <Button
              type={booksMode === 'list' ? 'primary' : 'none'}
              onClick={() => this.props.handleChangeBooksMode('list')}
            >
              列表
            </Button>
          </ButtonGroup>
        ) : null}
      >
        {this.renderChildren(value)}
      </Card>
    )
  }
}
