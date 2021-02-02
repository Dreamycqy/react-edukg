import React from 'react'
import _ from 'lodash'
import { Tree, Input } from 'antd'

const { TreeNode } = Tree
const { Search } = Input

const dataList = []
function generateList(data) {
  for (let i = 0; i < data.length; i++) {
    const node = data[i]
    const { key, children } = node
    dataList.push({ key, title: key, children })
    if (node.children) {
      generateList(node.children)
    }
  }
}

function getParentKey(key, tree) {
  let parentKey
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i]
    if (node.children) {
      if (node.children.some((item) => item.key === key)) {
        parentKey = node.key
      } else if (getParentKey(key, node.children)) {
        parentKey = getParentKey(key, node.children)
      }
    }
  }
  return parentKey
}

class CustomTree extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      expandedKeys: [],
      searchValue: '',
      autoExpandParent: true,
      gData: [],
    }
  }

  UNSAFE_componentWillMount = () => {
    const { gData } = this.props
    if (gData !== undefined && gData.length > 0) {
      this.setState({ gData })
      generateList(gData)
    }
  }

  UNSAFE_componentWillReceiveProps = (nextProps) => {
    const { gData } = nextProps
    if (gData !== undefined && gData.length > 0) {
      this.setState({ gData })
      generateList(gData)
    }
  }

  onSelect = (keys) => {
    const target = _.find(dataList, { title: keys[0] })
    if (target.children) {
      if (target.children.length === 0) {
        this.props.handleExpandGraph({
          name: keys[0],
        })
      }
    }
  }

  onExpand = (expandedKeys) => {
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    })
  }

  onChange = (e) => {
    const { value } = e.target
    const expandedKeys = dataList
      .map((item) => {
        if (item.title.indexOf(value) > -1) {
          return getParentKey(item.key, this.state.gData)
        }
        return null
      })
      .filter((item, i, self) => item && self.indexOf(item) === i)
    this.setState({
      expandedKeys,
      searchValue: value,
      autoExpandParent: true,
    })
  }

  render() {
    const { searchValue, expandedKeys, autoExpandParent, gData } = this.state
    const loop = (data) => data.map((item) => {
      const index = item.title.indexOf(searchValue)
      const beforeStr = item.title.substr(0, index)
      const afterStr = item.title.substr(index + searchValue.length)
      const title = index > -1 ? (
        <span>
          {beforeStr}
          <span style={{ color: '#f50' }}>{searchValue}</span>
          {afterStr}
        </span>
      ) : (
        <span>{item.title}</span>
      )
      if (item.children) {
        return (
          <TreeNode key={item.key} title={title}>
            {loop(item.children)}
          </TreeNode>
        )
      }
      return <TreeNode key={item.key} title={title} />
    })
    return (
      <div>
        <Search style={{ marginBottom: 8, width: 200 }} placeholder="Search" onChange={this.onChange} />
        <Tree
          onExpand={this.onExpand}
          onSelect={this.onSelect}
          expandedKeys={expandedKeys}
          autoExpandParent={autoExpandParent}
        >
          {loop(gData)}
        </Tree>
      </div>
    )
  }
}
export default CustomTree
