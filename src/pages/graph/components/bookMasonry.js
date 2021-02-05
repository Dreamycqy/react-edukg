import React from 'react'
import { message } from 'antd'
import Masonry from 'react-masonry-component'
import { search } from '@/services/edukg'
import Card from './bookCard'

export default class BookMasonry extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      dataSource: [],
      current: 1,
      pageSize: 20,
      total: 0,
    }
  }

  UNSAFE_componentWillMount = () => {
    this.search()
  }

  onScroll = async (e) => {
    if (e.target.scrollTop === this.masonry.scrollHeight - 600) {
      const { current } = this.state
      await this.setState({ current: current + 1 })
      this.search()
    }
  }

  search = async () => {
    const { current, pageSize } = this.state
    const data = await search({
      searchKey: this.props.name,
      curPage: current,
      pageSize,
    })
    if (data.fullsearch) {
      const doc = []
      const video = []
      data.links.results.forEach((e) => {
        e.urilinks.forEach((i) => {
          if (i.sourcetype === '文档') {
            doc.push(i)
          } else {
            video.push(i)
          }
        })
      })
      const { dataSource } = this.state
      await this.setState({
        dataSource: dataSource.concat(data.fullsearch.data.pager.rows),
        current: data.fullsearch.data.pager.curPage,
        pageSize: data.fullsearch.data.pager.pageSize,
        total: data.fullsearch.data.pager.totalCount,
      })
    } else {
      message.error('请求失败！')
    }
  }

  renderItem = (item) => {
    return <Card data={item} />
  }

  render() {
    const { dataSource, total } = this.state
    return (
      <div
        style={{ minHeight: 200, maxHeight: 600, overflowY: 'scroll' }}
        onScroll={this.onScroll}
        ref={(c) => this.masonry = c}
      >
        <Masonry>
          {dataSource.map(this.renderItem)}
        </Masonry>
      </div>
    )
  }
}
