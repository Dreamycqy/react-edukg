import React from 'react'
import { Button, Input, Select } from 'antd'
import { connect } from 'dva'
import { makeOption } from '@/utils/common'
import { kCardSearch } from '@/services/edukg'
import subjectList from '@/constants/subject'

const { TextArea } = Input
const placeholder = '李白（701年－762年） ，字太白，号青莲居士，是唐代伟大的浪漫主义诗人，与杜甫并称为“李杜”，代表作有《望庐山瀑布》《梁甫吟》《静夜思》等多首。'

function mapStateToProps(state) {
  const { locale } = state.global
  return {
    locale,
  }
}
@connect(mapStateToProps)
class Home extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      subject: 'chinese',
      subjectSelect: 'chinese',
      searchKey: '',
      searchKeySelect: '',
      loading: false,
      tags: [],
    }
  }

  handleChangeType = (subject) => {
    this.setState({ subject })
  }

  searchKCard = async () => {
    this.setState({ loading: true })
    if (this.state.searchKey.length === 0) {
      await this.setState({ searchKey: placeholder })
    }
    const { subject, searchKey } = this.state
    await this.setState({
      subjectSelect: subject,
      searchKeySelect: searchKey,
    })
    const data = await kCardSearch({
      course: subject,
      context: searchKey,
    })
    if (data) {
      this.setState({ tags: data.results })
    }
    this.setState({ loading: false })
  }

  handleTagging = (array) => {
    const result = []
    const { subjectSelect, searchKeySelect } = this.state
    let lastIndex = 0
    array.forEach((i) => {
      result.push(<span>{searchKeySelect.substring(lastIndex, i.start_index)}</span>)
      result.push(<a href="javascript:;" onClick={() => this.handleJumpDetail(subjectSelect, i.entity_url)}>{i.entity}</a>)
      lastIndex = i.end_index + 1
    })
    if (lastIndex <= searchKeySelect.length - 1) {
      result.push(<span>{searchKeySelect.substring(lastIndex, searchKeySelect.length)}</span>)
    }
    return result
  }

  handleJumpDetail = (course, uri) => {
    window.open(`/getCard?course=${course}&uri=${encodeURIComponent(uri)}`)
  }

  render() {
    const {
      searchKey, loading, subject, tags,
    } = this.state
    const { locale } = this.props
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'inline-block', marginTop: 30 }}>
          <div style={{ fontSize: 42, marginTop: 16 }}>
            {locale === 'cn' ? '知识卡片' : 'Knowledge Card'}
          </div>
        </div>
        <br />
        <div style={{ display: 'inline-block', textAlign: 'left', width: '70%' }}>
          {locale === 'cn' ? '选择学科：' : 'Select Subject: '}
          <Select
            size="large"
            value={subject}
            onChange={value => this.handleChangeType(value)}
            style={{ width: 120, marginTop: 14, display: 'inline-block' }}
          >
            {makeOption(subjectList[locale])}
          </Select>
          <TextArea
            rows={12}
            value={searchKey}
            placeholder={placeholder}
            onChange={e => this.setState({ searchKey: e.target.value })}
            style={{ width: '100%', marginTop: 10 }}
          />
          <div style={{ textAlign: 'right', width: '100%', marginTop: 10 }}>
            <Button type="primary" onClick={() => this.searchKCard()} loading={loading}>
              {locale === 'cn' ? '提交' : 'Submit'}
            </Button>
          </div>
          <div
            style={{
              width: '100%',
              marginTop: 10,
              border: '1px solid #d9d9d9',
              borderRadius: '6px',
              minHeight: 240,
              padding: 10,
            }}
          >
            {this.handleTagging(tags)}
          </div>
        </div>
      </div>
    )
  }
}

export default Home
